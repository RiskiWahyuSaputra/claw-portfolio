import gsap from "gsap";
import { COLLECTIBLES, SECRET_PRIZE, byId, type PrizeId } from "@/data/collectibles";
import { audio } from "./audio";
import { prefersReducedMotion } from "./capabilities";
import { CHUTE, CLAW, DOOR, FOCUS, SLOTS } from "./layout";
import { pose } from "./pose";
import { game, READY_MESSAGE, saveHiScore, secretAvailable, type Phase } from "./store";

/** Celebration hook, wired to the particle canvas. */
export const fx: { burst: (color: string) => void } = { burst: () => {} };

let timeline: gsap.core.Timeline | null = null;
let moveInput = 0;
let tickerStarted = false;

const setPhase = (phase: Phase, message?: string) =>
  game().set(message ? { phase, message } : { phase });

const SECRET_MESSAGE = "SECRET PRIZE UNLOCKED";

/** Every prize currently inside the machine. */
function available(): PrizeId[] {
  const state = game();
  const ids: PrizeId[] = COLLECTIBLES.filter((c) => !state.collected.includes(c.id)).map((c) => c.id);
  return secretAvailable(state) ? [...ids, SECRET_PRIZE.id] : ids;
}

export const canGrab = (id: PrizeId) => available().includes(id);

function availabilityMessage() {
  if (secretAvailable(game())) return SECRET_MESSAGE;
  return available().length === 0 ? "MACHINE CLEARED" : READY_MESSAGE;
}

function aimedPrize(): PrizeId | null {
  let best: PrizeId | null = null;
  let bestDistance: number = CLAW.tolerance;
  for (const id of available()) {
    const distance = Math.abs(SLOTS[id].x - pose.x);
    if (distance <= bestDistance) {
      best = id;
      bestDistance = distance;
    }
  }
  return best;
}

/** Manual movement. Runs every frame but only acts while the machine is idle. */
function tick(_time: number, delta: number) {
  const seconds = Math.min(delta, 50) / 1000;
  const { phase, mode, aimed, set } = game();
  const input = phase === "idle" ? moveInput : 0;

  pose.stick += (input - pose.stick) * Math.min(1, seconds * 14);

  if (phase !== "idle") return;
  if (input !== 0) {
    pose.x = gsap.utils.clamp(CLAW.minX, CLAW.maxX, pose.x + input * CLAW.speed * seconds);
  }
  const next = mode === "manual" ? aimedPrize() : null;
  if (next !== aimed) {
    set({ aimed: next });
    if (next) audio.click();
  }
}

export function startEngine() {
  if (tickerStarted) return;
  tickerStarted = true;
  gsap.ticker.add(tick);
}

export function setMove(direction: number) {
  const { phase, mode, set } = game();
  if (direction !== 0 && mode !== "manual") set({ mode: "manual" });
  const moving = direction !== 0 && phase === "idle";
  if (moving && moveInput === 0) audio.motor(true);
  if (!moving) audio.motor(false);
  moveInput = direction;
}

function newTimeline() {
  timeline?.kill();
  timeline = gsap.timeline({ defaults: { ease: "sine.inOut" } });
  // Reduced motion keeps the logic but compresses the show.
  if (prefersReducedMotion()) timeline.timeScale(3.5);
  return timeline;
}

const travelTime = (fromX: number, toX: number) => gsap.utils.clamp(0.5, 1.5, Math.abs(toX - fromX) / 2.6);

function pressDropButton(tl: gsap.core.Timeline) {
  tl.to(pose, { dropPress: 1, duration: 0.09, ease: "power2.out" });
  tl.to(pose, { dropPress: 0, duration: 0.24 }, ">0.08");
}

