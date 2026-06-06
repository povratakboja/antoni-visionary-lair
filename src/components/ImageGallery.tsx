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

const VISIBLE = 3;
const GAP = 0;
const ARC_AMPLITUDE = 90; // depth of the U-curve in px (edges sit this far below the peak)
const MAX_TILT = 23; // max rotation in degrees at the entering/exiting edges
const SPEED = 60; // px per second

export function ImageGallery({ faded = false }: { faded?: boolean }) {
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

  const imgSize = vw / VISIBLE;
  const step = imgSize + GAP;
  const windowWidth = vw;
  const totalWidth = IMAGES.length * step;
  const arcCenter = windowWidth / 2;
  const arcHalf = windowWidth / 2;

  useEffect(() => {
    const tick = (t: number) => {
      if (lastTRef.current == null) lastTRef.current = t;
      const dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;
      offsetRef.current = (offsetRef.current + SPEED * dt) % totalWidth;

      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        // raw x position of the image's left edge inside the window; offset by one
        // step so the leftmost on-screen image starts as "position 1" (entering).
        let x = i * step - offsetRef.current - step;
        x = ((x % totalWidth) + totalWidth) % totalWidth;
        if (x > totalWidth - step) x -= totalWidth;
        const centerX = x + imgSize / 2;
        const norm = (centerX - arcCenter) / arcHalf; // -1..1 across window
        const clamped = Math.max(-1.2, Math.min(1.2, norm));
        const arcY = ARC_AMPLITUDE * clamped * clamped;
        const rot = clamped * MAX_TILT;
        el.style.transform = `translate(${x}px, ${arcY}px) rotate(${rot}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTRef.current = null;
    };
  }, [totalWidth, arcCenter, arcHalf, step, imgSize]);

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-[2500ms] ease-out"
      style={{ width: windowWidth, height: imgSize + ARC_AMPLITUDE * 2, opacity: faded ? 0 : 1 }}
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
              width: imgSize,
              height: imgSize,
              marginTop: -imgSize / 2,
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </div>
  );
}
