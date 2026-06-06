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

export function ImageGallery({
  faded = false,
  start = true,
}: {
  faded?: boolean;
  start?: boolean;
}) {
  const loop = useMemo(() => [...IMAGES, ...IMAGES], []);
  const itemsRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const lastTRef = useRef<number | null>(null);

  const [vw, setVw] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Travel range spans the full viewport plus an off-screen buffer on each side
  // so images enter fully hidden from the left and exit fully hidden to the right.
  const travelWidth = vw + IMG_SIZE * 2;
  // Keep per-image spacing identical to before so spawn timing / pause cadence are unchanged.
  const STEP = travelWidth / IMAGES.length;
  const totalWidth = IMAGES.length * STEP;
  const arcCenter = travelWidth / 2;
  const arcHalf = travelWidth / 2;

  useEffect(() => {
    if (!start) return;
    const tick = (t: number) => {
      if (lastTRef.current == null) lastTRef.current = t;
      const dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;
      offsetRef.current = (offsetRef.current + SPEED * dt) % totalWidth;

      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        // raw x position of the image's left edge inside the travel range
        let x = i * STEP - offsetRef.current;
        x = ((x % totalWidth) + totalWidth) % totalWidth;
        if (x > totalWidth - STEP) x -= totalWidth;
        // shift so x=0 means fully off-screen left (image right edge at viewport left edge)
        const drawX = x - IMG_SIZE;
        const centerX = x + IMG_SIZE / 2;
        const norm = (centerX - arcCenter) / arcHalf; // -1..1 across travel
        const clamped = Math.max(-1, Math.min(1, norm));
        // smoothstep on |t| → zero slope at peak AND at edges, rounding the corners
        const u = Math.abs(clamped);
        const eased = u * u * (3 - 2 * u);
        const arcY = ARC_AMPLITUDE * eased;
        const rot = Math.sign(clamped) * MAX_TILT * eased;
        el.style.transform = `translate(${drawX}px, ${arcY}px) rotate(${rot}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTRef.current = null;
    };
  }, [totalWidth, arcCenter, arcHalf, STEP, start]);

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none transition-opacity duration-[2500ms] ease-out"
      style={{ width: "100vw", height: IMG_SIZE + ARC_AMPLITUDE * 2, opacity: faded ? 0 : 1 }}
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
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </div>
  );
}