/** Steps 3 to 8 of the grab: descend, grip, lift, carry, release, reveal. */
function grabSequence(tl: gsap.core.Timeline, id: PrizeId) {
  const slot = SLOTS[id];
  const gripY = slot.y + CLAW.gripOffset;
  const prize = pose.prize;

  tl.call(() => {
    setPhase("descending", "CLAW DESCENDING");
    audio.drop();
  });
  tl.to(pose, { z: slot.z, duration: 0.35 });
  tl.to(pose, { y: gripY, duration: 1.25, ease: "power1.inOut" }, "<0.05");

  tl.call(() => setPhase("gripping", "GRIPPING"));
  tl.to(pose, { open: 0.12, duration: 0.42, ease: "power2.in" });
  tl.call(() => {
    audio.grip();
    Object.assign(prize, { id, x: slot.x, y: slot.y, z: slot.z, scale: 1, spin: 0 });
  });

  tl.call(() => {
    setPhase("lifting", "LIFTING");
    audio.lift();
  }, undefined, ">0.14");
  tl.to(pose, { y: CLAW.homeY, duration: 1.05, ease: "power1.inOut" });
  tl.to(prize, { y: CLAW.homeY - CLAW.gripOffset, duration: 1.05, ease: "power1.inOut" }, "<");

  const carryTime = travelTime(slot.x, CHUTE.x) + 0.15;
  tl.call(() => {
    setPhase("carrying", "TO THE PRIZE CHUTE");
    audio.motor(true);
  });
  tl.to(pose, { x: CHUTE.x, z: CHUTE.z, duration: carryTime });
  tl.to(prize, { x: CHUTE.x, z: CHUTE.z, duration: carryTime }, "<");

  tl.call(() => {
    audio.motor(false);
    setPhase("releasing", "RELEASE");
    audio.release();
  });
  tl.to(pose, { open: 1, duration: 0.3, ease: "power2.out" });
  tl.to(prize, { y: CHUTE.rimY - 0.2, duration: 0.62, ease: "power2.in" }, "<0.08");
  tl.to(prize, { scale: 0.001, duration: 0.14, ease: "power1.in" }, ">-0.14");
  tl.call(() => audio.thud());

  // Prize comes out of the door, then floats to the front of the machine.
  tl.to(pose, { door: 1, duration: 0.28, ease: "back.out(2)" }, ">0.08");
  tl.call(() => {
    Object.assign(prize, { x: DOOR.x, y: DOOR.y, z: DOOR.z });
    collect(id);
    setPhase("revealing", "PRIZE WON");
    game().set({ revealId: id });
    audio.win();
    fx.burst(byId(id).accent);
  });
  tl.to(prize, { scale: 1.75, duration: 0.7, ease: "back.out(1.5)" });
  tl.to(prize, { x: FOCUS.x, y: FOCUS.y, z: FOCUS.z, duration: 1, ease: "power2.inOut" }, "<");
  tl.to(prize, { spin: Math.PI * 2, duration: 2.3, ease: "power1.inOut" }, "<");
  tl.to(pose, { focus: 1, duration: 1.1, ease: "power2.inOut" }, "<");
  tl.to(pose, { door: 0, duration: 0.35 }, "<0.5");
  tl.to({}, { duration: 0.55 });
  tl.call(() => openSection(id, true));
}

function collect(id: PrizeId) {
  const { collected, hiScore, set } = game();
  if (id === "secret") {
    set({ secretClaimed: true });
    return;
  }
  if (collected.includes(id)) return;
  const next = [...collected, id];
  const best = Math.max(hiScore, next.length);
  set({ collected: next, hiScore: best });
  if (best !== hiScore) saveHiScore(best);
}

/** MODE 1: pick a prize and the claw does the rest. */
export function quickSelect(id: PrizeId) {
  if (game().phase !== "idle" || !canGrab(id)) return false;

  // The lock is taken synchronously: a timeline callback would leave a one-frame gap.
  setPhase("moving", `TARGET: ${byId(id).title.toUpperCase()}`);
  game().set({ hovered: null, aimed: null });
  setMove(0);
  audio.motor(true);

  const slot = SLOTS[id];
  const tl = newTimeline();
  tl.to(pose, { open: 1, duration: 0.4 });
  tl.to(pose, { x: slot.x, duration: travelTime(pose.x, slot.x) }, "<");
  tl.call(() => audio.motor(false));
  pressDropButton(tl);
  grabSequence(tl, id);
  return true;
}

