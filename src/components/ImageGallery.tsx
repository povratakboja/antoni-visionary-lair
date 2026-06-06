import { useEffect, useMemo, useRef, useState } from "react";
import gallery1 from "@/assets/gallery1.jpeg.asset.json";
import gallery2 from "@/assets/gallery2.jpeg.asset.json";
import gallery3 from "@/assets/gallery3.jpeg.asset.json";

// ──────────────────────────────────────────────────────────────
// Swap your image URLs here — paste a new URL to replace any image.
// Add more entries to extend the belt; the animation auto-adapts.
// ──────────────────────────────────────────────────────────────
const IMAGE_1 = gallery1.url;
const IMAGE_2 = gallery2.url;
const IMAGE_3 = gallery3.url;

const IMAGES = [IMAGE_1, IMAGE_2, IMAGE_3];

// ── Motion config ──────────────────────────────────────────────
const VISIBLE = 5;              // exactly 5 images visible at once
const IMG_SIZE_VW = 0.196;      // 30% smaller than previous 0.28
const SIDE_TILT = 25;           // ±deg at entry / exit
const PHASE_STEP = 1 / (VISIBLE - 1); // 0.25 — gap between consecutive images
const CYCLE_SEC = 8;            // seconds for one image to cross entry→exit

export function ImageGallery({ faded = false }: { faded?: boolean }) {
  const loop = useMemo(() => IMAGES.slice(), []);
  const itemsRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const [size, setSize] = useState(() => ({
    vw: typeof window === "undefined" ? 1280 : window.innerWidth,
    vh: typeof window === "undefined" ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () =>
      setSize({ vw: window.innerWidth, vh: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { vw, vh } = size;
  const imgSize = vw * IMG_SIZE_VW;

  // 5 positions evenly spaced across viewport width.
  // t = 0 → left edge, t = 1 → right edge.
  const entryX = -imgSize / 2;
  const exitX = vw - imgSize / 2;
  const centerX = vw / 2 - imgSize / 2;
  const centerY = vh / 2 - imgSize / 2;
  const entryY = vh - imgSize * 0.85; // sits low (below center) at edges

  // Cubic bezier control points (symmetric): linear x, arched y.
  // dx = (exitX-entryX)/3 makes Bx(t) reduce to linear interpolation
  // → perfectly constant horizontal speed.
  const dx = (exitX - entryX) / 3;
  const p0x = entryX,           p0y = entryY;
  const p1x = entryX + dx,      p1y = (4 * centerY - entryY) / 3; // forces peak = centerY
  const p2x = exitX - dx,       p2y = p1y;
  const p3x = exitX,            p3y = entryY;

  // images.length spaced PHASE_STEP apart along the cycle.
  const cycleLen = Math.max(PHASE_STEP, IMAGES.length * PHASE_STEP);

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      const globalPhase = elapsed / CYCLE_SEC;

      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        let u = (globalPhase - i * PHASE_STEP) % cycleLen;
        if (u < 0) u += cycleLen;

        // Visible only while traversing entry→exit (u ∈ [0,1]).
        if (u > 1) {
          el.style.opacity = "0";
          return;
        }

        const t = u;
        const mt = 1 - t;
        const b0 = mt * mt * mt;
        const b1 = 3 * mt * mt * t;
        const b2 = 3 * mt * t * t;
        const b3 = t * t * t;

        const x = b0 * p0x + b1 * p1x + b2 * p2x + b3 * p3x;
        const y = b0 * p0y + b1 * p1y + b2 * p2y + b3 * p3y;
        const rot = (2 * t - 1) * SIDE_TILT;

        el.style.opacity = "1";
        el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, cycleLen]);

  return (
    <div
      className="fixed inset-0 pointer-events-none transition-opacity duration-[2500ms] ease-out"
      style={{ opacity: faded ? 0 : 1 }}
      aria-hidden
    >
      {loop.map((src, i) => (
        <img
          key={i}
          ref={(el) => {
            itemsRef.current[i] = el;
          }}
          src={src}
          alt=""
          draggable={false}
          className="absolute top-0 left-0 object-cover select-none"
          style={{
            width: imgSize,
            height: imgSize,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
