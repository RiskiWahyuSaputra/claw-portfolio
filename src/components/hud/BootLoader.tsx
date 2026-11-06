"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { prefersReducedMotion } from "@/game/capabilities";
import { useGame } from "@/game/store";

const STEPS = [
  "POWER ON",
  "CALIBRATING CLAW RAIL",
  "TESTING GRIP SERVO",
  "POLISHING GLASS",
  "LOADING 6 COLLECTIBLES",
  "READY TO PLAY",
];

/** Stays up until the machine has really rendered, not just until a timer ends. */
export function BootLoader({ sceneReady }: { sceneReady: boolean }) {
  const booted = useGame((s) => s.booted);
  const set = useGame((s) => s.set);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = prefersReducedMotion() ? 60 : 300;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 2)), interval);
    return () => clearInterval(id);
  }, []);

  const scriptDone = step >= STEPS.length - 2;
  const shown = scriptDone && sceneReady ? STEPS.length - 1 : step;

  useEffect(() => {
    if (!scriptDone || !sceneReady) return;
    const id = setTimeout(() => set({ booted: true }), 420);
    return () => clearTimeout(id);
  }, [scriptDone, sceneReady, set]);

  const progress = ((shown + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          key="boot"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="arcade-room fixed inset-0 z-[70] flex flex-col items-center justify-center gap-7 px-6"
          role="status"
          aria-label="Machine is initializing"
        >
          <div className="relative h-44 w-32 overflow-hidden rounded-t-2xl rounded-b-md border-2 border-sky/50 bg-navy/70 shadow-[0_0_40px_-10px_#8ecbff]">
            <div className="h-7 border-b-2 border-sky/50 bg-violet/20" />
            <div className="absolute left-1/2 top-7 h-14 w-px bg-sky/70" />
            <div className="absolute left-1/2 top-[5.1rem] size-5 -translate-x-1/2 rounded-b-full border-2 border-t-0 border-cream" />
            <div className="absolute inset-x-3 bottom-11 flex justify-between">
              {["#c7b5ff", "#8ecbff", "#ff9fb8", "#f6e7c8", "#6df0b0", "#ffd166"].map((color, i) => (
                <span
                  key={color}
                  className="size-2.5 rounded-full transition-all duration-300"
                  style={{ background: color, opacity: i <= step ? 1 : 0.15, boxShadow: i <= step ? `0 0 8px ${color}` : undefined }}
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-8 border-t-2 border-sky/50 bg-navy-2" />
            <div className="boot-scan absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent to-sky/15" />
          </div>
          <div className="w-full max-w-xs space-y-2.5">
            <p className="pixel text-center text-sm text-cream" aria-live="polite">{STEPS[shown]}</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-sky to-violet transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="pixel text-center text-[10px] text-cream/60">RWS ARCADE SYSTEM</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
