import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Same image set as the gallery — replace with /images/*.jpg later if needed.
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

const N_PARTICLES = 70;
// Deep enough that perspective=900 makes far particles ~scale 0.02 (tiny dots).
const FAR_Z = -44000;
const NEAR_Z = 700;
const SPAN = NEAR_Z - FAR_Z;
const RAMP_MS = 5500; // exponential ramp-up
const HOLD_MS = 5500; // peak hyperspace hold
const RUSH_MS = RAMP_MS + HOLD_MS;

type Particle = {
  src: string;
  x: number;
  y: number;
  z: number;
  rot: number;
  size: number;
};

function spawn(initial = false): Particle {
  const ang = Math.random() * Math.PI * 2;
  const r = 100 + Math.random() * 1200;
  // Bias initial particles toward the far plane so they appear as tiny dots.
  const initialZ = FAR_Z + Math.pow(Math.random(), 4) * SPAN;
  return {
    src: IMAGES[Math.floor(Math.random() * IMAGES.length)],
    x: Math.cos(ang) * r,
    y: Math.sin(ang) * r,
    z: initial ? initialZ : FAR_Z + Math.random() * 600,
    rot: (Math.random() - 0.5) * 40,
    size: 180 + Math.random() * 140,
  };
}

type Phase = "rushing" | "fadeBlack" | "holdText" | "tvOff" | "done";

export function Tunnel({ onComplete }: { onComplete: () => void }) {
  const partsRef = useRef<Particle[]>(
    Array.from({ length: N_PARTICLES }, () => spawn(true)),
  );
  const elsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("rushing");

  // Lock scroll + interaction
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

      // Exponential acceleration: almost still → moderate → hyperspace.
      const rampT = Math.min(elapsed / RAMP_MS, 1);
      const eased = Math.pow(rampT, 4); // aggressive exponential curve
      const speed = 40 + eased * 60000; // px/s along z

      const parts = partsRef.current;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.z += speed * dt;
        if (p.z > NEAR_Z) {
          const fresh = spawn(false);
          p.src = fresh.src;
          p.x = fresh.x;
          p.y = fresh.y;
          p.z = fresh.z;
          p.rot = fresh.rot;
          p.size = fresh.size;
        }
        const el = elsRef.current[i];
        if (!el) continue;
        const lateral = Math.hypot(p.x, p.y);
        const near01 = (p.z - FAR_Z) / SPAN; // 0 far, 1 near
        // Lateral blur (periphery) scaled by global speed.
        const lateralBlur =
          Math.max(0, (lateral - 160) / 50) * (0.4 + near01) * (0.4 + eased * 4);
        // Global hyperspace blur grows with speed and is strongest near the camera.
        const speedBlur = Math.pow(eased, 1.5) * 22 * (0.25 + near01);
        const blurAmt = Math.min(48, lateralBlur + speedBlur);
        // Vertical stretch grows with speed → light-streak feel near the camera.
        const stretchY = 1 + Math.pow(eased, 2) * near01 * 6;
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, ${p.z}px) scaleY(${stretchY}) rotate(${p.rot}deg)`;
        el.style.filter = blurAmt > 0.3 ? `blur(${blurAmt}px)` : "none";
        el.style.opacity = String(Math.min(1, near01 * 1.6));
      }

      if (elapsed < RUSH_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("fadeBlack");
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Ending phase machine
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
      {/* Tunnel scene */}
      <div
        className="absolute inset-0"
        style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transformStyle: "preserve-3d", width: 0, height: 0 }}
        >
          {partsRef.current.map((p, i) => (
            <div
              key={i}
              ref={(el) => {
                elsRef.current[i] = el;
              }}
              className="absolute"
              style={{
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                backgroundImage: `url(${p.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                willChange: "transform, filter, opacity",
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
