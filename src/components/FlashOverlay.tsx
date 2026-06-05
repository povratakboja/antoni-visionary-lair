import { useEffect, useState } from "react";

type Props = {
  flashKey: number;
  intensity: number; // 0..1
};

export function FlashOverlay({ flashKey, intensity }: Props) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (flashKey === 0) return;
    setOpacity(intensity);
    const t = window.setTimeout(() => setOpacity(0), 90);
    return () => window.clearTimeout(t);
  }, [flashKey, intensity]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] bg-white transition-opacity"
      style={{
        opacity,
        transitionDuration: opacity === 0 ? "260ms" : "80ms",
      }}
    />
  );
}
