import { useEffect, useMemo, useRef } from "react";

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

const VISIBLE = 5;
const IMG_SIZE = 180;
const GAP = 16;
const STEP = IMG_SIZE + GAP;
const ARC_AMPLITUDE = 28; // subtle hill height in px
const SPEED = 30; // px per second

export function ImageGallery({ faded = false }: { faded?: boolean }) {
  const loop = useMemo(() => [...IMAGES, ...IMAGES], []);
  const itemsRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const lastTRef = useRef<number | null>(null);

  const windowWidth = VISIBLE * IMG_SIZE + (VISIBLE - 1) * GAP;
  const totalWidth = IMAGES.length * STEP;
  // Center positions span from 0 to windowWidth; arc peaks at windowWidth/2
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
        // raw x position of the image's left edge inside the window
        let x = i * STEP - offsetRef.current;
        // wrap into [-STEP, totalWidth - STEP) so duplicates appear seamlessly
        x = ((x % totalWidth) + totalWidth) % totalWidth;
        if (x > totalWidth - STEP) x -= totalWidth;
        const centerX = x + IMG_SIZE / 2;
        // parabolic arc: 0 at edges, -ARC_AMPLITUDE at center
        const norm = (centerX - arcCenter) / arcHalf; // -1..1 across window
        const arcY = -ARC_AMPLITUDE * Math.max(0, 1 - norm * norm);
        el.style.transform = `translate(${x}px, ${arcY}px)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTRef.current = null;
    };
  }, [totalWidth, arcCenter, arcHalf]);

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden pointer-events-none"
      style={{ width: windowWidth, height: IMG_SIZE + ARC_AMPLITUDE * 2 }}
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
