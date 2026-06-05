import { AnimatePresence, motion } from "framer-motion";

type Props = {
  flashKey: number;
  intensity: number; // 0..1
};

export function FlashOverlay({ flashKey, intensity }: Props) {
  return (
    <AnimatePresence>
      {flashKey > 0 && (
        <motion.div
          key={flashKey}
          className="pointer-events-none fixed inset-0 z-[60] bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: intensity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}
