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

export function ImageGallery({ faded = false, active = true }: { faded?: boolean; active?: boolean }) {
  // Doubled loop so there is always an off-screen reservoir on both sides —
  // every image physically enters/exits, none pop into existence mid-screen.
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

  // Visible travel range: from fully off-screen right to fully off-screen left.
  const travelWidth = vw + IMG_SIZE * 2;
  // Per-image spacing preserved so spawn cadence / pause timing stays identical.
  const STEP = travelWidth / IMAGES.length;
  // Full belt length covers the visible range twice so half the images are always
  // parked off-screen waiting to enter — no abrupt wrap inside the viewport.
  const totalWidth = loop.length * STEP;
  const arcCenter = travelWidth / 2;
  const arcHalf = travelWidth / 2;

  useEffect(() => {
    if (!active) return;
    const tick = (t: number) => {
      if (lastTRef.current == null) lastTRef.current = t;
      const dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;
      offsetRef.current = (offsetRef.current + SPEED * dt) % totalWidth;

      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        // Position images along the belt. Belt is twice the visible range,
        // so each image spends half its cycle off-screen (no pop-in).
        let x = i * STEP - offsetRef.current;
        x = ((x % totalWidth) + totalWidth) % totalWidth;
        // Map belt position [0, totalWidth) into a drawing range that stretches
        // from fully off-screen right (drawX = vw) down to fully off-screen left
        // (drawX = -IMG_SIZE). Beyond the visible band the image stays hidden.
        const drawX = vw - x;
        // Hide images outside the visible band entirely so nothing flickers.
        const visible = drawX > -IMG_SIZE * 1.2 && drawX < vw + IMG_SIZE * 0.2;
        el.style.opacity = visible ? "1" : "0";
        const centerX = drawX + IMG_SIZE / 2;
        const norm = (centerX - vw / 2) / (vw / 2 + IMG_SIZE);
        const clamped = Math.max(-1, Math.min(1, norm));
        const arcY = ARC_AMPLITUDE * clamped * clamped;
        // Tilt: leaning into the direction of travel — entering from bottom-right
        // tilts left, peak straight, exiting bottom-left tilts right.
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
  }, [totalWidth, arcCenter, arcHalf, STEP, vw, active]);

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 overflow-hidden pointer-events-none transition-opacity duration-[1200ms] ease-out"
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
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </div>
  );
}
