"use client";

import { useRef } from "react";
import gsap from "gsap";
import { COLLECTIBLES } from "@/data/collectibles";
import { insertCoin } from "@/game/engine";
import { useGame } from "@/game/store";

function CoinButton({ compact }: { compact?: boolean }) {
  const credits = useGame((s) => s.credits);
  const coin = useRef<HTMLSpanElement>(null);

  const insert = () => {
    insertCoin();
    if (coin.current) {
      gsap.fromTo(
        coin.current,
        { y: -16, rotateY: 0, opacity: 1 },
        { y: 8, rotateY: 720, opacity: 0, duration: 0.55, ease: "power2.in" },
      );
    }
  };

  return (
    <button
      type="button"
      onClick={insert}
      className={`group relative flex items-center gap-2 overflow-hidden rounded-lg border border-gold/50 bg-gold/10 font-semibold text-gold transition hover:bg-gold/20 active:scale-95 ${
        compact ? "h-9 px-2.5" : "h-11 w-full justify-between px-3.5"
      }`}
    >
      <span ref={coin} aria-hidden="true" className="absolute right-6 top-3 size-4 rounded-full border-2 border-gold bg-gold/60 opacity-0" />
      <span className={`pixel ${compact ? "text-[10px]" : "text-xs"}`}>INSERT COIN</span>
      <span className={`pixel tabular-nums ${compact ? "text-[10px]" : "text-xs"} text-cream/80`}>
        {compact ? credits : `CREDIT ${String(credits).padStart(2, "0")}`}
      </span>
    </button>
  );
}

function ProgressCells() {
  const collected = useGame((s) => s.collected);
  return (
    <div
      role="progressbar"
      aria-label="Collectibles collected"
      aria-valuemin={0}
      aria-valuemax={COLLECTIBLES.length}
      aria-valuenow={collected.length}
      className="flex gap-1"
    >
      {COLLECTIBLES.map((item) => (
        <span
          key={item.id}
          className="h-2 flex-1 rounded-sm transition-all duration-500"
          style={{
            background: collected.includes(item.id) ? item.accent : "rgba(255,255,255,.1)",
            boxShadow: collected.includes(item.id) ? `0 0 10px ${item.accent}` : undefined,
          }}
        />
      ))}
    </div>
  );
}

/** Desktop left panel. */
export function StatusPanel() {
  const message = useGame((s) => s.message);
  const phase = useGame((s) => s.phase);
  const collected = useGame((s) => s.collected);
  const hiScore = useGame((s) => s.hiScore);
  const left = COLLECTIBLES.length - collected.length;

  return (
    <aside className="glass w-[17.5rem] space-y-4 rounded-2xl p-4" aria-label="Machine status">
      <CoinButton />
      <div aria-live="polite" className="space-y-2">
        <p className="flex items-center gap-2">
          <span className={`led size-2 rounded-full ${phase === "idle" ? "bg-mint shadow-[0_0_10px] shadow-mint" : "bg-gold shadow-[0_0_10px] shadow-gold"}`} />
          <span className="pixel truncate text-sm text-cream">{message}</span>
        </p>
        <p className="pixel text-xs text-sky">
          {left} COLLECTIBLE{left === 1 ? "" : "S"} AVAILABLE
        </p>
      </div>
      <div className="space-y-2 border-t border-white/10 pt-3.5">
        <ProgressCells />
        <dl className="grid grid-cols-2 gap-2">
          <div>
            <dt className="pixel text-[10px] text-cream/60">COLLECTED</dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums">
              {collected.length}
              <span className="text-sm text-cream/50">/{COLLECTIBLES.length}</span>
            </dd>
          </div>
          <div>
            <dt className="pixel text-[10px] text-cream/60">HIGH SCORE</dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums text-gold">{hiScore}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

/** Tablet and phone: the same information in one row. */
export function StatusStrip() {
  const message = useGame((s) => s.message);
  const collected = useGame((s) => s.collected);
  const hiScore = useGame((s) => s.hiScore);
  const phase = useGame((s) => s.phase);
  const left = COLLECTIBLES.length - collected.length;

  return (
    <div className="relative z-10 flex shrink-0 items-center gap-2 px-3 pb-1 sm:px-5">
      <CoinButton compact />
      <div aria-live="polite" className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5">
          <span className={`led size-1.5 shrink-0 rounded-full ${phase === "idle" ? "bg-mint" : "bg-gold"}`} />
          <span className="pixel truncate text-[11px] text-cream">{message}</span>
        </p>
        <p className="pixel truncate text-[10px] text-sky">{left} COLLECTIBLE{left === 1 ? "" : "S"} AVAILABLE</p>
      </div>
      <div className="w-20 shrink-0 space-y-1">
        <ProgressCells />
        <p className="pixel text-right text-[10px] text-cream/70">
          {collected.length}/{COLLECTIBLES.length} HI <span className="text-gold">{hiScore}</span>
        </p>
      </div>
    </div>
  );
}
