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

const N_PARTICLES = 90;
const FAR_Z = -60000;
const NEAR_Z = 700;
const SPAN = NEAR_Z - FAR_Z;
const RAMP_MS = 6000; // very-slow → hyperspace
const HOLD_MS = 1200;
const RUSH_MS = RAMP_MS + HOLD_MS;

type Particle = {
  src: string;
  x: number;
  y: number;
  z: number;
  rot: number;
  size: number;
  delay: number; // ms before this particle becomes visible
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeParticle(delay: number): Particle {
  const ang = Math.random() * Math.PI * 2;
  const r = 80 + Math.random() * 1100;
  return {
    src: IMAGES[Math.floor(Math.random() * IMAGES.length)],
    x: Math.cos(ang) * r,
    y: Math.sin(ang) * r,
    z: FAR_Z + Math.random() * 400, // start at far plane
    rot: (Math.random() - 0.5) * 40,
    size: 200 + Math.random() * 160,
    delay,
  };
}

type Phase = "rushing" | "fadeBlack" | "holdText" | "tvOff" | "done";

export function Tunnel({ onComplete }: { onComplete: () => void }) {
  // Stagger each particle's start across the full ramp so the pipeline
  // is always populated with images at different distances — never empty,
  // never a sudden pop-in.
  const partsRef = useRef<Particle[]>(
    Array.from({ length: N_PARTICLES }, (_, i) =>
      makeParticle(rand(0, RAMP_MS * 0.85) * (i / N_PARTICLES + 0.2)),
    ),
  );
  const elsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("rushing");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      if (lastTRef.current == null) lastTRef.current = t;
      const elapsed = t - startRef.current;
      const dt = Math.min((t - lastTRef.current) / 1000, 0.05);
      lastTRef.current = t;

      // Steep exponential: barely moves for ~3s, then hyperspace.
      const rampT = Math.min(elapsed / RAMP_MS, 1);
      const eased = Math.pow(rampT, 4);
      const speed = 10 + eased * 90000;

      const parts = partsRef.current;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const el = elsRef.current[i];
        if (!el) continue;

        // Particle not yet spawned: keep invisible at extreme distance.
        if (elapsed < p.delay) {
          el.style.opacity = "0";
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, ${FAR_Z}px) scale(1)`;
          el.style.filter = "none";
          continue;
        }

        p.z += speed * dt;
        if (p.z > NEAR_Z) {
          const fresh = makeParticle(0);
          p.src = fresh.src;
          p.x = fresh.x;
          p.y = fresh.y;
          p.z = FAR_Z + Math.random() * 200;
          p.rot = fresh.rot;
          p.size = fresh.size;
        }

        const near01 = (p.z - FAR_Z) / SPAN; // 0 far → 1 near
        // Radial clarity: center is sharp & opaque, periphery dim & blurred.
        const lateral = Math.hypot(p.x, p.y);
        const centerness = Math.max(0, 1 - lateral / 900); // 1 center → 0 edge
        const baseOpacity = 0.2 + centerness * 0.8; // 0.2 edge → 1.0 center
        // Fade in/out across depth so nothing pops.
        const depthFade = Math.min(1, near01 * 2.2) * Math.min(1, (1 - near01) * 6 + 0.3);
        const opacity = Math.min(1, baseOpacity * depthFade);

        const lateralBlur = (1 - centerness) * (4 + eased * 18);
        const speedBlur = Math.pow(eased, 1.6) * 16 * (0.2 + near01);
        const blur = Math.min(48, lateralBlur + speedBlur);

        const stretchY = 1 + Math.pow(eased, 2) * near01 * 5;

        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, ${p.z}px) scaleY(${stretchY}) rotate(${p.rot}deg)`;
        el.style.filter = blur > 0.3 ? `blur(${blur}px)` : "none";
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
                // Initialize invisible at the far plane — no first-frame pop-in.
                opacity: 0,
                transform: `translate3d(${p.x}px, ${p.y}px, ${FAR_Z}px)`,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "rushing" ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

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
