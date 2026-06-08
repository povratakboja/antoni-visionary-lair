import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TunnelOriginal } from "../components/TunnelOriginal";

export const Route = createFileRoute("/svemiroriginal")({
  component: SvemirOriginalPage,
});

function SvemirOriginalPage() {
  const [showTunnel, setShowTunnel] = useState(true);

  const handleTunnelComplete = () => {
    console.log("Tunnel sequence completed");
    setShowTunnel(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {showTunnel && <TunnelOriginal onComplete={handleTunnelComplete} />}
      {!showTunnel && (
        <div className="flex items-center justify-center min-h-screen text-white">
          <p>Tunnel sequence completed (ORIGINAL). Refresh to replay.</p>
        </div>
      )}
    </div>
  );
}
