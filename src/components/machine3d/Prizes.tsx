"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { ALL_PRIZES, byId, type Collectible } from "@/data/collectibles";
import { canGrab, quickSelect } from "@/game/engine";
import { CHAMBER, SLOTS } from "@/game/layout";
import { pose } from "@/game/pose";
import { secretAvailable, useGame } from "@/game/store";
import { prefersReducedMotion } from "@/game/capabilities";
import { Glow } from "./Glow";
import { PRIZE_MODELS, seededRandom } from "./models";

function setCursor(value: string | null) {
  if (value) document.body.dataset.cursor = value;
  else delete document.body.dataset.cursor;
}

function Prize({ item }: { item: Collectible }) {
  const root = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Sprite>(null);
  const hoverScale = useRef(1);
  const slot = SLOTS[item.id];
  const Model = PRIZE_MODELS[item.id];
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const isSecret = item.id === "secret";
  const rare = item.id === "contact" || isSecret;

  useFrame(({ clock }, delta) => {
    const group = root.current;
    if (!group) return;
    const state = useGame.getState();
    const { hovered, aimed } = state;
    const held = pose.prize.id === item.id;
    const inMachine = item.id === "secret" ? secretAvailable(state) : !state.collected.includes(item.id);
    group.visible = held || inMachine;
    if (!group.visible) return;

    const t = clock.elapsedTime;
    const focused = hovered === item.id || aimed === item.id;
    hoverScale.current += ((focused ? 1.13 : 1) - hoverScale.current) * Math.min(1, delta * 10);

    if (held) {
      const attached = pose.open < 0.5;
      group.position.set(pose.prize.x + (attached ? pose.swing : 0), pose.prize.y, pose.prize.z);
      group.scale.setScalar(pose.prize.scale);
      group.rotation.z = THREE.MathUtils.lerp(slot.tilt, 0, Math.min(1, pose.focus * 2));
      if (spinner.current) spinner.current.rotation.y = pose.prize.spin;
    } else {
      const bob = reduced ? 0 : Math.sin(t * 0.9 + item.index * 1.3) * 0.028;
      // The secret prize falls from the ceiling when it unlocks.
      const fall = isSecret ? (1 - pose.secretDrop) * 2.7 : 0;
      group.position.set(slot.x, slot.y + bob + fall, slot.z);
      group.scale.setScalar(hoverScale.current * Math.max(pose.refill, 0.001));
      group.rotation.z = slot.tilt;
      if (spinner.current && !reduced) {
        spinner.current.rotation.y = isSecret ? t * 1.1 : Math.sin(t * 0.5 + item.index) * 0.4;
      }
    }

    if (halo.current) {
      const material = halo.current.material as THREE.SpriteMaterial;
      const base = rare ? 0.6 + Math.sin(t * 2.2) * 0.14 : focused ? 0.4 : 0;
      material.opacity = held ? Math.max(base, 0.2 + pose.focus * 0.55) : base;
      const size = (rare ? 2.3 : 1.6) * (1 + pose.focus * 0.9);
      halo.current.scale.set(size, size, 1);
    }
  });

  const enter = (event: ThreeEvent<PointerEvent>) => {
    const { phase, mode, set } = useGame.getState();
    if (phase !== "idle" || mode !== "quick" || !canGrab(item.id)) return;
    event.stopPropagation();
    set({ hovered: item.id });
    setCursor("grab");
  };
  const leave = () => {
    const { hovered, set } = useGame.getState();
    if (hovered === item.id) set({ hovered: null });
    setCursor(null);
  };
  const click = (event: ThreeEvent<MouseEvent>) => {
    if (useGame.getState().mode !== "quick" || !canGrab(item.id)) return;
    event.stopPropagation();
    setCursor(null);
    quickSelect(item.id);
  };

  return (
    <group ref={root} position={[slot.x, slot.y, slot.z]}>
      <Glow ref={halo} color={item.accent} size={1.6} opacity={0} position={[0, 0, -0.25]} />
      <group ref={spinner} scale={1.16}>
        <Model />
      </group>
      {/* A generous invisible target, so a small prize is still easy to tap. */}
      <mesh onPointerOver={enter} onPointerOut={leave} onClick={click}>
        <sphereGeometry args={[0.6, 12, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PrizeLabel() {
  const hovered = useGame((s) => s.hovered);
  const aimed = useGame((s) => s.aimed);
  const id = hovered ?? aimed;
  if (!id) return null;
  const item = byId(id);
  const slot = SLOTS[id];
  return (
    <Html position={[slot.x, slot.y + 0.82, slot.z]} center zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
      <div className="prize-tag" style={{ "--tag": item.accent } as React.CSSProperties}>
        <span>{item.number}</span>
        {item.title}
      </div>
    </Html>
  );
}

const BALL_COLORS = ["#3b3a86", "#5a52b4", "#3d62ad", "#7a72cc", "#8fb2e2", "#cfc4f2", "#f0e6d0", "#2e3a80"];

function createBalls() {
  const rand = seededRandom(42);
  return Array.from({ length: 150 }, () => {
    const x = -0.86 + rand() * 3.5;
    const z = (rand() * 2 - 1) * (CHAMBER.depth - 0.2);
    const radius = 0.17 + rand() * 0.15;
    const mound = 0.3 * Math.cos((z / CHAMBER.depth) * 1.2) + 0.06;
    return {
      p: new THREE.Vector3(x, CHAMBER.floor + radius + rand() * mound + (z < 0 ? 0.28 : 0), z),
      radius,
      color: BALL_COLORS[Math.floor(rand() * BALL_COLORS.length)],
    };
  });
}

/** Soft filler balls: they give the pit depth without competing with the prizes. */
function BallPit() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const balls = useMemo(() => createBalls(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    balls.forEach((ball, i) => {
      matrix.makeScale(ball.radius, ball.radius, ball.radius).setPosition(ball.p);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, color.set(ball.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [balls]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, balls.length]} receiveShadow>
      <sphereGeometry args={[1, 20, 14]} />
      <meshStandardMaterial roughness={0.28} metalness={0.12} />
    </instancedMesh>
  );
}

export function Prizes() {
  useEffect(() => () => setCursor(null), []);
  return (
    <group>
      <BallPit />
      {ALL_PRIZES.map((item) => (
        <Prize key={item.id} item={item} />
      ))}
      <PrizeLabel />
    </group>
  );
}
