import { useEffect } from "react";

type Props = {
  flashKey: number;
  intensity: number; // 0..1
  targetId?: string;
};

export function FlashOverlay({ flashKey, intensity, targetId = "page-wrapper" }: Props) {
  useEffect(() => {
    if (flashKey === 0) return;
    const el = document.getElementById(targetId);
    if (!el) return;
    const brightness = 1 + intensity * 1.5;
    el.style.transition = "filter 80ms ease-out";
    el.style.filter = `brightness(${brightness})`;
    const t = window.setTimeout(() => {
      el.style.transition = "filter 260ms ease-out";
      el.style.filter = "brightness(1)";
    }, 90);
    return () => window.clearTimeout(t);
  }, [flashKey, intensity, targetId]);

  return null;
}
