import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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

// Shuffle array for random image order
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const N_PARTICLES = 50;
const FAR_Z = -5000; // Closer so images arrive faster
const NEAR_Z = 800;
const SPAN = NEAR_Z - FAR_Z;
const INITIAL_DELAY_MS = 1500;
const CALM_SPEED = 2500; // Faster so images appear sooner
const IMAGES_BEFORE_RUSH = 4;
const ACCEL_MS = 6000;
const HOLD_MS = 5500;
const RUSH_MS = ACCEL_MS + HOLD_MS;

type Particle = {
  src: string;
  z: number;
  counted: boolean;
};

let imagePool: string[] = [];
let poolIndex = 0;

function getNextImage(): string {
  if (poolIndex >= imagePool.length) {
    imagePool = shuffleArray(IMAGES);
    poolIndex = 0;
  }
  return imagePool[poolIndex++];
}

function spawn(initial = false): Particle {
  const spawnZ = FAR_Z + Math.random() * (initial ? SPAN * 0.7 : 800);
  return {
    src: getNextImage(),
    z: spawnZ,
    counted: false,
  };
}

type Phase = "rushing" | "fadeBlack" | "holdText" | "tvOff" | "done";

export function Tunnel({ onComplete }: { onComplete: () => void }) {
  imagePool = shuffleArray(IMAGES);
  poolIndex = 0;

  const partsRef = useRef<Particle[]>(
    Array.from({ length: N_PARTICLES }, () => spawn(true)),
  );
  const elsRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);
  const passedCountRef = useRef<number>(0);
  const accelStartRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("rushing");

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // RAF loop
  useEffect(() => {
    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      if (lastTRef.current == null) lastTRef.current = t;
      const elapsed = t - startRef.current;
      const dt = Math.min((t - lastTRef.current) / 1000, 0.05);
      lastTRef.current = t;

      const showImages = elapsed > INITIAL_DELAY_MS;
      const inCalmPhase = passedCountRef.current < IMAGES_BEFORE_RUSH;

      let speed = CALM_SPEED;
      let eased = 0;

      if (!inCalmPhase) {
        if (accelStartRef.current == null) {
          accelStartRef.current = t;
        }
        const accelElapsed = t - accelStartRef.current;
        const rampT = Math.min(accelElapsed / ACCEL_MS, 1);
        eased = Math.pow(rampT, 4);
        speed = CALM_SPEED + eased * 35000;
      }

      const parts = partsRef.current;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        if (showImages) {
          p.z += speed * dt;
        }

        if (p.z > NEAR_Z) {
          if (!p.counted) {
            passedCountRef.current += 1;
            p.counted = true;
          }

          const fresh = spawn(false);
          p.src = fresh.src;
          p.z = fresh.z;
          p.counted = false;
        }

        const el = elsRef.current[i];
        if (!el) continue;

        // Progress from far (0) to near (1)
        const progress = Math.max(0, Math.min(1, (p.z - FAR_Z) / SPAN));

        // Scale from tiny point to full size - ensure minimum visibility
        const scale = Math.max(0.05, Math.pow(progress, 0.5) * 1.5);

        // Slight blur when accelerating
        const blur = inCalmPhase ? 0 : eased * progress * 8;

        // Use simpler transform without translate3d z (handled by perspective)
        el.style.transform = `translateZ(${p.z}px) scale(${scale})`;
        el.style.filter = `blur(${blur}px)`;

        // More aggressive opacity - show images sooner
        const opacity = showImages ? Math.min(1, Math.max(0, (progress - 0.05) * 3)) : 0;
        el.style.opacity = String(opacity);
      }

      if (accelStartRef.current && (t - accelStartRef.current) > RUSH_MS) {
        setPhase("fadeBlack");
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "fadeBlack") {
      const t = window.setTimeout(() => setPhase("holdText"), 900);
      return () => window.clearTimeout(t);
    }
    if (phase === "holdText") {
      const t = window.setTimeout(() => setPhase("tvOff"), 5000);
      return () => window.clearTimeout(t);
    }
    if (phase === "tvOff") {
      const t = window.setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 950);
      return () => window.clearTimeout(t);
    }
  }, [phase, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9000] overflow-hidden"
      style={{ pointerEvents: "all", cursor: "none" }}
      aria-hidden
    >
      {/* Warp tunnel container */}
      <div
        className="warp absolute inset-0"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Tunnel grid sides - Top */}
        <div
          className="warp__side warp__side--top absolute"
          style={{
            top: 0,
            left: "10%",
            right: "10%",
            height: "40%",
            transformOrigin: "50% 100%",
            transform: "rotateX(60deg)",
            transformStyle: "preserve-3d",
            background: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(100, 100, 255, 0.15) 40px, rgba(100, 100, 255, 0.15) 42px)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(100, 100, 255, 0.15) 40px, rgba(100, 100, 255, 0.15) 42px)",
            }}
          />
        </div>

        {/* Tunnel grid sides - Bottom */}
        <div
          className="warp__side warp__side--bottom absolute"
          style={{
            bottom: 0,
            left: "10%",
            right: "10%",
            height: "40%",
            transformOrigin: "50% 0%",
            transform: "rotateX(-60deg)",
            transformStyle: "preserve-3d",
            background: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(100, 100, 255, 0.15) 40px, rgba(100, 100, 255, 0.15) 42px)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(100, 100, 255, 0.15) 40px, rgba(100, 100, 255, 0.15) 42px)",
            }}
          />
        </div>

        {/* Tunnel grid sides - Left */}
        <div
          className="warp__side warp__side--left absolute"
          style={{
            left: 0,
            top: "10%",
            bottom: "10%",
            width: "40%",
            transformOrigin: "100% 50%",
            transform: "rotateY(60deg)",
            transformStyle: "preserve-3d",
            background: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(100, 100, 255, 0.15) 40px, rgba(100, 100, 255, 0.15) 42px)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(100, 100, 255, 0.15) 40px, rgba(100, 100, 255, 0.15) 42px)",
            }}
          />
        </div>

        {/* Tunnel grid sides - Right */}
        <div
          className="warp__side warp__side--right absolute"
          style={{
            right: 0,
            top: "10%",
            bottom: "10%",
            width: "40%",
            transformOrigin: "0% 50%",
            transform: "rotateY(-60deg)",
            transformStyle: "preserve-3d",
            background: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(100, 100, 255, 0.15) 40px, rgba(100, 100, 255, 0.15) 42px)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(100, 100, 255, 0.15) 40px, rgba(100, 100, 255, 0.15) 42px)",
            }}
          />
        </div>

        {/* Images flying through tunnel center */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transformStyle: "preserve-3d", width: 0, height: 0 }}
        >
          {partsRef.current.map((p, i) => (
            <img
              key={i}
              ref={(el) => {
                elsRef.current[i] = el;
              }}
              src={p.src}
              alt=""
              draggable={false}
              className="absolute object-cover select-none rounded-lg"
              style={{
                width: 240,
                height: 240,
                marginLeft: -120,
                marginTop: -120,
                willChange: "transform, opacity, filter",
                opacity: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Black fade-in once rushing ends */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "rushing" ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Text layer + CRT TV-off collapse */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black"
        style={{ transformOrigin: "50% 50%" }}
        initial={{ opacity: 0, scaleX: 1, scaleY: 1 }}
        animate={
          phase === "holdText"
            ? { opacity: 1, scaleX: 1, scaleY: 1 }
            : phase === "tvOff"
              ? {
                  opacity: [1, 1, 1, 0],
                  scaleY: [1, 0.004, 0.004, 0],
                  scaleX: [1, 1, 0.001, 0],
                  boxShadow: [
                    "0 0 0 rgba(255,255,255,0)",
                    "0 0 40px 8px rgba(255,255,255,0.9)",
                    "0 0 60px 4px rgba(255,255,255,0.9)",
                    "0 0 0 rgba(255,255,255,0)",
                  ],
                }
              : phase === "fadeBlack"
                ? { opacity: 0 }
                : { opacity: 0 }
        }
        transition={
          phase === "tvOff"
            ? { duration: 0.9, times: [0, 0.45, 0.85, 1], ease: "easeInOut" }
            : { duration: 0.5, ease: "easeInOut" }
        }
      >
        <span
          className="font-serif italic text-white"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          Good things don't last..
        </span>
      </motion.div>
    </div>
  );
}
