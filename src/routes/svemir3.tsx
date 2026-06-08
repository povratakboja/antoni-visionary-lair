import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tunnel3 } from "../components/Tunnel3";

export const Route = createFileRoute("/svemir3")({
  component: Svemir3Page,
});

function Svemir3Page() {
  const [showTunnel, setShowTunnel] = useState(true);

  const handleTunnelComplete = () => {
    console.log("Tunnel sequence completed");
    setShowTunnel(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {showTunnel && <Tunnel3 onComplete={handleTunnelComplete} />}
      {!showTunnel && (
        <div className="flex items-center justify-center min-h-screen text-white">
          <p>Tunnel sequence completed. Refresh to replay.</p>
        </div>
      )}
    </div>
  );
}
