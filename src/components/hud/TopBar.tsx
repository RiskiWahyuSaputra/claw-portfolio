"use client";

import { LuBox, LuCheck, LuLayers, LuMusic, LuVolume2, LuVolumeX } from "react-icons/lu";
import { COLLECTIBLES } from "@/data/collectibles";
import { audio } from "@/game/audio";
import { closeSection, openSection } from "@/game/engine";
import { isBusy, useGame } from "@/game/store";
import { CollectibleIcon } from "@/components/ui/CollectibleIcon";

function Toggle({ label, on, onClick, children }: {
  label: string;
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={`flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-lg border px-1.5 text-sm sm:h-9 sm:min-w-9 sm:px-2 transition-colors ${
        on ? "border-sky/60 bg-sky/15 text-sky" : "border-white/10 bg-white/5 text-cream/70 hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}

/** The always-available collectible menu. */
function Dock() {
  const collected = useGame((s) => s.collected);
  const active = useGame((s) => s.activeSection);
  const phase = useGame((s) => s.phase);

  return (
    <nav aria-label="Collectible sections" className="flex items-center gap-0.5 sm:gap-1.5">
      {COLLECTIBLES.map((item) => {
        const isCollected = collected.includes(item.id);
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={isBusy(phase)}
            onClick={() => openSection(item.id)}
            aria-label={`Open ${item.title}${isCollected ? " (collected)" : ""}`}
            aria-current={isActive ? "page" : undefined}
            title={item.title}
            style={{ "--tag": item.accent } as React.CSSProperties}
            className={`group relative flex size-8 items-center justify-center rounded-lg border transition-all duration-200 disabled:opacity-50 sm:size-10 ${
              isActive
                ? "border-[var(--tag)] bg-white/15 shadow-[0_0_16px_-2px_var(--tag)]"
                : isCollected
                  ? "border-[var(--tag)]/60 bg-white/10"
                  : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/30"
            }`}
          >
            <CollectibleIcon id={item.id} className={`size-5.5 transition sm:size-7 ${isCollected || isActive ? "" : "opacity-70 saturate-50 group-hover:opacity-100 group-hover:saturate-100"}`} />
            {isCollected && (
              <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-mint text-ink">
                <LuCheck className="size-2.5" strokeWidth={4} />
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function TopBar() {
  const music = useGame((s) => s.music);
  const sfx = useGame((s) => s.sfx);
  const renderer = useGame((s) => s.renderer);
  const active = useGame((s) => s.activeSection);
  const set = useGame((s) => s.set);

  const toggleMusic = () => {
    audio.enableMusic(!music);
    set({ music: !music });
  };
  const toggleSfx = () => {
    audio.enableSfx(!sfx);
    set({ sfx: !sfx });
    if (!sfx) audio.click();
  };

  return (
    <header className={`relative z-40 flex h-14 shrink-0 items-center justify-between gap-1.5 px-2.5 sm:gap-2 sm:px-5 short:h-12 xl:h-16 ${active ? "bg-ink/75 backdrop-blur-md" : ""}`}>
      <div className="flex min-w-0 items-center">
        {active ? (
          <button
            type="button"
            onClick={closeSection}
            aria-label="Back to machine"
            className="glass flex h-8 items-center gap-2 rounded-lg px-1.5 text-sm sm:h-10 sm:px-3 font-semibold text-cream hover:text-gold"
          >
            <span className="font-display text-[10px] font-bold tracking-tight sm:text-xs">RWS</span>
            <span className="pixel hidden text-[11px] text-cream/70 md:inline">HOME</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-display text-[11px] font-bold tracking-tight text-cream sm:text-sm">RWS</span>
            <span className="pixel hidden text-[11px] text-sky md:inline">ARCADE</span>
          </div>
        )}
      </div>

      <Dock />

      <div className="flex items-center gap-1 sm:gap-1.5">
        <Toggle label={`Music ${music ? "on" : "off"}`} on={music} onClick={toggleMusic}>
          <LuMusic className="size-4" />
          <span className="pixel hidden text-[10px] lg:inline">{music ? "ON" : "OFF"}</span>
        </Toggle>
        <Toggle label={`Sound effects ${sfx ? "on" : "off"}`} on={sfx} onClick={toggleSfx}>
          {sfx ? <LuVolume2 className="size-4" /> : <LuVolumeX className="size-4" />}
          <span className="pixel hidden text-[10px] lg:inline">{sfx ? "ON" : "OFF"}</span>
        </Toggle>
        <span className="hidden sm:inline-flex">
          <Toggle
            label={renderer === "lite" ? "Switch to full 3D machine" : "Switch to lite machine"}
            on={renderer === "lite"}
            onClick={() => set({ renderer: renderer === "lite" ? "3d" : "lite" })}
          >
            {renderer === "lite" ? <LuLayers className="size-4" /> : <LuBox className="size-4" />}
            <span className="pixel hidden text-[10px] lg:inline">{renderer === "lite" ? "LITE" : "3D"}</span>
          </Toggle>
        </span>
      </div>
    </header>
  );
}
