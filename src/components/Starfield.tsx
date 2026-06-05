import { useEffect, useRef } from "react";

type Props = {
  visible: boolean;
  count?: number;
};

export function Starfield({ visible, count = 3500 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Subtle color tints — mostly white, occasional pale colors.
      const tints = [
        "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff",
        "#ffffff", "#ffffff", "#ffffff",
        "#cbd5ff", // pale blue
        "#fff5d0", // pale yellow
        "#ffd6cf", // pale red
      ];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const roll = Math.random();
        let radius: number;
        let alpha: number;
        if (roll < 0.7) {
          // 70% tiny dim
          radius = Math.random() * 0.6 + 0.2;
          alpha = 0.25 + Math.random() * 0.35;
        } else if (roll < 0.9) {
          // 20% medium
          radius = Math.random() * 0.8 + 0.7;
          alpha = 0.5 + Math.random() * 0.3;
        } else {
          // 10% bright larger
          radius = Math.random() * 1.2 + 1.2;
          alpha = 0.75 + Math.random() * 0.25;
        }
        const color = tints[(Math.random() * tints.length) | 0];
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow for the brightest stars only.
        if (roll >= 0.9) {
          ctx.globalAlpha = alpha * 0.25;
          ctx.beginPath();
          ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-opacity duration-[4000ms] ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}
