"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { COLLECTIBLES } from "@/data/collectibles";
import { quickSelect } from "@/game/engine";
import { CHAMBER, SLOTS } from "@/game/layout";
import { pose } from "@/game/pose";
import { useGame } from "@/game/store";
import { CollectibleIcon } from "@/components/ui/CollectibleIcon";

const WIDTH = CHAMBER.maxX - CHAMBER.minX + 0.4;
const HEIGHT = CHAMBER.ceiling - CHAMBER.floor;
const left = (x: number) => ((x - CHAMBER.minX + 0.2) / WIDTH) * 100;
const top = (y: number) => ((CHAMBER.ceiling - y) / HEIGHT) * 100;

/**
 * CSS 3D fallback for devices without capable WebGL. It reads the same pose as the
 * 3D scene, so every rule of the game behaves identically.
 */
export function LiteMachine({ onReady }: { onReady: () => void }) {
  const claw = useRef<HTMLDivElement>(null);
  const cable = useRef<HTMLDivElement>(null);
  const held = useRef<HTMLDivElement>(null);
  const prongs = useRef<SVGGElement>(null);
  const collected = useGame((s) => s.collected);
  const mode = useGame((s) => s.mode);
  const phase = useGame((s) => s.phase);
  const aimed = useGame((s) => s.aimed);

  useEffect(() => {
    onReady();
    const update = () => {
      const x = left(pose.x);
      const y = top(pose.y);
      if (cable.current) {
        cable.current.style.left = `${x}%`;
        cable.current.style.height = `${y}%`;
      }
      if (claw.current) {
        claw.current.style.left = `${x}%`;
        claw.current.style.top = `${y}%`;
      }
      if (prongs.current) {
        const spread = 6 + pose.open * 24;
        prongs.current.children[0]?.setAttribute("transform", `rotate(${spread} 32 14)`);
        prongs.current.children[1]?.setAttribute("transform", `rotate(${-spread} 32 14)`);
      }
      if (held.current) {
        const visible = pose.prize.id !== null && pose.prize.scale > 0.01 && pose.prize.y > 2.8;
        held.current.style.opacity = visible ? "1" : "0";
        held.current.style.left = `${left(pose.prize.x)}%`;
        held.current.style.top = `${top(pose.prize.y)}%`;
      }
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [onReady]);

  return (
    <div className="flex h-full items-center justify-center p-2 [perspective:1100px] xl:pb-6 xl:pt-[4.5rem]">
      <div className="flex h-full max-h-[52rem] w-auto flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-navy-2 shadow-[0_40px_90px_-30px_#000] [aspect-ratio:0.68] [transform:rotateX(2deg)] max-w-full">
        <div className="shrink-0 bg-gradient-to-br from-navy to-[#191447] px-3 py-3 text-center">
          <p className="font-display text-[clamp(.8rem,2.6vh,1.5rem)] font-extrabold tracking-tight text-cream">RISKI WAHYU SAPUTRA</p>
          <p className="font-display text-[clamp(.55rem,1.5vh,.85rem)] font-semibold text-violet">Welcome to My Creative World</p>
          <p className="mt-0.5 text-[clamp(.5rem,1.25vh,.72rem)] text-cream/70">
            Explore my journey, projects, skills, and experiences through an interactive claw machine.
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden border-y-4 border-cream/80 bg-[radial-gradient(circle_at_60%_30%,#352a80,#121138_70%)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-sky/70 shadow-[0_0_14px_#8ecbff]" />
          {/* Prize chute */}
          <div className="absolute bottom-0 left-0 top-[66%] w-[32%] border-r-2 border-t-2 border-gold/60 bg-black/50">
            <span className="pixel absolute inset-x-0 top-1/3 text-center text-[10px] text-gold">CHUTE</span>
          </div>

          {/* The prize pit */}
          <div className="absolute bottom-0 left-[32%] right-0 h-[26%] bg-[radial-gradient(circle_at_20%_30%,#8fb2e2_0_7%,transparent_8%),radial-gradient(circle_at_48%_60%,#cfc4f2_0_9%,transparent_10%),radial-gradient(circle_at_75%_34%,#5a52b4_0_10%,transparent_11%),radial-gradient(circle_at_90%_72%,#3d62ad_0_9%,transparent_10%),linear-gradient(#2a2873,#1a1b52)]" />

          {COLLECTIBLES.map((item) => {
            const slot = SLOTS[item.id];
            const taken = collected.includes(item.id);
            if (taken && pose.prize.id !== item.id) return null;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Grab ${item.title}`}
                disabled={mode !== "quick" || phase !== "idle"}
                onClick={() => quickSelect(item.id)}
                className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 transition-transform enabled:hover:scale-115 disabled:cursor-default"
                style={{
                  left: `${left(slot.x)}%`,
                  top: `${top(slot.y)}%`,
                  width: slot.z < 0 ? "15%" : "17%",
                  filter: aimed === item.id || item.id === "contact" ? `drop-shadow(0 0 12px ${item.accent})` : undefined,
                }}
              >
                <CollectibleIcon id={item.id} className="w-full" />
              </button>
            );
          })}

          <div ref={cable} className="absolute top-0 z-[3] w-0.5 -translate-x-1/2 bg-cream/80" />
          <div ref={claw} className="absolute z-[4] w-[17%] -translate-x-1/2">
            <svg viewBox="0 0 64 70" className="w-full" aria-hidden="true">
              <rect x="20" y="0" width="24" height="14" rx="5" fill="#f4ecdc" />
              <g ref={prongs} fill="none" stroke="#d7dcec" strokeWidth="5" strokeLinecap="round">
                <path d="M30 14C14 26 12 46 24 60" />
                <path d="M34 14c16 12 18 32 6 46" />
              </g>
            </svg>
          </div>
          <div ref={held} className="absolute z-[3] w-[15%] -translate-x-1/2 -translate-y-1/2 opacity-0">
            <HeldIcon />
          </div>

          <div className="pointer-events-none absolute inset-0 z-[5] bg-[linear-gradient(115deg,transparent_18%,rgba(255,255,255,.08)_24%,transparent_32%)]" />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 bg-navy px-3 py-2.5">
          <span className="pixel rounded border border-cream/40 px-2 py-1 text-[10px] text-cream">PRIZE</span>
          <LiteMessage />
        </div>
      </div>
    </div>
  );
}

function HeldIcon() {
  const phase = useGame((s) => s.phase);
  void phase;
  const id = pose.prize.id;
  return id ? <CollectibleIcon id={id} className="w-full" /> : null;
}

function LiteMessage() {
  const message = useGame((s) => s.message);
  return <span className="pixel truncate text-[11px] text-gold">{message}</span>;
}
