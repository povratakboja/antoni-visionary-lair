import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navigation } from "@/components/Navigation";
import { ImageGallery } from "@/components/ImageGallery";
import { HurryButton } from "@/components/HurryButton";
import { FlashOverlay } from "@/components/FlashOverlay";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ˈvɪʒəˌnɛɹi — Antoni Bonačić Vičić" },
      { name: "description", content: "Personal brand website of Antoni Bonačić Vičić." },
      { property: "og:title", content: "ˈvɪʒəˌnɛɹi — Antoni Bonačić Vičić" },
      { property: "og:description", content: "Personal brand website of Antoni Bonačić Vičić." },
    ],
  }),
  component: Index,
});

const QUOTES: Record<number, string> = {
  1: "Good things don't last but are worth waiting for.",
  2: "Good things are worth waiting for but they expire too fast if we rush them",
};

function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState<{ text: string; index: 1 | 2 } | null>(null);
  const [deepSpace, setDeepSpace] = useState(false);
  const [galleryFaded, setGalleryFaded] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [flashIntensity, setFlashIntensity] = useState(0);

  const handleLoadingComplete = useCallback(() => setIsLoading(false), []);

  const triggerFlash = useCallback((intensity: number) => {
    setFlashIntensity(intensity);
    setFlashKey((k) => k + 1);
  }, []);

  const handleHoverFlash = useCallback(() => triggerFlash(0.18), [triggerFlash]);

  const handleClick = useCallback(
    (n: number) => {
      if (n === 1) {
        triggerFlash(0.45);
        setQuote(QUOTES[1]);
      } else if (n === 2) {
        triggerFlash(0.7);
        setQuote(QUOTES[2]);
      } else if (n >= 3) {
        triggerFlash(0.95);
        setDeepSpace(true);
        // begin gallery fade alongside background transition
        window.setTimeout(() => setGalleryFaded(true), 50);
        // TODO: trigger tunnel sequence after images fully faded (next prompt)
      }
    },
    [triggerFlash],
  );

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div className="relative min-h-screen overflow-hidden bg-[#F5F2EE]">
        {/* Deep space layer fades in over the off-white */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-[4000ms] ease-in-out"
          style={{
            opacity: deepSpace ? 1 : 0,
            background:
              "radial-gradient(ellipse at 20% 30%, rgba(80,40,140,0.25), transparent 55%)," +
              "radial-gradient(ellipse at 75% 70%, rgba(20,60,140,0.3), transparent 60%)," +
              "radial-gradient(circle at 50% 50%, #050814 0%, #02030a 70%, #000000 100%)",
          }}
        />
        {/* Stars layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-[4000ms] ease-in-out"
          style={{
            opacity: deepSpace ? 1 : 0,
            backgroundImage:
              "radial-gradient(1px 1px at 12% 18%, #ffffff, transparent)," +
              "radial-gradient(1px 1px at 27% 62%, #cbd5ff, transparent)," +
              "radial-gradient(1.5px 1.5px at 44% 31%, #ffd9a8, transparent)," +
              "radial-gradient(1px 1px at 61% 78%, #ffffff, transparent)," +
              "radial-gradient(1px 1px at 73% 22%, #b8c7ff, transparent)," +
              "radial-gradient(1.5px 1.5px at 86% 55%, #ffb8c8, transparent)," +
              "radial-gradient(1px 1px at 8% 84%, #ffffff, transparent)," +
              "radial-gradient(1px 1px at 35% 9%, #fff5d0, transparent)," +
              "radial-gradient(1px 1px at 53% 47%, #ffffff, transparent)," +
              "radial-gradient(1px 1px at 92% 88%, #d6e0ff, transparent)",
          }}
        />

        <Navigation />
        <ImageGallery faded={galleryFaded} />

        {/* Button — centered below the gallery strip */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[180px] flex flex-col items-center text-center">
          <HurryButton
            onAllowedClick={handleClick}
            onHoverFlash={handleHoverFlash}
            disabled={deepSpace}
          />
        </div>

        {/* Quote — fixed, centered in viewport */}
        {quote && (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-6">
            <p
              className="max-w-3xl text-center font-serif italic leading-tight transition-colors"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: deepSpace ? "#e8e8f0" : "#1a1a1a",
              }}
            >
              {quote}
            </p>
          </div>
        )}

        <FlashOverlay flashKey={flashKey} intensity={flashIntensity} />
      </div>
    </>
  );
}
