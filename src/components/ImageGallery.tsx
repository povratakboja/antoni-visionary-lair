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

const IMG_SIZE = 234;
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

  // Visible travel range: from fully off-screen right (drawX = vw)
  // to fully off-screen left (drawX = -IMG_SIZE). Distance = vw + IMG_SIZE.
  // Keep STEP at travelWidth/IMAGES.length so visual density / speed match before.
  const travelWidth = vw + IMG_SIZE * 2 + 324; // +324 preserves the original inter-image gap
  const STEP = travelWidth / IMAGES.length;
  const travelDistance = vw + IMG_SIZE; // px an image actually crosses on screen
  const travelTime = travelDistance / SPEED; // seconds an image is alive on screen
  const slotPeriod = (IMAGES.length * STEP) / SPEED; // seconds between an image's re-entries

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
