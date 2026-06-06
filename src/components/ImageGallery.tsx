import { useEffect, useMemo, useRef, useState } from "react";
import gallery1 from "@/assets/gallery1.jpeg.asset.json";
import gallery2 from "@/assets/gallery2.jpeg.asset.json";
import gallery3 from "@/assets/gallery3.jpeg.asset.json";

// ──────────────────────────────────────────────────────────────
// Swap your image URLs here — paste a new URL to replace any image.
// ──────────────────────────────────────────────────────────────
const IMAGE_1 = gallery1.url;
const IMAGE_2 = gallery2.url;
const IMAGE_3 = gallery3.url;

const IMAGES = [IMAGE_1, IMAGE_2, IMAGE_3];

const IMG_SIZE_VW = 0.28; // each image is a square ~28vw on each side
const GAP_PX = 50; // px gap between images
const ARC_DROP = 180; // px: how much lower side images sit vs center
const MAX_TILT = 28; // degrees at the edges
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

  const imgSize = vw * IMG_VW;
  const step = vw * SLOT_VW;
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
        let x = i * step - offsetRef.current - step;
        x = ((x % totalWidth) + totalWidth) % totalWidth;
        if (x > totalWidth - step) x -= totalWidth;
        const centerX = x + imgSize / 2;
        const norm = (centerX - arcCenter) / arcHalf; // -1..1
        const clamped = Math.max(-1.2, Math.min(1.2, norm));
        const arcY = ARC_DROP * clamped * clamped; // 0 at center, +ARC_DROP at edges
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
      style={{ width: windowWidth, height: imgSize + ARC_DROP * 2, opacity: faded ? 0 : 1 }}
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
