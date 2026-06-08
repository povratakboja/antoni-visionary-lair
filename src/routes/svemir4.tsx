import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tunnel4 } from "../components/Tunnel4";

export const Route = createFileRoute("/svemir4")({
  component: Svemir4Page,
});

function Svemir4Page() {
  const [showTunnel, setShowTunnel] = useState(true);

  const handleTunnelComplete = () => {
    console.log("Tunnel sequence completed");
    setShowTunnel(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {showTunnel && <Tunnel4 onComplete={handleTunnelComplete} />}
      {!showTunnel && (
        <div className="flex items-center justify-center min-h-screen text-white">
          <p>Tunnel sequence completed. Refresh to replay.</p>
        </div>
      )}
    </div>
  );
}
