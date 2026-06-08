import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tunnel5 } from "../components/Tunnel5";

export const Route = createFileRoute("/svemir5")({
  component: Svemir5Page,
});

function Svemir5Page() {
  const [showTunnel, setShowTunnel] = useState(true);

  const handleTunnelComplete = () => {
    console.log("Tunnel sequence completed");
    setShowTunnel(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {showTunnel && <Tunnel5 onComplete={handleTunnelComplete} />}
      {!showTunnel && (
        <div className="flex items-center justify-center min-h-screen text-white">
          <p>Tunnel sequence completed. Refresh to replay.</p>
        </div>
      )}
    </div>
  );
}
