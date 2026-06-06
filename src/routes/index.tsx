import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navigation } from "@/components/Navigation";
import { ImageGallery } from "@/components/ImageGallery";
import { HurryButton } from "@/components/HurryButton";
import { FlashOverlay } from "@/components/FlashOverlay";
import { Tunnel } from "@/components/Tunnel";

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

const STARS_BG = "radial-gradient(0.5px 0.5px at 32.38% 15.08%, #ffb8c859, transparent), radial-gradient(1.5px 1.5px at 9.41% 58.28%, #ffffff72, transparent), radial-gradient(0.5px 0.5px at 43.36% 6.99%, #ffffffaf, transparent), radial-gradient(1px 1px at 82.69% 12.38%, #e8ecffbc, transparent), radial-gradient(1px 1px at 94.77% 57.71%, #cbd5ff54, transparent), radial-gradient(1px 1px at 4.66% 85.85%, #ffb8c896, transparent), radial-gradient(0.75px 0.75px at 11.78% 30.85%, #e8ecff5e, transparent), radial-gradient(1.5px 1.5px at 63.89% 37.24%, #e8ecffcc, transparent), radial-gradient(1.5px 1.5px at 5.96% 20.6%, #d6e0ff99, transparent), radial-gradient(1px 1px at 46.56% 92.34%, #ffffff82, transparent), radial-gradient(2px 2px at 69.9% 24.41%, #fff5d082, transparent), radial-gradient(1px 1px at 87.51% 72.94%, #ffffffba, transparent), radial-gradient(1px 1px at 11.81% 41.81%, #fff5d068, transparent), radial-gradient(0.5px 0.5px at 42.17% 96.2%, #e8ecffd6, transparent), radial-gradient(1px 1px at 78.91% 81.84%, #e8ecffc9, transparent), radial-gradient(0.5px 0.5px at 49.67% 79.69%, #b8c7ffe2, transparent), radial-gradient(0.5px 0.5px at 47.41% 66.42%, #b8c7ffce, transparent), radial-gradient(1.25px 1.25px at 64.71% 99.31%, #ffd9a87f, transparent), radial-gradient(1.25px 1.25px at 88.7% 34.7%, #e8ecff8c, transparent), radial-gradient(1px 1px at 11.71% 5.9%, #cbd5ff63, transparent), radial-gradient(1.25px 1.25px at 39.79% 91.68%, #fff5d05b, transparent), radial-gradient(0.75px 0.75px at 40.16% 27.78%, #ffb8c8dd, transparent), radial-gradient(1px 1px at 27.84% 41.53%, #ffd9a8c6, transparent), radial-gradient(0.75px 0.75px at 95.77% 15.09%, #cbd5ff68, transparent), radial-gradient(0.75px 0.75px at 1.21% 83.11%, #ffffff7a, transparent), radial-gradient(2px 2px at 14.57% 53.46%, #ffffffb2, transparent), radial-gradient(2px 2px at 69.05% 51.55%, #ffffffc1, transparent), radial-gradient(1.5px 1.5px at 45.66% 87.1%, #ffd9a891, transparent), radial-gradient(1px 1px at 39.41% 48.15%, #ffffff56, transparent), radial-gradient(0.5px 0.5px at 98.47% 44.06%, #ffffff89, transparent), radial-gradient(1.5px 1.5px at 10.24% 56.68%, #d6e0ff5e, transparent), radial-gradient(1px 1px at 61.37% 7.03%, #ffffffba, transparent), radial-gradient(2px 2px at 63.44% 95.55%, #ffffff8c, transparent), radial-gradient(1.25px 1.25px at 11.54% 48.81%, #b8c7ffa3, transparent), radial-gradient(1px 1px at 8.59% 10.22%, #fff5d0d1, transparent), radial-gradient(0.5px 0.5px at 82.89% 16.14%, #ffb8c870, transparent), radial-gradient(0.5px 0.5px at 36.18% 69.01%, #b8c7ffd3, transparent), radial-gradient(1px 1px at 97.85% 86.33%, #ffffffa8, transparent), radial-gradient(1.5px 1.5px at 35.57% 22.28%, #d6e0ffd8, transparent), radial-gradient(1px 1px at 63.64% 61.32%, #ffd9a8db, transparent), radial-gradient(1.5px 1.5px at 73.99% 22.67%, #ffffffa3, transparent), radial-gradient(1.25px 1.25px at 98.96% 79.01%, #e8ecff7a, transparent), radial-gradient(1px 1px at 95.65% 44.72%, #d6e0fff7, transparent), radial-gradient(1.25px 1.25px at 8.05% 10.22%, #cbd5ff70, transparent), radial-gradient(2px 2px at 48.27% 98.52%, #fff5d0e2, transparent), radial-gradient(0.5px 0.5px at 90.92% 34.4%, #ffffffe0, transparent), radial-gradient(1px 1px at 90.98% 78.23%, #ffffffa0, transparent), radial-gradient(0.5px 0.5px at 43.39% 63.58%, #ffd9a8db, transparent), radial-gradient(0.5px 0.5px at 46.32% 74.34%, #ffffffce, transparent), radial-gradient(2px 2px at 99.31% 2.75%, #ffffffed, transparent), radial-gradient(1.25px 1.25px at 61.16% 59.59%, #d6e0ffc1, transparent), radial-gradient(0.5px 0.5px at 15.59% 54.83%, #ffffff4f, transparent), radial-gradient(1px 1px at 52.66% 93.36%, #cbd5fffc, transparent), radial-gradient(1px 1px at 82.62% 21.1%, #ffb8c872, transparent), radial-gradient(1px 1px at 24.05% 58.64%, #ffffffad, transparent), radial-gradient(1.25px 1.25px at 6.09% 73.99%, #ffb8c8c1, transparent), radial-gradient(1.5px 1.5px at 42.06% 91.77%, #ffffff63, transparent), radial-gradient(1.25px 1.25px at 52.35% 1.87%, #e8ecffd6, transparent), radial-gradient(0.75px 0.75px at 0.39% 79.92%, #e8ecff66, transparent), radial-gradient(1px 1px at 72.52% 55.65%, #ffb8c8c6, transparent), radial-gradient(0.5px 0.5px at 55.54% 78.43%, #ffffffea, transparent), radial-gradient(0.5px 0.5px at 24.85% 27.69%, #ffb8c8a8, transparent), radial-gradient(0.5px 0.5px at 2.79% 89.4%, #e8ecff9b, transparent), radial-gradient(1px 1px at 97.34% 60.61%, #fff5d0c6, transparent), radial-gradient(1.5px 1.5px at 50.82% 80.74%, #ffb8c8f4, transparent), radial-gradient(1px 1px at 87.65% 94.22%, #cbd5fff2, transparent), radial-gradient(0.5px 0.5px at 84.0% 13.71%, #d6e0ff91, transparent), radial-gradient(0.5px 0.5px at 7.25% 24.06%, #b8c7ff72, transparent), radial-gradient(0.75px 0.75px at 78.39% 89.7%, #d6e0fff4, transparent), radial-gradient(1.25px 1.25px at 14.3% 88.28%, #ffffff72, transparent), radial-gradient(1px 1px at 39.83% 48.73%, #ffd9a868, transparent), radial-gradient(1px 1px at 99.41% 40.38%, #d6e0ff70, transparent), radial-gradient(1px 1px at 9.22% 36.6%, #fff5d0af, transparent), radial-gradient(1.5px 1.5px at 70.32% 38.43%, #ffb8c8bc, transparent), radial-gradient(1px 1px at 96.08% 11.28%, #fffffff9, transparent), radial-gradient(0.75px 0.75px at 8.41% 27.19%, #ffffff7c, transparent), radial-gradient(1px 1px at 81.98% 84.96%, #ffb8c893, transparent), radial-gradient(1px 1px at 91.92% 57.06%, #ffffff5b, transparent), radial-gradient(0.5px 0.5px at 79.96% 18.33%, #ffffff7c, transparent), radial-gradient(0.5px 0.5px at 63.44% 80.16%, #cbd5ffba, transparent), radial-gradient(1.25px 1.25px at 6.66% 86.28%, #ffb8c84f, transparent), radial-gradient(2px 2px at 41.78% 91.54%, #ffb8c863, transparent), radial-gradient(0.75px 0.75px at 70.95% 93.81%, #ffffff7a, transparent), radial-gradient(1px 1px at 20.18% 31.2%, #cbd5ffaa, transparent), radial-gradient(0.75px 0.75px at 29.0% 50.01%, #ffffff7c, transparent), radial-gradient(0.5px 0.5px at 99.45% 3.69%, #ffb8c8ce, transparent), radial-gradient(1px 1px at 97.81% 51.42%, #fffffff2, transparent), radial-gradient(1.25px 1.25px at 65.83% 65.01%, #ffd9a8ad, transparent), radial-gradient(1px 1px at 97.03% 30.78%, #d6e0fffc, transparent), radial-gradient(0.75px 0.75px at 19.86% 88.19%, #d6e0ff93, transparent), radial-gradient(0.5px 0.5px at 98.19% 83.7%, #b8c7ff59, transparent), radial-gradient(1px 1px at 43.07% 5.54%, #b8c7ffe8, transparent), radial-gradient(0.5px 0.5px at 59.88% 69.27%, #ffffff9e, transparent), radial-gradient(1px 1px at 26.9% 0.36%, #ffb8c8f7, transparent), radial-gradient(1px 1px at 32.35% 3.44%, #ffffff72, transparent)";

function Index() {
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

  const handleHoverFlash = useCallback(() => triggerFlash(0.18, 1), [triggerFlash]);

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
        // once images have faded, launch the tunnel sequence
        window.setTimeout(() => setShowTunnel(true), 2800);
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
      <div id="page-wrapper" className="relative min-h-screen overflow-hidden bg-[#EDE8DF]">
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
            backgroundImage: STARS_BG,
          }}
        />

        <Navigation />
        <ImageGallery faded={galleryFaded} active={heroDone} />

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
              style={
                quote.index === 2
                  ? {
                      fontSize: "3.75rem",
                      color: deepSpace ? "#e8e8f0" : "#1a1a1a",
                      background: "rgba(237, 232, 223, 0.85)",
                      padding: "2rem 3rem",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                    }
                  : {
                      fontSize: "2.5rem",
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
      {showTunnel && <Tunnel onComplete={handleTunnelComplete} />}
    </>
  );
}
