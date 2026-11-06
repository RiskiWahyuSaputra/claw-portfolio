import type { CollectibleId } from "@/data/collectibles";

/** Shared world coordinates for the game logic and the 3D scene. */
export const CHAMBER = { minX: -2.7, maxX: 2.7, floor: 2.75, ceiling: 7.1, depth: 1.72 };

export const CLAW = {
  homeX: -1.85,
  homeZ: 0,
  homeY: 6.2,
  minX: -1.85,
  maxX: 2.45,
  /** Distance from the hub to the centre of a gripped prize. */
  gripOffset: 0.84,
  /** How deep an empty claw reaches when the player misses. */
  missY: 4.5,
  speed: 2.5,
  /** Horizontal tolerance for a manual drop to count as aligned. */
  tolerance: 0.3,
};

export const CHUTE = { x: -1.85, z: 0.1, rimY: 3.0 };
export const DOOR = { x: -1.85, y: 1.28, z: 2.2 };
export const FOCUS = { x: 0, y: 4.5, z: 3.6 };

export type Slot = { x: number; y: number; z: number; tilt: number };

/** One distinct X per prize so each stays reachable with LEFT/RIGHT only. */
export const SLOTS: Record<CollectibleId, Slot> = {
  who: { x: -0.55, y: 3.92, z: 0.72, tilt: -0.22 },
  work: { x: 0.05, y: 4.2, z: -0.62, tilt: 0.3 },
  journey: { x: 0.65, y: 3.94, z: 0.72, tilt: 0.14 },
  certificates: { x: 1.25, y: 4.24, z: -0.62, tilt: -0.3 },
  contribution: { x: 1.85, y: 3.9, z: 0.72, tilt: 0.45 },
  contact: { x: 2.42, y: 4.18, z: -0.5, tilt: -0.16 },
};
