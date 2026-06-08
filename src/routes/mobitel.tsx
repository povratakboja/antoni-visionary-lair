import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navigation } from "@/components/Navigation";
import { ImageGallery } from "@/components/ImageGallery";
import { HurryButton } from "@/components/HurryButton";
import { FlashOverlay } from "@/components/FlashOverlay";
import { TunnelMobile } from "@/components/TunnelMobile";
import { StarField } from "@/components/StarField";

export const Route = createFileRoute("/mobitel")({
  head: () => ({
    meta: [
      { title: "ˈvɪʒəˌnɛɹi — Antoni Bonačić Vičić (Mobitel)" },
      { name: "description", content: "Personal brand website of Antoni Bonačić Vičić." },
      { property: "og:title", content: "ˈvɪʒəˌnɛɹi — Antoni Bonačić Vičić" },
      { property: "og:description", content: "Personal brand website of Antoni Bonačić Vičić." },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" },
    ],
  }),
  component: Mobitel,
});

const QUOTES: Record<number, string> = {
  1: "Good things don't last but are worth waiting for.",
  2: "Good things are worth waiting for but they expire too fast if we rush them",
};




function Mobitel() {
  const [isLoading, setIsLoading] = useState(true);
  const [heroDone, setHeroDone] = useState(false);
  const [quote, setQuote] = useState<{ text: string; index: 1 | 2 } | null>(null);
  const [deepSpace, setDeepSpace] = useState(false);
  const [galleryFaded, setGalleryFaded] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [flashIntensity, setFlashIntensity] = useState(0);
  const [flashMultiplier, setFlashMultiplier] = useState(1);
  const [showTunnel, setShowTunnel] = useState(false);
  const navigate = useNavigate();

  const handleLoadingComplete = useCallback(() => {
    // Hero intro fully finished (loading screen exit animation done) —
    // only now is it safe to start the gallery belt.
    setIsLoading(false);
    setHeroDone(true);
  }, []);

  const triggerFlash = useCallback((intensity: number, multiplier = 1) => {
    setFlashIntensity(intensity);
    setFlashMultiplier(multiplier);
    setFlashKey((k) => k + 1);
  }, []);

  // No hover effects on mobile - empty callback
  const handleHoverFlash = useCallback(() => {
    // Mobile: no hover interaction
  }, []);

  const handleClick = useCallback(
    (n: number) => {
      if (n === 1) {
        triggerFlash(0.45, 1.25);
        setQuote({ text: QUOTES[1], index: 1 });
      } else if (n === 2) {
        triggerFlash(0.7, 1.5);
        setQuote({ text: QUOTES[2], index: 2 });
      } else if (n >= 3) {
        triggerFlash(0.95, 1.75);
        setDeepSpace(true);
        setQuote(null);
        // begin gallery fade alongside background transition
        window.setTimeout(() => setGalleryFaded(true), 50);
        // Launch tunnel with smooth cross dissolve delay
        window.setTimeout(() => setShowTunnel(true), 2000);
      }
    },
    [triggerFlash],
  );

  const handleTunnelComplete = useCallback(() => {
    navigate({ to: "/not-found" });
  }, [navigate]);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div
        id="page-wrapper"
        className="relative min-h-screen overflow-hidden touch-none"
        style={{
          backgroundColor: "#EDE8DF",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        {/* Paper texture overlay - fine grain noise */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
            mixBlendMode: "multiply",
            opacity: 0.3,
          }}
        />

        {/* Subtle vignette - darker edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background: "radial-gradient(circle at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.05) 80%, rgba(0, 0, 0, 0.15) 100%)",
          }}
        />

        {/* Cross dissolve overlay - smooth transition to black */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: deepSpace ? 1 : 0, zIndex: 2 }}
        />


        <Navigation />
        {/* Gallery - view only, no swipe/scroll on mobile */}
        <div style={{ touchAction: "none", pointerEvents: "none" }}>
          <ImageGallery faded={galleryFaded} active={heroDone} />
        </div>

        {/* Button — centered below the gallery strip - mobile optimized positioning */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[clamp(120px,30vh,180px)] flex flex-col items-center text-center">
          <HurryButton
            onAllowedClick={handleClick}
            onHoverFlash={handleHoverFlash}
            disabled={deepSpace}
          />
        </div>

        {/* Quote — fixed, centered in viewport - mobile optimized */}
        {quote && (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-6">
            <p
              className="max-w-3xl text-center font-serif italic leading-tight transition-colors"
              style={
                quote.index === 2
                  ? {
                      fontSize: "clamp(1.5rem, 5vw, 3.75rem)",
                      color: deepSpace ? "#e8e8f0" : "#1a1a1a",
                      background: "rgba(237, 232, 223, 0.85)",
                      padding: "clamp(1rem, 4vw, 2rem) clamp(1.5rem, 6vw, 3rem)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                    }
                  : {
                      fontSize: "clamp(1.25rem, 4vw, 2.5rem)",
                      color: deepSpace ? "#e8e8f0" : "#1a1a1a",
                    }
              }
            >
              {quote.text}
            </p>
          </div>
        )}

        <FlashOverlay flashKey={flashKey} intensity={flashIntensity} multiplier={flashMultiplier} />
      </div>
      {showTunnel && <TunnelMobile onComplete={handleTunnelComplete} />}
    </>
  );
}
