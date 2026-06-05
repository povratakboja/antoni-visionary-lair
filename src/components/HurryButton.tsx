import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onAllowedClick: (nextCount: number) => void;
  onHoverFlash: () => void;
  disabled?: boolean;
};

const HOVER_LOCKOUT_MS = 2000;

export function HurryButton({ onAllowedClick, onHoverFlash, disabled }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const timerStartedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const handleEnter = useCallback(() => {
    if (disabled) return;
    onHoverFlash();
    // Start the one-shot 2s timer only on the very first hover. Never reset.
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      timerRef.current = window.setTimeout(() => {
        setUnlocked(true);
      }, HOVER_LOCKOUT_MS);
    }
  }, [disabled, onHoverFlash]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (!unlocked) return;
    const next = clickCount + 1;
    setClickCount(next);
    onAllowedClick(next);
  }, [clickCount, disabled, onAllowedClick, unlocked]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      onMouseEnter={handleEnter}
      onClick={handleClick}
      disabled={disabled}
      className="bg-transparent border-0 p-0 text-[11px] tracking-[0.18em] lowercase text-foreground/80 hover:text-foreground transition-colors"
      style={{ cursor: disabled ? "default" : unlocked ? "pointer" : "not-allowed" }}
    >
      <span className="underline underline-offset-4 decoration-foreground/30">
        hurry up
      </span>
    </button>
  );
}
