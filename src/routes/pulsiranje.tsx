import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/pulsiranje")({
  component: PulsiranjeTest,
});

function PulsiranjeTest() {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = Date.now();
    const PULSE_DURATION = 800; // 800ms pulse

    function animate() {
      const elapsed = (Date.now() - startTime) % (PULSE_DURATION + 200); // Loop with small pause

      if (elapsed < PULSE_DURATION) {
        // Pulse animation
        const t = elapsed / PULSE_DURATION;
        const pulse = Math.sin(t * Math.PI) * 1.0;
        setPulseIntensity(pulse);
      } else {
        // Brief pause before restarting
        setPulseIntensity(0);
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Pulsing sphere of light at center - pure circular glow */}
      {pulseIntensity > 0 && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, rgba(255,255,255,${pulseIntensity}) 0%, rgba(255,255,255,${pulseIntensity * 0.5}) 50%, transparent 100%)`,
          }}
          animate={{
            width: `${pulseIntensity * 100}px`,
            height: `${pulseIntensity * 100}px`,
            opacity: pulseIntensity * 0.9,
            boxShadow: `0 0 ${pulseIntensity * 75}px ${pulseIntensity * 40}px rgba(255, 255, 255, ${pulseIntensity * 0.8})`,
          }}
          transition={{ duration: 0 }}
        />
      )}

      {/* Info text */}
      <div className="absolute bottom-8 text-white text-sm opacity-50">
        Pulse effect looping continuously - testing single pulse animation
      </div>
    </div>
  );
}
