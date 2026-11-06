"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { LuBriefcase, LuGraduationCap, LuMapPin } from "react-icons/lu";
import { JOURNEY, type JourneyKind } from "@/data/journey";
import { CollectibleIcon } from "@/components/ui/CollectibleIcon";
import { Tag } from "./shared";

const KINDS: Record<JourneyKind, { icon: typeof LuBriefcase; label: string }> = {
  education: { icon: LuGraduationCap, label: "Education" },
  work: { icon: LuBriefcase, label: "Work" },
};

export function Journey() {
  const track = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start 75%", "end 70%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const height = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <ol ref={track} className="relative space-y-6 pl-11 md:space-y-2 md:pl-0">
      {/* The trail is drawn as you scroll, with the rocket at its tip. */}
      <span className="absolute bottom-0 left-[15px] top-0 w-0.5 bg-white/10 md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
      <motion.span
        style={{ height }}
        className="absolute left-[15px] top-0 w-0.5 bg-gradient-to-b from-[var(--accent-soft)] to-[var(--accent)] md:left-1/2 md:-translate-x-1/2"
        aria-hidden="true"
      >
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 rotate-180">
          <CollectibleIcon id="journey" className="size-8 drop-shadow-[0_0_10px_var(--accent)]" />
        </span>
      </motion.span>

      {JOURNEY.map((entry, i) => {
        const kind = KINDS[entry.kind];
        const Icon = kind.icon;
        const right = i % 2 === 1;
        return (
          <li key={entry.period} className="relative md:grid md:grid-cols-2 md:gap-14">
            <span
              className={`absolute -left-11 top-4 flex size-8 items-center justify-center rounded-full border border-[var(--accent)]/60 bg-[var(--backdrop)] text-[var(--accent)] md:left-1/2 md:-translate-x-1/2 ${
                entry.current ? "shadow-[0_0_20px_var(--accent)]" : ""
              }`}
            >
              <Icon className="size-4" aria-label={kind.label} />
            </span>
            <motion.article
              initial={{ opacity: 0, x: right ? 26 : -26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm sm:p-5 ${right ? "md:col-start-2" : ""}`}
            >
              <p className="pixel mb-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--accent)]">
                {entry.period}
                <span className="text-cream/60">{entry.type}</span>
                {entry.current && <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[10px] text-ink">NOW</span>}
              </p>
              <h2 className="font-display text-base font-bold leading-snug text-cream sm:text-lg">{entry.title}</h2>
              <p className="text-sm font-medium text-cream/80">
                {entry.org}
                {entry.orgNote && <span className="font-normal text-cream/60"> ({entry.orgNote})</span>}
              </p>
              <p className="mb-2 mt-0.5 flex items-center gap-1.5 text-[13px] text-cream/60">
                <LuMapPin className="size-3.5 shrink-0" aria-hidden="true" /> {entry.location}
              </p>
              <ul className="mb-3 space-y-1.5 text-sm leading-relaxed text-cream/80">
                {entry.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-[.5rem] size-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </motion.article>
          </li>
        );
      })}
    </ol>
  );
}
