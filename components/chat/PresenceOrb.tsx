import { motion } from "framer-motion";

export function PresenceOrb() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,184,109,0.5) 0%, rgba(232,184,109,0) 70%)",
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative h-3 w-3 rounded-full bg-accent-gold shadow-[0_0_12px_2px_rgba(232,184,109,0.6)]" />
    </div>
  );
}
