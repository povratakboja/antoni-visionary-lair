import { useEffect } from "react";

type Props = {
  flashKey: number;
  intensity: number; // 0..1
  multiplier?: number; // duration multiplier (1 = base)
  targetId?: string;
};

export function FlashOverlay({
  flashKey,
  intensity,
  multiplier = 1,
  targetId = "page-wrapper",
}: Props) {
  useEffect(() => {
    if (flashKey === 0) return;
    const el = document.getElementById(targetId);
    if (!el) return;

    const fadeIn = Math.round(80 * multiplier);
    const peak = Math.round(90 * multiplier);
    const fadeOut = Math.round(260 * multiplier);

    const brightness = 1 + intensity * 1.5;
    el.style.transition = `filter ${fadeIn}ms ease-out`;
    el.style.filter = `brightness(${brightness})`;
    const t = window.setTimeout(() => {
      el.style.transition = `filter ${fadeOut}ms ease-out`;
      el.style.filter = "brightness(1)";
    }, peak);
    return () => window.clearTimeout(t);
  }, [flashKey, intensity, multiplier, targetId]);

  return null;
}
