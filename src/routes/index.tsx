import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navigation } from "@/components/Navigation";
import { ImageGallery } from "@/components/ImageGallery";

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

function Index() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div className="relative min-h-screen bg-[#F5F2EE]">
        <Navigation />
      </div>
    </>
  );
}
