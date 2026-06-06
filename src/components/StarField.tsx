import { useEffect, useRef } from "react";

interface StarFieldProps {
  className?: string;
  style?: React.CSSProperties;
}

const COLORS = [
  // weighted: mostly white / cool blue-white
  "#ffffff", "#ffffff", "#ffffff", "#ffffff",
  "#cce0ff", "#cce0ff", "#cce0ff",
  "#aac8ff", "#aac8ff",
  "#ffd8a8",
  "#88bbff",
];

export function StarField({ className, style }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Faint Milky Way band — vertical, soft purple-brown nebula
      const bandWidth = w * 0.55;
      const bandX = w / 2 - bandWidth / 2;
      const grad = ctx.createLinearGradient(bandX, 0, bandX + bandWidth, 0);
      grad.addColorStop(0, "rgba(60,30,80,0)");
      grad.addColorStop(0.5, "rgba(60,30,80,0.18)");
      grad.addColorStop(1, "rgba(60,30,80,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(bandX, 0, bandWidth, h);

      // Soft nebula blobs along the band
      const blobs = 5;
      for (let i = 0; i < blobs; i++) {
        const cx = w / 2 + (Math.random() - 0.5) * w * 0.25;
        const cy = (h / (blobs + 1)) * (i + 1) + (Math.random() - 0.5) * 60;
        const r = Math.max(w, h) * 0.18;
        const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        rg.addColorStop(0, "rgba(80,40,110,0.12)");
        rg.addColorStop(1, "rgba(60,30,80,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      // Stars
      const count = 900;
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        // bias y slightly toward center band? keep uniform — band provides density visually
        const y = Math.random() * h;

        // size: 80% under 1px, rest up to 2.5px
        const r = Math.random() < 0.8
          ? 0.3 + Math.random() * 0.7
          : 1 + Math.random() * 1.5;

        // opacity: most dim
        const opacity = Math.random() < 0.7
          ? 0.2 + Math.random() * 0.35
          : 0.55 + Math.random() * 0.45;

        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // subtle glow on the brightest stars
        if (r > 1.5 && opacity > 0.7) {
          ctx.globalAlpha = opacity * 0.25;
          ctx.beginPath();
          ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    draw();
    // redraw on resize
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}
    />
  );
}
