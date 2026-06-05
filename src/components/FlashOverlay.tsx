import { useEffect, useRef } from "react";

type Props = {
  flashKey: number;
  intensity: number; // 0..1
};

export function FlashOverlay({ flashKey, intensity }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (flashKey === 0) return;
    const el = ref.current;
    if (!el) return;
    // Animate to peak intensity, then back to 0
    el.style.transition = "opacity 80ms ease-out";
    el.style.opacity = String(intensity);
    const t = window.setTimeout(() => {
      el.style.transition = "opacity 260ms ease-out";
      el.style.opacity = "0";
    }, 90);
    return () => window.clearTimeout(t);
  }, [flashKey, intensity]);

  return (
    <div
      id="flash-overlay"
      aria-hidden
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "white",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0,
      }}
    />
  );
}
