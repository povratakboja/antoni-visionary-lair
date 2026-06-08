import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tunnel } from "../components/Tunnel";

export const Route = createFileRoute("/svemir")({
  component: SvemirPage,
});

function SvemirPage() {
  const [showTunnel, setShowTunnel] = useState(true);

  const handleTunnelComplete = () => {
    console.log("Tunnel sequence completed");
    setShowTunnel(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {showTunnel && <Tunnel onComplete={handleTunnelComplete} />}
      {!showTunnel && (
        <div className="flex items-center justify-center min-h-screen text-white">
          <p>Tunnel sequence completed. Refresh to replay.</p>
        </div>
      )}
    </div>
  );
}
