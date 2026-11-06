"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { LuArrowLeft, LuArrowRight, LuCheck, LuRotateCcw } from "react-icons/lu";
import { COLLECTIBLES, byId } from "@/data/collectibles";
import { dropClaw, quickSelect, refill, setMode, setMove } from "@/game/engine";
import { pose } from "@/game/pose";
import { useGame } from "@/game/store";
import { CollectibleIcon } from "@/components/ui/CollectibleIcon";

const TRAVEL = 30;

function Joystick() {
  const knob = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);

  // The knob mirrors the shared input, so keyboard and buttons move it too.
  useEffect(() => {
    const update = () => {
      if (knob.current) knob.current.style.transform = `translateX(${pose.stick * TRAVEL}px)`;
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, []);

  const finish = () => {
    start.current = null;
    setMove(0);
  };

  return (
    <div
      role="slider"
      tabIndex={-1}
      aria-label="Joystick, drag left or right"
      aria-valuemin={-1}
      aria-valuemax={1}
      aria-valuenow={0}
      className="relative flex h-16 w-28 shrink touch-none select-none items-center justify-center rounded-full border border-white/10 bg-ink/60 shadow-[inset_0_2px_12px_rgba(0,0,0,.6)]"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        start.current = event.clientX;
      }}
      onPointerMove={(event) => {
        if (start.current === null) return;
        const value = gsap.utils.clamp(-1, 1, (event.clientX - start.current) / TRAVEL);
        setMove(Math.abs(value) < 0.14 ? 0 : value);
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={finish}
    >
      <span className="absolute inset-x-5 h-1 rounded-full bg-white/10" />
      <div
        ref={knob}
        className="relative size-11 rounded-full bg-[radial-gradient(circle_at_35%_30%,#d8ccff,#7c62e0_62%,#4a33ad)] shadow-[0_6px_16px_rgba(0,0,0,.5),0_0_20px_-4px_#a993ff]"
      />
    </div>
  );
}

function HoldButton({ direction, label, children }: { direction: -1 | 1; label: string; children: React.ReactNode }) {
  const finish = () => setMove(0);
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-14 touch-none select-none flex-col items-center justify-center rounded-xl border border-sky/40 bg-sky/10 text-sky transition active:scale-95 active:bg-sky/25"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setMove(direction);
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={finish}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}

function ManualControls() {
  const phase = useGame((s) => s.phase);
  const aimed = useGame((s) => s.aimed);
  const collected = useGame((s) => s.collected);
  const empty = collected.length === COLLECTIBLES.length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-1.5">
        <HoldButton direction={-1} label="Move claw left">
          <LuArrowLeft className="size-5" />
          <span className="pixel text-[9px]">LEFT</span>
        </HoldButton>
        <Joystick />
        <HoldButton direction={1} label="Move claw right">
          <LuArrowRight className="size-5" />
          <span className="pixel text-[9px]">RIGHT</span>
        </HoldButton>
        <button
          type="button"
          onClick={dropClaw}
          disabled={phase !== "idle" || empty}
          className="pixel flex size-16 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffb3c7,#ff7b9c_55%,#c23a68)] text-sm font-bold text-ink shadow-[0_6px_0_#7d2346,0_0_24px_-6px_#ff7b9c] transition active:translate-y-1 active:shadow-[0_2px_0_#7d2346] disabled:opacity-40 disabled:saturate-50"
        >
          DROP
        </button>
      </div>
      <p className="flex min-h-5 items-center justify-between gap-2 text-xs">
        <span className="truncate font-medium" style={{ color: aimed ? byId(aimed).accent : "var(--muted)" }}>
          {aimed ? `Aligned: ${byId(aimed).title}` : "Line up the beam over a prize"}
        </span>
        <span className="pixel hidden shrink-0 text-[10px] text-cream/60 lg:inline">← → SPACE</span>
      </p>
    </div>
  );
}

function QuickSelect() {
  const collected = useGame((s) => s.collected);
  const phase = useGame((s) => s.phase);

  return (
    <div className="grid grid-cols-3 gap-1.5 short:grid-cols-2 lg:grid-cols-1">
      {COLLECTIBLES.map((item) => {
        const taken = collected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            disabled={taken || phase !== "idle"}
            onClick={() => quickSelect(item.id)}
            style={{ "--tag": item.accent } as React.CSSProperties}
            className="group flex min-h-11 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 text-left transition enabled:hover:border-[var(--tag)] enabled:hover:bg-white/10 disabled:opacity-45 lg:gap-2.5 lg:px-2.5"
          >
            <CollectibleIcon id={item.id} className="size-7 shrink-0 transition group-enabled:group-hover:scale-110" />
            <span className="min-w-0 flex-1">
              <span className="pixel hidden text-[10px] text-[var(--tag)] lg:block">
                {item.number} {item.rarity}
              </span>
              <span className="block text-[11px] font-semibold leading-tight text-cream sm:text-xs lg:truncate lg:text-[13px]">
                {item.title}
              </span>
            </span>
            {taken && <LuCheck className="size-4 shrink-0 text-mint" aria-label="Collected" />}
          </button>
        );
      })}
    </div>
  );
}

function ClearedPanel() {
  const phase = useGame((s) => s.phase);
  return (
    <div className="space-y-2.5 py-1 text-center">
      <p className="pixel text-sm text-gold">ALL 6 COLLECTED</p>
      <p className="text-xs text-cream/70">You cleared the machine. Thanks for exploring.</p>
      <button
        type="button"
        onClick={refill}
        disabled={phase !== "idle"}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-gold px-4 text-sm font-semibold text-ink transition hover:brightness-110 active:scale-95"
      >
        <LuRotateCcw className="size-4" /> Refill machine
      </button>
    </div>
  );
}

export function Console() {
  const mode = useGame((s) => s.mode);
  const collected = useGame((s) => s.collected);
  const cleared = collected.length === COLLECTIBLES.length;

  return (
    <section
      aria-label="Machine controls"
      className="glass rounded-2xl p-2.5 short:max-h-[calc(100dvh-3.75rem)] short:overflow-y-auto lg:w-[20rem] lg:p-3.5"
      // A mouse click should not leave focus on a button, or Space would press it instead of DROP.
      onPointerUp={() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      }}
    >
      <div role="tablist" aria-label="Play mode" className="mb-2.5 grid grid-cols-2 gap-1 rounded-lg bg-ink/50 p-1">
        {(["quick", "manual"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`pixel h-8 rounded-md text-[11px] transition ${
              mode === value ? "bg-violet text-ink" : "text-cream/70 hover:text-cream"
            }`}
          >
            {value === "quick" ? "QUICK SELECT" : "MANUAL PLAY"}
          </button>
        ))}
      </div>
      {cleared ? <ClearedPanel /> : mode === "quick" ? <QuickSelect /> : <ManualControls />}
      {!cleared && mode === "quick" && (
        <p className="mt-2 hidden text-xs text-cream/60 lg:block">Click a prize in the machine or pick one here. Keys 1-6 work too.</p>
      )}
    </section>
  );
}
