"use client";

import { useEffect, useState } from "react";
import { SKILLS, type Skill } from "@/data/skills";
import { AnimatePresence, motion } from "framer-motion";

/** Offsets are measured from the machine's edge, so chips never sit on top of it. */
const SLOTS = [
  { side: "left", gap: 74, top: "14%", time: 7 },
  { side: "left", gap: 22, top: "43%", time: 8.5 },
  { side: "left", gap: 62, top: "72%", time: 6.5 },
  { side: "right", gap: 66, top: "20%", time: 8 },
  { side: "right", gap: 18, top: "50%", time: 7.2 },
  { side: "right", gap: 70, top: "79%", time: 9 },
] as const;

function Chip({ skill }: { skill: Skill }) {
  const Icon = skill.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: -10 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      title={skill.name}
      className="glass group flex size-12 items-center justify-center rounded-xl"
    >
      <Icon className="size-6" style={{ color: skill.color }} aria-label={skill.name} />
      <span className="pixel pointer-events-none absolute top-full mt-1.5 whitespace-nowrap text-[10px] text-cream/70 opacity-0 transition group-hover:opacity-100">
        {skill.name}
      </span>
    </motion.div>
  );
}

/** Desktop: a few chips drifting beside the machine, rotating through the whole stack. */
export function SkillFloat() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 hidden xl:block" aria-label="Skills">
      {SLOTS.map((slot, i) => {
        // One chip changes per tick, so the set evolves instead of flashing at once.
        const round = Math.floor((tick + SLOTS.length - 1 - i) / SLOTS.length);
        const skill = SKILLS[(i + round * SLOTS.length) % SKILLS.length];
        const edge = `calc(50% + 29vh + ${slot.gap}px)`;
        return (
          <div
            key={i}
            className="float-chip pointer-events-auto absolute"
            style={{
              top: slot.top,
              [slot.side]: edge,
              "--float-time": `${slot.time}s`,
            } as React.CSSProperties}
          >
            <AnimatePresence mode="wait">
              <Chip key={skill.name} skill={skill} />
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** Tablet and phone: one quiet moving rail instead of chips competing for space. */
export function SkillRail() {
  return (
    <div className="pointer-events-none relative z-10 shrink-0 overflow-hidden py-1 opacity-75 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" aria-hidden="true">
      <div className="skill-rail flex w-max gap-5">
        {[...SKILLS, ...SKILLS].map((skill, i) => {
          const Icon = skill.icon;
          return <Icon key={i} className="size-4" style={{ color: skill.color }} />;
        })}
      </div>
    </div>
  );
}
