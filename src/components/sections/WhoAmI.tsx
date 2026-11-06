"use client";

import Image from "next/image";
import { useRef } from "react";
import { LuDownload } from "react-icons/lu";
import { PROFILE } from "@/data/profile";
import { SKILLS } from "@/data/skills";
import { Label, Panel, Reveal } from "./shared";

function CharacterCard() {
  const card = useRef<HTMLDivElement>(null);

  const tilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !card.current) return;
    const rect = card.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.current.style.transform = `rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 10}deg)`;
    card.current.style.setProperty("--sheen", `${x * 100}%`);
  };
  const reset = () => {
    if (card.current) card.current.style.transform = "";
  };

  return (
    <div className="[perspective:1000px]">
      <div
        ref={card}
        onPointerMove={tilt}
        onPointerLeave={reset}
        className="holo relative overflow-hidden rounded-2xl border border-[var(--accent)]/50 bg-[#100d27] p-3 shadow-[0_30px_70px_-30px_var(--accent-soft)] transition-transform duration-200 ease-out"
      >
        <div className="relative aspect-[4/4.3] overflow-hidden rounded-xl">
          <Image src={PROFILE.avatar} alt={`Portrait of ${PROFILE.name}`} fill priority sizes="(min-width: 1024px) 340px, 90vw" className="object-cover object-top" />
          <span className="pixel absolute left-2 top-2 rounded bg-ink/80 px-2 py-1 text-[10px] text-[var(--accent)]">LV. 2026</span>
        </div>
        <div className="px-1 pb-1 pt-3">
          <p className="font-display text-lg font-bold leading-tight text-cream">{PROFILE.name}</p>
          <p className="mb-3 text-sm text-cream/70">
            {PROFILE.role} at {PROFILE.company}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/10 pt-3">
            {PROFILE.stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <dt className="pixel text-[10px] text-cream/55">{stat.label}</dt>
                <dd className="text-[13px] font-semibold text-cream">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export function WhoAmI() {
  return (
    <div className="grid gap-6 lg:grid-cols-[21rem_1fr]">
      <Reveal>
        <CharacterCard />
        <a
          href={PROFILE.cv}
          download
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--accent)]/50 bg-black/25 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-ink"
        >
          <LuDownload className="size-4" /> Download CV
        </a>
      </Reveal>

      <div className="min-w-0 space-y-5">
        <Reveal delay={0.08}>
          <p className="text-xl font-medium leading-snug text-cream sm:text-2xl">{PROFILE.intro}</p>
          <p className="mt-4 leading-relaxed text-cream/75">{PROFILE.background}</p>
        </Reveal>

        <Reveal delay={0.16}>
          <Panel>
            <Label>DEVELOPER PHILOSOPHY</Label>
            <blockquote className="mb-4 font-display text-lg font-semibold text-cream">&ldquo;{PROFILE.motto}&rdquo;</blockquote>
            <div className="grid gap-4 sm:grid-cols-3">
              {PROFILE.philosophy.map((rule) => (
                <div key={rule.title}>
                  <h3 className="mb-1 text-sm font-semibold text-[var(--accent)]">{rule.title}</h3>
                  <p className="text-sm leading-relaxed text-cream/75">{rule.body}</p>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.24} className="grid gap-5 md:grid-cols-2">
          <Panel>
            <Label>INTERESTS</Label>
            <ul className="space-y-2.5">
              {PROFILE.interests.map((interest) => (
                <li key={interest.label}>
                  <p className="text-sm font-semibold text-cream">{interest.label}</p>
                  <p className="text-sm text-cream/70">{interest.detail}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <Label>LOADOUT</Label>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
              {SKILLS.map((skill) => {
                const Icon = skill.icon;
                return (
                  <li key={skill.name} className="flex items-center gap-2 text-sm text-cream/85">
                    <Icon className="size-4 shrink-0" style={{ color: skill.color }} aria-hidden="true" />
                    {skill.name}
                  </li>
                );
              })}
            </ul>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}
