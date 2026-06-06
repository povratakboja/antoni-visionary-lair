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

// Geometry / motion config
const IMG_SIZE_VW = 0.28;       // square side length
const APPROACH_ANGLE = 50;      // degrees from horizontal for climb/descent
const SIDE_TILT = 25;           // degrees rotation while climbing/descending
const OFFSCREEN_PAD = 50;       // px below viewport at entry/exit
const FLAT_RATIO = 0.15;        // share of cycle spent flat at center
const CLIMB_RATIO = 0.425;      // share climbing  (CLIMB + FLAT + DESCEND = 1)
const DESCEND_RATIO = 0.425;    // share descending
const PHASE_OFFSET = 0.5;       // cycle-units between successive images entering
const CYCLE_SEC = 6;            // total seconds for one image: entry → exit

export function ImageGallery({ faded = false }: { faded?: boolean }) {
  // One slot per source image; phase offsets keep them spaced along the arc.
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

  // Top-left coords for an image positioned at viewport center.
  const centerX = vw / 2 - imgSize / 2;
  const centerY = vh / 2 - imgSize / 2;

  // Entry/exit: image fully below the viewport, then derive horizontal
  // offset from the 50° approach angle.
  const entryY = vh + OFFSCREEN_PAD;
  const climbDy = entryY - centerY;
  const tan = Math.tan((APPROACH_ANGLE * Math.PI) / 180);
  const climbDx = climbDy / tan;
  const entryX = centerX - climbDx;
  const exitX = centerX + climbDx;
  const exitY = entryY;

  // Flat segment: a short horizontal pass through the center.
  const flatDist = imgSize * 0.25;
  const flatStartX = centerX - flatDist / 2;
  const flatEndX = centerX + flatDist / 2;

  const cycleLen = Math.max(1, IMAGES.length * PHASE_OFFSET);

  useEffect(() => {
    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const elapsed = (t - startRef.current) / 1000;
      const globalPhase = elapsed / CYCLE_SEC;

      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        let u = (globalPhase - i * PHASE_OFFSET) % cycleLen;
        if (u < 0) u += cycleLen;

        // u in [0,1] = on-screen cycle; beyond 1 = waiting off-screen.
        if (u > 1) {
          el.style.opacity = "0";
          el.style.transform = `translate(${entryX}px, ${entryY}px) rotate(-${SIDE_TILT}deg)`;
          return;
        }

        let x: number;
        let y: number;
        let rot: number;

        if (u < CLIMB_RATIO) {
          const k = u / CLIMB_RATIO;
          x = entryX + (flatStartX - entryX) * k;
          y = entryY + (centerY - entryY) * k;
          rot = -SIDE_TILT;
        } else if (u < CLIMB_RATIO + FLAT_RATIO) {
          const k = (u - CLIMB_RATIO) / FLAT_RATIO;
          // Smooth rotation in/out so it's not a hard snap.
          x = flatStartX + (flatEndX - flatStartX) * k;
          y = centerY;
          const ease = Math.sin(k * Math.PI); // 0 → 1 → 0
          // ease=1 at midpoint → fully upright; edges blend toward tilt.
          const edge = 1 - ease;
          const sign = k < 0.5 ? -1 : 1;
          rot = sign * SIDE_TILT * edge * 0.4;
        } else {
          const k = (u - CLIMB_RATIO - FLAT_RATIO) / DESCEND_RATIO;
          x = flatEndX + (exitX - flatEndX) * k;
          y = centerY + (exitY - centerY) * k;
          rot = SIDE_TILT;
        }

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
  }, [
    entryX,
    entryY,
    exitX,
    exitY,
    centerY,
    flatStartX,
    flatEndX,
    cycleLen,
  ]);

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
