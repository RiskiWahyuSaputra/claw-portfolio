import { CLAW } from "./layout";
import type { CollectibleId } from "@/data/collectibles";

/**
 * Mutable per-frame state. GSAP writes it, renderers read it inside their own loop,
 * so a running animation never causes a React re-render.
 */
export const pose = {
  x: CLAW.homeX,
  y: CLAW.homeY,
  z: CLAW.homeZ,
  /** 0 = closed, 1 = fully open. */
  open: 0.55,
  /** Smoothed joystick tilt, -1 to 1. */
  stick: 0,
  /** Press depth of the DROP button, 0 to 1. */
  dropPress: 0,
  /** Prize door flap, 0 = closed, 1 = open. */
  door: 0,
  /** Camera and backdrop focus on the won prize, 0 to 1. */
  focus: 0,
  /** Sideways swing of the claw hub, written by the renderer. */
  swing: 0,
  /** Scale of the machine contents while refilling, 0 to 1. */
  refill: 1,
  prize: {
    id: null as CollectibleId | null,
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
    spin: 0,
  },
};
