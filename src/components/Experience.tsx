"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { COLLECTIBLES, byId, bySlug } from "@/data/collectibles";
import { supportsWebGL } from "@/game/capabilities";
import { closeSection, dropClaw, openSection, quickSelect, setMode, setMove, startEngine } from "@/game/engine";
import { game, loadHiScore, useGame } from "@/game/store";
import { BootLoader } from "./hud/BootLoader";
import { Console } from "./hud/Console";
import { ParticleBurst } from "./hud/ParticleBurst";
import { RevealOverlay } from "./hud/RevealOverlay";
import { SkillFloat, SkillRail } from "./hud/SkillFloat";
import { StatusPanel, StatusStrip } from "./hud/StatusPanel";
import { TopBar } from "./hud/TopBar";
import { SectionLayer } from "./sections/SectionLayer";

const Scene = dynamic(() => import("./machine3d/Scene"), { ssr: false });

/** A crash in the 3D tree must not take the portfolio content down with it. */
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useKeyboard() {
  useEffect(() => {
    const held = new Set<string>();
    const direction = () => (held.has("ArrowRight") ? 1 : 0) - (held.has("ArrowLeft") ? 1 : 0);

    const down = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.closest("input, textarea, select");
      if (event.key === "Escape") {
        if (!document.querySelector("dialog[open]")) closeSection();
        return;
      }
      if (typing || game().activeSection || game().sceneFailed) return;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        held.add(event.key);
        setMove(direction());
      } else if (event.code === "Space") {
        // A keyboard user on a focused control keeps the normal button behaviour.
        if (target.closest("button, a, summary")) return;
        event.preventDefault();
        if (!event.repeat) dropClaw();
      } else if (/^[1-6]$/.test(event.key) && !event.repeat) {
        if (game().mode !== "quick") setMode("quick");
        quickSelect(COLLECTIBLES[Number(event.key) - 1].id);
      }
    };
    const up = (event: KeyboardEvent) => {
      if (held.delete(event.key)) setMove(direction());
    };
    const blur = () => {
      held.clear();
      setMove(0);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
}

/** Keeps the URL hash and browser back button in step with the open section. */
function useHashRouting() {
  const booted = useGame((s) => s.booted);
  const active = useGame((s) => s.activeSection);
  const fromHistory = useRef(false);

  useEffect(() => {
    if (!booted) return;
    const fromHash = () => bySlug(window.location.hash.slice(1))?.id ?? null;
    const initial = fromHash();
    if (initial) {
      fromHistory.current = true;
      openSection(initial);
    }
    const pop = () => {
      fromHistory.current = true;
      const id = fromHash();
      if (id) openSection(id);
      else closeSection();
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, [booted]);

  useEffect(() => {
    if (!booted) return;
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    const next = active ? `#${byId(active).slug}` : window.location.pathname + window.location.search;
    const current = window.location.hash;
    if ((active && current !== next) || (!active && current)) window.history.pushState(null, "", next);
  }, [active, booted]);
}

export function Experience() {
  const sceneFailed = useGame((s) => s.sceneFailed);
  const phase = useGame((s) => s.phase);
  const revealId = useGame((s) => s.revealId);
  const revealing = revealId !== null;
  const set = useGame((s) => s.set);
  const [sceneReady, setSceneReady] = useState(false);
  const markReady = useCallback(() => setSceneReady(true), []);

  const failScene = useCallback(() => set({ sceneFailed: true }), [set]);

  useEffect(() => {
    startEngine();
    set({ hiScore: loadHiScore() });
    if (!supportsWebGL()) failScene();
  }, [set, failScene]);

  // A very slow device should see the machine appear, not a loader that never ends.
  useEffect(() => {
    const id = setTimeout(markReady, 20000);
    return () => clearTimeout(id);
  }, [markReady]);

  useKeyboard();
  useHashRouting();

  // Everything but the prize steps aside during the win moment.
  const hud = `transition-opacity duration-500 ${revealing ? "pointer-events-none opacity-0" : ""}`;

  return (
    <main className="arcade-room fixed inset-0 flex select-none flex-col overflow-hidden">
      <div className="arcade-floor" aria-hidden="true" />
      {/* On small screens the canvas is shorter than the page, so the color shift happens here too. */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ background: revealId ? byId(revealId).backdrop : undefined, opacity: revealing ? 1 : 0 }}
        aria-hidden="true"
      />

      <TopBar />

      <div className={`short:hidden xl:hidden ${hud}`}>
        <StatusStrip />
        <SkillRail />
        {/* The sign on the machine is too small to read at this size, so repeat its last line. */}
        <p className="hidden px-6 pt-1 text-center text-xs leading-snug text-cream/70 [@media(min-height:720px)]:block lg:hidden!">
          Explore my journey, projects, skills, and experiences through an interactive claw machine.
        </p>
      </div>

      <div className="relative min-h-0 flex-1 short:mr-[18.5rem] lg:mr-[21.5rem] xl:absolute xl:inset-0 xl:mr-0">
        {sceneFailed ? (
          <div className="flex h-full items-center justify-center p-6">
            <div className="glass max-w-sm rounded-2xl p-6 text-center">
              <p className="pixel mb-2 text-sm text-gold">MACHINE OFFLINE</p>
              <p className="text-sm leading-relaxed text-cream/80">
                This browser can&apos;t run the 3D machine. You can still explore everything from the collectible menu at the top.
              </p>
            </div>
          </div>
        ) : (
          <SceneBoundary onError={failScene}>
            <Scene onReady={markReady} onContextLost={failScene} paused={phase === "section"} />
          </SceneBoundary>
        )}
        <div className={hud}>
          <SkillFloat />
        </div>
      </div>

      <div className={`absolute left-6 top-20 z-20 hidden xl:block ${hud}`}>
        <StatusPanel />
      </div>
      <div className={`relative z-20 shrink-0 px-2 ${sceneFailed ? "hidden" : ""} pb-[max(.5rem,env(safe-area-inset-bottom))] ${hud} short:absolute short:right-0 short:top-12 short:w-[18.5rem] short:pb-0 lg:absolute lg:right-3 lg:top-[7.4rem] lg:w-auto lg:p-0 xl:right-6 xl:top-20`}>
        <Console />
      </div>

      <RevealOverlay />
      <SectionLayer />
      <ParticleBurst />
      <BootLoader sceneReady={sceneReady || sceneFailed} />
    </main>
  );
}
