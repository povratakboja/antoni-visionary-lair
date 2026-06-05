import { useMemo } from "react";

// Placeholder images from picsum.photos — replace files in /public/images/ later
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
const IMG_SIZE = 180; // px
const GAP = 16; // px
const STEP = IMG_SIZE + GAP;
const ARC_AMPLITUDE = 28; // px — subtle hill peak

export function ImageGallery() {
  // Duplicate the list so the loop is seamless
  const loop = useMemo(() => [...IMAGES, ...IMAGES], []);

  // Track width = how far we translate before resetting (one full original set)
  const trackShift = IMAGES.length * STEP;
  // Width of the visible window
  const windowWidth = VISIBLE * IMG_SIZE + (VISIBLE - 1) * GAP;

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
      style={{ width: windowWidth, height: IMG_SIZE + ARC_AMPLITUDE * 2 }}
      aria-hidden
    >
      <div
        className="flex items-center h-full animate-conveyor"
        style={{
          gap: `${GAP}px`,
          width: loop.length * STEP,
          ["--shift" as string]: `-${trackShift}px`,
        }}
      >
        {loop.map((src, i) => {
          // Position within the visible window (0..VISIBLE-1), based on index mod VISIBLE
          const slot = i % VISIBLE;
          const t = slot / (VISIBLE - 1); // 0..1
          // Parabolic arc: peak at center (t=0.5)
          const arcY = -ARC_AMPLITUDE * (1 - Math.pow(2 * t - 1, 2));
          return (
            <img
              key={i}
              src={src}
              alt=""
              className="shrink-0 object-cover select-none"
              draggable={false}
              style={{
                width: IMG_SIZE,
                height: IMG_SIZE,
                transform: `translateY(${arcY}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
