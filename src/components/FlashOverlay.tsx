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
      className="pointer-events-none fixed inset-0 bg-white"
      style={{
        zIndex: 2147483646,
        opacity,
        transition: `opacity ${opacity === 0 ? 260 : 80}ms ease-out`,
      }}
    />
  );
}