/** MODE 2: DROP at the claw's current position. */
export function dropClaw() {
  const { phase, set } = game();
  if (phase !== "idle") return false;

  const target = aimedPrize();
  setPhase("moving", "DROP");
  setMove(0);
  set({ aimed: null, mode: "manual" });
  const tl = newTimeline();
  pressDropButton(tl);
  tl.to(pose, { open: 1, duration: 0.3 }, 0);

  if (target) {
    tl.to(pose, { x: SLOTS[target].x, duration: 0.2 });
    grabSequence(tl, target);
    return true;
  }

  tl.call(() => {
    setPhase("descending", "CLAW DESCENDING");
    audio.drop();
  });
  tl.to(pose, { y: CLAW.missY, duration: 1.1, ease: "power1.inOut" });
  tl.call(() => setPhase("gripping", "GRIPPING"));
  tl.to(pose, { open: 0.12, duration: 0.4, ease: "power2.in" });
  tl.call(() => {
    setPhase("lifting", "NOTHING THERE, TRY AGAIN");
    audio.miss();
  });
  tl.to(pose, { y: CLAW.homeY, duration: 0.95 });
  tl.to(pose, { open: 0.55, duration: 0.3 });
  tl.call(() => setPhase("idle", availabilityMessage()));
  return false;
}

/** Opens a section. Without a claw win this is the dock's direct navigation. */
export function openSection(id: PrizeId, fromClaw = false) {
  const { phase, set } = game();
  if (!fromClaw && phase !== "idle" && phase !== "section") return;
  if (!fromClaw) audio.click();
  set({ activeSection: id, phase: "section", revealId: null, hovered: null, aimed: null });
}

/** BACK TO MACHINE: the camera pulls out and the claw parks at home. */
export function closeSection() {
  const { phase, set } = game();
  if (phase !== "section") return;
  audio.click();
  const wasFocused = pose.focus > 0;
  set({ activeSection: null, phase: "returning", message: "WELCOME BACK" });

  const tl = newTimeline();
  tl.to(pose, { focus: 0, duration: wasFocused ? 1 : 0.01, ease: "power2.inOut" });
  tl.to(pose.prize, { scale: 0.001, duration: 0.4 }, 0);
  tl.to(pose, { x: pose.x, open: 0.55, duration: 0.4 }, "<");
  tl.call(() => {
    pose.prize.id = null;
  });

  const { collected, secretUnlocked } = game();
  if (collected.length === COLLECTIBLES.length && !secretUnlocked) unlockSecret(tl);
  tl.call(() => setPhase("idle", availabilityMessage()));
}

/** The machine celebrates, then the seventh prize falls into the pit. */
function unlockSecret(tl: gsap.core.Timeline) {
  tl.call(() => {
    game().set({ secretUnlocked: true, message: SECRET_MESSAGE });
    audio.win();
    fx.burst(SECRET_PRIZE.accent);
  }, undefined, ">0.2");
  tl.fromTo(pose, { secretDrop: 0 }, { secretDrop: 1, duration: 1.2, ease: "bounce.out" });
  tl.call(() => audio.thud(), undefined, "<0.42");
}

/** Restocks the machine after a full run. */
export function refill() {
  const { phase, set } = game();
  if (phase !== "idle") return;
  audio.coin();
  setPhase("returning", "RESTOCKING");
  set({ collected: [], secretUnlocked: false, secretClaimed: false });
  pose.secretDrop = 0;
  const tl = newTimeline();
  tl.fromTo(pose, { refill: 0 }, { refill: 1, duration: 0.8, ease: "back.out(1.8)" });
  tl.call(() => setPhase("idle", READY_MESSAGE));
}

export function insertCoin() {
  const { credits, phase, set } = game();
  audio.coin();
  set({ credits: credits + 1 });
  if (phase === "idle") set({ message: "COIN ACCEPTED" });
  gsap.delayedCall(1.4, () => {
    if (game().phase === "idle" && game().message === "COIN ACCEPTED") {
      set({ message: availabilityMessage() });
    }
  });
}

export function setMode(mode: "quick" | "manual") {
  const { set, phase } = game();
  audio.click();
  setMove(0);
  set({ mode, aimed: null, message: phase === "idle" ? availabilityMessage() : game().message });
}
