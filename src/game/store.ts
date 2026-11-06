import { create } from "zustand";
import { COLLECTIBLES, type CollectibleId, type PrizeId } from "@/data/collectibles";

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

type GameState = {
  phase: Phase;
  mode: Mode;
  /** True when the 3D machine cannot run here. Sections stay reachable from the dock. */
  sceneFailed: boolean;
  booted: boolean;
  collected: CollectibleId[];
  /** The secret prize has dropped into the machine. */
  secretUnlocked: boolean;
  secretClaimed: boolean;
  /** Name typed on the Machine Cleared card, kept when the card is reopened. */
  playerName: string;
  hiScore: number;
  credits: number;
  activeSection: PrizeId | null;
  /** Prize being shown in the reveal overlay. */
  revealId: PrizeId | null;
  hovered: PrizeId | null;
  /** Prize directly under the claw in manual mode. */
  aimed: PrizeId | null;
  message: string;
  music: boolean;
  sfx: boolean;
  set: (patch: Partial<GameState>) => void;
};

export const READY_MESSAGE = "READY TO PLAY";

export const useGame = create<GameState>((set) => ({
  phase: "idle",
  mode: "quick",
  sceneFailed: false,
  booted: false,
  collected: [],
  secretUnlocked: false,
  secretClaimed: false,
  playerName: "",
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

type Progress = Pick<GameState, "collected" | "secretUnlocked" | "secretClaimed">;

export const secretAvailable = (s: Progress) => s.secretUnlocked && !s.secretClaimed;

/** The "what's left" line shown on every status display. */
export function availabilityLine(s: Progress) {
  if (secretAvailable(s)) return "1 SECRET PRIZE AVAILABLE";
  const left = COLLECTIBLES.length - s.collected.length;
  if (left === 0) return s.secretClaimed ? "ALL PRIZES CLAIMED" : `${s.collected.length}/${COLLECTIBLES.length} COLLECTED`;
  return `${left} COLLECTIBLE${left > 1 ? "S" : ""} AVAILABLE`;
}
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
