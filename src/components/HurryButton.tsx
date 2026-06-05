import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onAllowedClick: (nextCount: number) => void;
  onHoverFlash: () => void;
  disabled?: boolean;
};

const HOVER_LOCKOUT_MS = 2000;

export function HurryButton({ onAllowedClick, onHoverFlash, disabled }: Props) {
  const [locked, setLocked] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const lockTimerRef = useRef<number | null>(null);
  const unlockedRef = useRef(true); // true when hover has elapsed lockout

  const handleEnter = useCallback(() => {
    if (disabled) return;
    onHoverFlash();
    setLocked(true);
    unlockedRef.current = false;
    if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = window.setTimeout(() => {
      setLocked(false);
      unlockedRef.current = true;
    }, HOVER_LOCKOUT_MS);
  }, [disabled, onHoverFlash]);

  const handleLeave = useCallback(() => {
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    setLocked(false);
    unlockedRef.current = true;
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (!unlockedRef.current) return; // within lockout
    const next = clickCount + 1;
    setClickCount(next);
    onAllowedClick(next);
  }, [clickCount, disabled, onAllowedClick]);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      disabled={disabled}
      className="bg-transparent border-0 p-0 text-[11px] tracking-[0.18em] lowercase text-foreground/80 hover:text-foreground transition-colors"
      style={{ cursor: disabled ? "default" : locked ? "not-allowed" : "pointer" }}
    >
      <span className="underline underline-offset-4 decoration-foreground/30">
        hurry up
      </span>
    </button>
  );
}
