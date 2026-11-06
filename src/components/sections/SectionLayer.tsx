"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LuArrowLeft, LuArrowRight, LuCheck, LuSparkles } from "react-icons/lu";
import { COLLECTIBLES, byId, type PrizeId } from "@/data/collectibles";
import { closeSection, openSection } from "@/game/engine";
import { useGame } from "@/game/store";
import { CollectibleIcon } from "@/components/ui/CollectibleIcon";
import { Certificates } from "./Certificates";
import { Contact } from "./Contact";
import { Contribution } from "./Contribution";
import { Journey } from "./Journey";
import { MachineCleared } from "./MachineCleared";
import { WhoAmI } from "./WhoAmI";
import { Work } from "./Work";

const CONTENT: Record<PrizeId, React.ComponentType> = {
  who: WhoAmI,
  work: Work,
  journey: Journey,
  certificates: Certificates,
  contribution: Contribution,
  contact: Contact,
  secret: MachineCleared,
};

function Showcase({ id }: { id: PrizeId }) {
  const item = byId(id);
  const Content = CONTENT[id];
  const isSecret = id === "secret";
  const collected = useGame((s) => (id === "secret" ? s.secretClaimed : s.collected.includes(id)));
  // Unlocking happens back at the machine, so tell the visitor to go and look.
  const secretWaiting = useGame((s) => s.collected.length === COLLECTIBLES.length && !s.secretUnlocked);
  const scroller = useRef<HTMLDivElement>(null);
  const next = isSecret ? byId("contact") : COLLECTIBLES[(item.index + 1) % COLLECTIBLES.length];

  useEffect(() => {
    scroller.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={scroller}
      tabIndex={-1}
      className={`section-surface section-scroll bg-${id} h-full select-text overflow-y-auto overflow-x-hidden outline-none`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-[4.5rem] sm:px-6 xl:pt-20">
        <button
          type="button"
          onClick={closeSection}
          className="pixel group mb-6 inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--accent)]/50 bg-black/25 px-3.5 text-xs text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-ink"
        >
          <LuArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          BACK TO MACHINE
        </button>

        {secretWaiting && (
          <motion.button
            type="button"
            onClick={closeSection}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6 flex w-full items-center gap-3 rounded-xl border border-[#9ff0ff]/60 bg-[#9ff0ff]/10 p-3 text-left text-sm text-cream shadow-[0_0_26px_-10px_#9ff0ff]"
          >
            <LuSparkles className="size-5 shrink-0 text-[#9ff0ff]" aria-hidden="true" />
            <span>
              <strong className="font-semibold">All 6 collected.</strong> Something just unlocked. Head back to the machine.
            </span>
          </motion.button>
        )}

        <header className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <motion.div
            initial={{ scale: 0.4, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 190, damping: 15, delay: 0.25 }}
            className="relative flex size-24 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent)]/40 bg-black/25 sm:size-28"
            style={{ boxShadow: `0 0 50px -14px ${item.accent}` }}
          >
            <CollectibleIcon id={id} className="size-16 sm:size-20" />
          </motion.div>
          <div className="min-w-0">
            <p className="pixel mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--accent)]">
              <span>{isSecret ? "SECRET COLLECTIBLE" : `COLLECTIBLE ${item.number} / 06`}</span>
              {!isSecret && <span className="text-cream/60">{item.rarity}</span>}
              {collected && (
                <span className="inline-flex items-center gap-1 text-mint">
                  <LuCheck className="size-3.5" /> COLLECTED
                </span>
              )}
            </p>
            <h1 className="font-display text-3xl font-bold leading-[1.1] text-cream sm:text-5xl">{item.title}</h1>
            <p className="mt-2.5 max-w-xl text-base text-cream/75">{item.tagline}</p>
          </div>
        </header>

        <Content />

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={closeSection}
            className="pixel inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-xs text-ink transition hover:brightness-110"
          >
            <LuArrowLeft className="size-4" /> BACK TO MACHINE
          </button>
          <button
            type="button"
            onClick={() => openSection(next.id)}
            className="group inline-flex h-11 items-center gap-2.5 rounded-lg border border-white/15 bg-black/20 px-3.5 text-sm font-semibold text-cream hover:border-white/40"
          >
            <CollectibleIcon id={next.id} className="size-6" />
            Next: {next.title}
            <LuArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </footer>
      </div>
    </div>
  );
}

/** Opens like a capsule: a circle of the section's colour expands from the prize. */
export function SectionLayer() {
  const active = useGame((s) => s.activeSection);
  const reduced = useReducedMotion();
  const item = active ? byId(active) : null;

  const closed = "circle(0% at 50% 46%)";
  const opened = "circle(150% at 50% 46%)";

  return (
    <AnimatePresence mode="wait">
      {item && (
        <motion.div
          key={item.id}
          initial={reduced ? { opacity: 0 } : { clipPath: closed }}
          animate={reduced ? { opacity: 1 } : { clipPath: opened }}
          exit={reduced ? { opacity: 0 } : { clipPath: closed }}
          transition={{ duration: reduced ? 0.15 : 0.62, ease: [0.65, 0, 0.25, 1] }}
          className="fixed inset-0 z-30"
          style={
            {
              "--accent": item.accent,
              "--accent-soft": item.accentSoft,
              "--backdrop": item.backdrop,
            } as React.CSSProperties
          }
        >
          <Showcase id={item.id} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
