"use client";

import { AnimatePresence, motion } from "framer-motion";
import { byId } from "@/data/collectibles";
import { useGame } from "@/game/store";

/** The win moment: the collectible takes the screen and its title lands beneath it. */
export function RevealOverlay() {
  const revealId = useGame((s) => s.revealId);
  const item = revealId ? byId(revealId) : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-end px-6 pb-[10vh] text-center"
          role="status"
        >
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pixel mb-2 text-xs"
            style={{ color: item.accent }}
          >
            COLLECTIBLE {item.number} / {item.rarity}
          </motion.p>
          <motion.h2
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.62 }}
            className="font-display text-3xl font-bold text-cream sm:text-5xl"
          >
            {item.title}
          </motion.h2>
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.76 }}
            className="mt-3 max-w-md text-sm text-cream/75 sm:text-base"
          >
            {item.tagline}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
