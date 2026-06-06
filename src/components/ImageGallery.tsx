import { useEffect, useMemo, useRef, useState } from "react";

// Placeholder images — replace files in /public/images/ later and swap to /images/xxx.jpg
const IMAGES = [
  "https://picsum.photos/seed/abv1/600/600",
  "https://picsum.photos/seed/abv2/600/600",
  "https://picsum.photos/seed/abv3/600/600",
  "https://picsum.photos/seed/abv4/600/600",
  "https://picsum.photos/seed/abv5/600/600",
  "https://picsum.photos/seed/abv6/600/600",
  "https://picsum.photos/seed/abv7/600/600",
  "https://picsum.photos/seed/abv8/600/600",
];

const IMG_SIZE = 180;
const ARC_AMPLITUDE = 90; // depth of the U-curve in px (edges sit this far below the peak)
const MAX_TILT = 12; // max rotation in degrees at the entering/exiting edges
const SPEED = 30; // px per second
const INITIAL_DELAY_S = 1.5; // empty screen pause before the first image enters from the right

export function ImageGallery({ faded = false, active = true }: { faded?: boolean; active?: boolean }) {
  // Triple the loop so the belt has a deep parking band: every image starts off-screen
  // and marches into view one at a time at the same cadence as the steady-state conveyor.
  const loop = useMemo(() => [...IMAGES, ...IMAGES, ...IMAGES], []);
  const itemsRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const offsetRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);

  const [vw, setVw] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Visible travel range: from fully off-screen right to fully off-screen left.
  const travelWidth = vw + IMG_SIZE * 2;
  // Per-image spacing preserved so spawn cadence / pause timing stays identical.
  const STEP = travelWidth / IMAGES.length;
  // Belt is long enough that all images can wait off-screen-left before their turn.
  const totalWidth = loop.length * STEP;

  useEffect(() => {
    if (!active) return;
    // Seed the belt so image 0 is INITIAL_DELAY_S away from the right-edge entry point,
    // and every other image is one STEP further back in the parking band (off-screen left).
    offsetRef.current = totalWidth - INITIAL_DELAY_S * SPEED;
    lastTRef.current = null;

    const tick = (t: number) => {
      if (lastTRef.current == null) lastTRef.current = t;
      const dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;
      const off = ((offsetRef.current ?? 0) + SPEED * dt) % totalWidth;
      offsetRef.current = off;

      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        // Reverse indexing: image i=0 enters first, i=1 enters STEP/SPEED later, etc.
        let x = off - i * STEP;
        x = ((x % totalWidth) + totalWidth) % totalWidth;
        // drawX = vw  → image right edge just off the right of the viewport (about to enter)
        // drawX = -IMG_SIZE → image just exited off the left edge.
        const drawX = vw - x;
        const visible = drawX > -IMG_SIZE * 1.2 && drawX < vw + IMG_SIZE * 0.2;
        el.style.opacity = visible ? "1" : "0";
        const centerX = drawX + IMG_SIZE / 2;
        const norm = (centerX - vw / 2) / (vw / 2 + IMG_SIZE);
        const clamped = Math.max(-1, Math.min(1, norm));
        const arcY = ARC_AMPLITUDE * clamped * clamped;
        // Lean into the direction of travel: tilt left while entering on the right,
        // straight at the peak, tilt right while exiting on the left.
        const rot = -clamped * MAX_TILT;
        el.style.transform = `translate(${drawX}px, ${arcY}px) rotate(${rot}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = null;
    };
  }, [totalWidth, STEP, vw, active]);

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none transition-opacity duration-[2500ms] ease-out"
      style={{ width: "100vw", height: IMG_SIZE + ARC_AMPLITUDE * 2, opacity: !active || faded ? 0 : 1 }}
      aria-hidden
    >
      <div className="relative w-full h-full">
        {loop.map((src, i) => (
          <img
            key={i}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            src={src}
            alt=""
            draggable={false}
            className="absolute top-1/2 left-0 object-cover select-none"
            style={{
              width: IMG_SIZE,
              height: IMG_SIZE,
              marginTop: -IMG_SIZE / 2,
              opacity: 0,
              transform: `translate(${-IMG_SIZE * 2}px, 0)`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    </div>
  );
}
