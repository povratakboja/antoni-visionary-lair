import { useEffect, useMemo, useRef, useState } from "react";

// Images from /public/images/ - referenced directly since public folder is served as root
const IMAGES = [
  '/images/4e0bd6c5-a9c0-4aa2-9801-31ae5e768703_1818x1228.webp',
  '/images/5afc7d94-8fd5-4b37-beb2-162e47328a92_1500x1000.webp',
  '/images/c194d64b-5ee5-4e23-9f26-38c31fc4e5b9_4000x2667.webp',
  '/images/Screenshot_3-6-2026_201654_sunchicaphotography.com.jpeg',
  '/images/Screenshot_3-6-2026_20171_sunchicaphotography.com.jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (1).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (2).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (3).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (5).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30 (6).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.30.jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.31 (1).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.31 (2).jpeg',
  '/images/WhatsApp Image 2026-06-03 at 19.01.31 (3).jpeg',
];

const IMG_SIZE = 304; // 234 * 1.3 (increased by 30%)
const ARC_AMPLITUDE = 90; // depth of the U-curve in px (edges sit this far below the peak)
const MAX_TILT = 12; // max rotation in degrees at the entering/exiting edges
const SPEED = 30; // px per second
const INITIAL_DELAY_S = 1.5; // empty screen pause before the first image enters from the right

export function ImageGallery({ faded = false, active = true }: { faded?: boolean; active?: boolean }) {
  // One pool slot per image. Each slot has its own staggered spawn time and
  // recycles after the previous cycle finishes — so the conveyor is continuous
  // in steady state, while at the start every image enters from the right one by one.
  const loop = useMemo(() => IMAGES, []);
  const itemsRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const startMsRef = useRef<number | null>(null);

  const [vw, setVw] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fixed spacing between images (same as original with 8 images)
  const STEP = IMG_SIZE + 194; // image width + gap between images (324 * 0.6 = 194, reduced by 40%)
  const travelDistance = vw + IMG_SIZE; // px an image actually crosses on screen
  const travelTime = travelDistance / SPEED; // seconds an image is alive on screen
  const slotPeriod = (loop.length * STEP) / SPEED; // seconds between an image's re-entries

  useEffect(() => {
    if (!active) return;
    startMsRef.current = null;

    const tick = (now: number) => {
      if (startMsRef.current == null) startMsRef.current = now;
      const elapsed = (now - startMsRef.current) / 1000;

      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        // Slot i is scheduled to first appear at this absolute time:
        const firstSpawn = INITIAL_DELAY_S + i * (STEP / SPEED);
        const sinceFirst = elapsed - firstSpawn;
        if (sinceFirst < 0) {
          // Hasn't entered yet — keep it fully off-screen and invisible.
          el.style.opacity = "0";
          return;
        }
        // After the first entry, the same slot recycles every slotPeriod.
        const phase = sinceFirst % slotPeriod;
        if (phase > travelTime) {
          // Between exit and next re-entry — parked off-screen.
          el.style.opacity = "0";
          return;
        }
        const drawX = vw - phase * SPEED;
        const centerX = drawX + IMG_SIZE / 2;
        const norm = (centerX - vw / 2) / (vw / 2 + IMG_SIZE);
        const clamped = Math.max(-1, Math.min(1, norm));
        const arcY = ARC_AMPLITUDE * clamped * clamped;
        // Lean into the direction of travel: tilt left while entering on the right,
        // straight at the peak, tilt right while exiting on the left.
        const rot = -clamped * MAX_TILT;
        el.style.opacity = "1";
        el.style.transform = `translate(${drawX}px, ${arcY}px) rotate(${rot}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startMsRef.current = null;
    };
  }, [STEP, vw, active, travelTime, slotPeriod]);

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
