"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SiGithub } from "react-icons/si";
import github from "@/data/github.json";
import { PROFILE } from "@/data/profile";
import { Label, Panel, Reveal } from "./shared";

type Day = { date: string; count: number; level: number };

/** One hue, dark to light against the dark section surface. */
const LEVELS = ["#14312b", "#1a5c47", "#249469", "#42cc91", "#9cf7cb"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const GAP = 3;
/** Cells grow to fill the panel, but never drop below a readable size on phones. */
const CELL = "clamp(12px, calc((100cqw - 156px) / 53), 18px)";
const STEP = `calc(${CELL} + ${GAP}px)`;

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Panel className="p-4">
      <p className="pixel text-[10px] text-cream/65">{label}</p>
      <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-cream">{value}</p>
      <p className="mt-0.5 text-xs text-cream/60">{note}</p>
    </Panel>
  );
}

function Heatmap() {
  const weeks = github.weeks as Day[][];
  const [hover, setHover] = useState<{ day: Day; x: number; y: number } | null>(null);

  const monthLabels = useMemo(() => {
    const labels: { week: number; label: string }[] = [];
    let previous = -1;
    weeks.forEach((week, index) => {
      const month = new Date(`${week[0].date}T00:00:00Z`).getUTCMonth();
      if (month !== previous) {
        previous = month;
        // Skip a partial first month so its label cannot collide with the next one.
        if (index > 0 || new Date(`${week[0].date}T00:00:00Z`).getUTCDate() < 15) {
          labels.push({ week: index, label: MONTHS[month] });
        }
      }
    });
    return labels;
  }, [weeks]);

  const width = `calc(${STEP} * ${weeks.length})`;

  return (
    <div className="relative [container-type:inline-size]">
      <div className="section-scroll overflow-x-auto pb-2">
        <div className="relative" style={{ width }}>
          <div className="relative mb-1.5 h-4" aria-hidden="true">
            {monthLabels.map(({ week, label }) => (
              <span key={`${label}${week}`} className="absolute text-[11px] text-cream/65" style={{ left: `calc(${STEP} * ${week})` }}>
                {label}
              </span>
            ))}
          </div>
          <div className="flex" style={{ gap: GAP }} onPointerLeave={() => setHover(null)} aria-hidden="true">
            {weeks.map((week, x) => (
              <div key={week[0].date} className="flex flex-col" style={{ gap: GAP, marginTop: x === 0 ? `calc(${STEP} * ${7 - week.length})` : 0 }}>
                {week.map((day) => (
                  <motion.span
                    key={day.date}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + x * 0.008, duration: 0.2 }}
                    onPointerEnter={(event) => {
                      const cell = event.currentTarget;
                      setHover({ day, x: cell.offsetLeft + cell.offsetParent!.scrollLeft, y: cell.offsetTop });
                    }}
                    className="block rounded-[3px] outline-offset-1 hover:outline hover:outline-1 hover:outline-cream"
                    style={{ width: CELL, height: CELL, background: LEVELS[day.level] }}
                  />
                ))}
              </div>
            ))}
          </div>
          {hover && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 -translate-y-full whitespace-nowrap rounded-md border border-white/20 bg-ink px-2.5 py-1.5 text-xs text-cream shadow-lg"
              style={{ left: `min(${hover.x}px, calc(${width} - 230px))`, top: hover.y - 6 }}
            >
              <strong className="font-semibold tabular-nums">{hover.day.count}</strong> contribution{hover.day.count === 1 ? "" : "s"}
              <span className="text-cream/65"> on {formatDate(hover.day.date)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-cream/65">
        Less
        {LEVELS.map((color) => (
          <span key={color} className="size-3 rounded-[3px]" style={{ background: color }} />
        ))}
        More
      </div>
    </div>
  );
}

function MonthlyTable() {
  const rows = useMemo(() => {
    const totals = new Map<string, number>();
    for (const week of github.weeks as Day[][]) {
      for (const day of week) {
        const key = day.date.slice(0, 7);
        totals.set(key, (totals.get(key) ?? 0) + day.count);
      }
    }
    return [...totals.entries()];
  }, []);

  return (
    <details className="mt-3 text-sm">
      <summary className="w-fit text-cream/75 hover:text-cream">View monthly totals as a table</summary>
      <table className="mt-2 w-full max-w-sm text-left">
        <thead>
          <tr className="text-xs text-cream/60">
            <th className="py-1 font-medium">Month</th>
            <th className="py-1 text-right font-medium">Contributions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([month, total]) => (
            <tr key={month} className="border-t border-white/10">
              <td className="py-1">{`${MONTHS[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`}</td>
              <td className="py-1 text-right font-mono tabular-nums">{total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

function Languages() {
  const max = github.languages[0].share;
  return (
    <ul className="space-y-2.5">
      {github.languages.map((language, i) => (
        <li key={language.name} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2.5 text-sm">
          <span className="truncate text-cream/85">{language.name}</span>
          <span className="h-2 overflow-hidden rounded-r bg-white/5">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${(language.share / max) * 100}%` }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.6, ease: "easeOut" }}
              className="block h-full rounded-r bg-[var(--accent)]"
            />
          </span>
          <span className="text-right font-mono text-xs tabular-nums text-cream/75">{language.share}%</span>
        </li>
      ))}
    </ul>
  );
}

export function Contribution() {
  const since = new Date(github.memberSince).getUTCFullYear();

  return (
    <div className="space-y-5">
      <Reveal className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="LAST 12 MONTHS" value={github.totalContributions.toLocaleString("en-US")} note="total contributions" />
        <StatTile label="TOTAL COMMITS" value={github.commits.toLocaleString("en-US")} note="in public repositories" />
        <StatTile label="REPOSITORIES" value={String(github.publicRepos)} note={`public, since ${since}`} />
        <StatTile label="LONGEST STREAK" value={`${github.longestStreak}d`} note={`${github.activeDays} active days in 12 months`} />
      </Reveal>

      <Reveal delay={0.08}>
        <Panel>
          <Label>CONTRIBUTION GRAPH</Label>
          <Heatmap />
          <MonthlyTable />
        </Panel>
      </Reveal>

      <Reveal delay={0.16} className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
        <Panel>
          <Label>MOST USED LANGUAGES</Label>
          <Languages />
          <p className="mt-3 text-xs text-cream/60">Share of code size across public repositories.</p>
        </Panel>
        <Panel className="flex flex-col justify-between gap-4">
          <div>
            <Label>BEST DAY</Label>
            <p className="font-mono text-3xl font-semibold tabular-nums">{github.bestDay.count}</p>
            <p className="text-sm text-cream/70">contributions on {formatDate(github.bestDay.date)}</p>
          </div>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[var(--accent)] px-3.5 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            <SiGithub className="size-4" /> View GitHub profile
          </a>
          <p className="text-xs text-cream/55">Snapshot from public GitHub data, updated {formatDate(github.generatedAt)}.</p>
        </Panel>
      </Reveal>
    </div>
  );
}
