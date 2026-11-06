import { create } from "zustand";
import type { CollectibleId } from "@/data/collectibles";

export type Phase =
  | "idle"
  | "moving"
  | "descending"
  | "gripping"
  | "lifting"
  | "carrying"
  | "releasing"
  | "revealing"
  | "section"
  | "returning";

export type Mode = "quick" | "manual";
export type Renderer = "detecting" | "3d" | "lite";

type GameState = {
  phase: Phase;
  mode: Mode;
  renderer: Renderer;
  booted: boolean;
  collected: CollectibleId[];
  hiScore: number;
  credits: number;
  activeSection: CollectibleId | null;
  /** Prize being shown in the reveal overlay. */
  revealId: CollectibleId | null;
  hovered: CollectibleId | null;
  /** Prize directly under the claw in manual mode. */
  aimed: CollectibleId | null;
  message: string;
  music: boolean;
  sfx: boolean;
  set: (patch: Partial<GameState>) => void;
};

export const READY_MESSAGE = "READY TO PLAY";

export const useGame = create<GameState>((set) => ({
  phase: "idle",
  mode: "quick",
  renderer: "detecting",
  booted: false,
  collected: [],
  hiScore: 0,
  credits: 0,
  activeSection: null,
  revealId: null,
  hovered: null,
  aimed: null,
  message: READY_MESSAGE,
  music: false,
  sfx: false,
  set: (patch) => set(patch),
}));

export const game = () => useGame.getState();
export const isBusy = (phase: Phase) => phase !== "idle" && phase !== "section";

const HI_SCORE_KEY = "claw-portfolio:hi-score";

export function loadHiScore() {
  try {
    return Number(localStorage.getItem(HI_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveHiScore(score: number) {
  try {
    localStorage.setItem(HI_SCORE_KEY, String(score));
  } catch {
    // Private mode: the score simply lasts for this visit.
  }
}
