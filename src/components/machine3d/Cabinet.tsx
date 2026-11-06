"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { COLLECTIBLES } from "@/data/collectibles";
import { dropClaw, insertCoin, setMove } from "@/game/engine";
import { CHAMBER, CHUTE, DOOR } from "@/game/layout";
import { pose } from "@/game/pose";
import { isBusy, useGame } from "@/game/store";
import { Glow } from "./Glow";
import {
  backWallTexture,
  doorTexture,
  glassStreakTexture,
  marqueeTexture,
  statusDisplay,
} from "./textures";

const NAVY = "#171d45";
const NAVY_DEEP = "#0f1433";
const CREAM = "#f1e7d3";

const hoverable = {
  onPointerOver: () => {
    document.body.dataset.cursor = "grab";
  },
  onPointerOut: () => {
    delete document.body.dataset.cursor;
  },
};

function Neon({ position, length, color, horizontal = false }: {
  position: [number, number, number];
  length: number;
  color: string;
  horizontal?: boolean;
}) {
  return (
    <mesh position={position} rotation={horizontal ? [0, 0, Math.PI / 2] : undefined}>
      <cylinderGeometry args={[0.028, 0.028, length, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function MarqueeLights() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const clock = useRef(0);
  const dots = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const w = 3.2;
    const top = 9.22;
    const bottom = 7.72;
    const z = 2.16;
    for (let i = 0; i <= 26; i++) {
      const x = -w + (i / 26) * w * 2;
      out.push(new THREE.Vector3(x, top, z));
    }
    for (let i = 1; i < 6; i++) out.push(new THREE.Vector3(w, top - (i / 6) * (top - bottom), z));
    for (let i = 26; i >= 0; i--) {
      const x = -w + (i / 26) * w * 2;
      out.push(new THREE.Vector3(x, bottom, z));
    }
    for (let i = 5; i >= 1; i--) out.push(new THREE.Vector3(-w, top - (i / 6) * (top - bottom), z));
    return out;
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    dots.forEach((dot, i) => {
      matrix.setPosition(dot);
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, new THREE.Color("#ffffff"));
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [dots]);

  const on = useMemo(() => new THREE.Color("#fff3cf"), []);
  const alt = useMemo(() => new THREE.Color("#a993ff"), []);
  const off = useMemo(() => new THREE.Color("#3a3a6e"), []);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const busy = isBusy(useGame.getState().phase);
    const rate = busy ? 0.05 : 0.16;
    if (state.clock.elapsedTime - clock.current < rate) return;
    clock.current = state.clock.elapsedTime;
    const head = Math.floor(state.clock.elapsedTime / rate);
    dots.forEach((_, i) => {
      const lit = (i + head) % 4 === 0;
      mesh.setColorAt(i, lit ? on : (i + head) % 4 === 2 ? alt : off);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dots.length]}>
      <sphereGeometry args={[0.04, 10, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function StatusPanel() {
  const panel = useMemo(() => statusDisplay(), []);

  useEffect(() => {
    const render = () => {
      const { message, collected, credits } = useGame.getState();
      const left = COLLECTIBLES.length - collected.length;
      const secondary = left === 0
        ? `${collected.length}/${COLLECTIBLES.length} COLLECTED`
        : `${left} COLLECTIBLE${left > 1 ? "S" : ""} AVAILABLE`;
      panel.draw(message, credits ? `${secondary} / CREDIT ${credits}` : secondary, "#ffd166");
    };
    render();
    return useGame.subscribe(render);
  }, [panel]);

  return (
    <mesh position={[1.12, 1.58, 2.118]}>
      <planeGeometry args={[3, 0.75]} />
      <meshBasicMaterial map={panel.texture} toneMapped={false} />
    </mesh>
  );
}

function PrizeDoor() {
  const flap = useRef<THREE.Group>(null);
  const texture = useMemo(() => doorTexture(), []);
  useFrame(() => {
    if (flap.current) flap.current.rotation.x = pose.door * 1.15;
  });
  return (
    <group position={[DOOR.x, DOOR.y, 2.1]}>
      <RoundedBox args={[2, 1.5, 0.06]} radius={0.03} smoothness={3}>
        <meshStandardMaterial color={CREAM} metalness={0.3} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, 0.034]}>
        <planeGeometry args={[1.8, 1.3]} />
        <meshStandardMaterial color="#04050f" roughness={0.9} />
      </mesh>
      <group ref={flap} position={[0, 0.64, 0.05]}>
        <mesh position={[0, -0.64, 0]}>
          <planeGeometry args={[1.78, 1.28]} />
          <meshStandardMaterial map={texture} metalness={0.3} roughness={0.32} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function CoinSlot() {
  const insert = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    insertCoin();
  };
  return (
    <group position={[1.12, 0.72, 2.11]} onClick={insert} {...hoverable}>
      <RoundedBox args={[0.74, 0.62, 0.05]} radius={0.03} smoothness={3}>
        <meshStandardMaterial color="#bcc4d8" metalness={0.92} roughness={0.24} />
      </RoundedBox>
      <mesh position={[0, 0.03, 0.03]}>
        <planeGeometry args={[0.07, 0.34]} />
        <meshBasicMaterial color="#05060f" />
      </mesh>
      <mesh position={[0, -0.22, 0.03]}>
        <planeGeometry args={[0.32, 0.05]} />
        <meshBasicMaterial color="#ffd166" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Speaker({ x }: { x: number }) {
  return (
    <group position={[x, 0.72, 2.112]}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 0.25 - i * 0.1, 0]}>
          <planeGeometry args={[0.62, 0.035]} />
          <meshBasicMaterial color="#080a1e" />
        </mesh>
      ))}
    </group>
  );
}

/** The physical deck. Everything here is live, not decoration. */
function ControlDeck() {
  const stick = useRef<THREE.Group>(null);
  const drop = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const dragging = useRef<number | null>(null);

  useFrame(() => {
    if (stick.current) stick.current.rotation.z = -pose.stick * 0.42;
    if (drop.current) drop.current.position.y = 0.06 - pose.dropPress * 0.05;
    if (left.current) left.current.position.y = pose.stick < -0.1 ? 0.025 : 0.05;
    if (right.current) right.current.position.y = pose.stick > 0.1 ? 0.025 : 0.05;
  });

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (dragging.current === null) return;
      const value = (event.clientX - dragging.current) / 34;
      setMove(Math.abs(value) < 0.12 ? 0 : THREE.MathUtils.clamp(value, -1, 1));
    };
    const stop = () => {
      if (dragging.current !== null || pressed.current) setMove(0);
      dragging.current = null;
      pressed.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const pressed = useRef(false);
  const hold = (direction: number) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    pressed.current = true;
    setMove(direction);
  };

  return (
    <group position={[0, 2.5, 2.42]} rotation={[0.42, 0, 0]}>
      <RoundedBox args={[6.1, 0.2, 1.06]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color={NAVY} metalness={0.5} roughness={0.33} />
      </RoundedBox>
      <mesh position={[0, 0.102, 0.46]}>
        <boxGeometry args={[5.9, 0.012, 0.04]} />
        <meshStandardMaterial color={CREAM} metalness={0.4} roughness={0.35} />
      </mesh>

      {/* Joystick */}
      <group position={[-1.1, 0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.3, 0.05, 28]} />
          <meshStandardMaterial color="#c7cede" metalness={0.9} roughness={0.25} />
        </mesh>
        <group ref={stick}>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.42, 14]} />
            <meshStandardMaterial color="#c7cede" metalness={0.9} roughness={0.22} />
          </mesh>
          <mesh
            position={[0, 0.47, 0]}
            {...hoverable}
            onPointerDown={(event) => {
              event.stopPropagation();
              dragging.current = event.nativeEvent.clientX;
            }}
          >
            <sphereGeometry args={[0.18, 26, 20]} />
            <meshStandardMaterial color="#a993ff" emissive="#5a3fc2" emissiveIntensity={0.55} roughness={0.22} />
          </mesh>
        </group>
      </group>

      {/* LEFT / RIGHT */}
      {[
        { ref: left, x: 0.05, direction: -1, color: "#8ecbff" },
        { ref: right, x: 0.72, direction: 1, color: "#8ecbff" },
      ].map(({ ref, x, direction, color }) => (
        <group key={direction} position={[x, 0.1, 0]}>
          <group ref={ref} position={[0, 0.05, 0]}>
            <mesh onPointerDown={hold(direction)} {...hoverable}>
              <cylinderGeometry args={[0.2, 0.22, 0.09, 26]} />
              <meshStandardMaterial color={color} emissive="#2f6fb5" emissiveIntensity={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, direction > 0 ? 0 : Math.PI]}>
              <circleGeometry args={[0.09, 3]} />
              <meshBasicMaterial color={NAVY_DEEP} />
            </mesh>
          </group>
        </group>
      ))}

      {/* DROP */}
      <group position={[2.0, 0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.44, 0.05, 32]} />
          <meshStandardMaterial color={CREAM} metalness={0.4} roughness={0.35} />
        </mesh>
        <group ref={drop} position={[0, 0.06, 0]}>
          <mesh
            onClick={(event) => {
              event.stopPropagation();
              dropClaw();
            }}
            {...hoverable}
          >
            <cylinderGeometry args={[0.34, 0.36, 0.12, 32]} />
            <meshStandardMaterial color="#ff7b9c" emissive="#c23a68" emissiveIntensity={0.75} roughness={0.25} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function Cabinet() {
  const textures = useMemo(
    () => ({ marquee: marqueeTexture(), wall: backWallTexture(), streak: glassStreakTexture() }),
    [],
  );

  const chamberHeight = CHAMBER.ceiling - CHAMBER.floor + 0.2;
  const chamberY = (CHAMBER.ceiling + CHAMBER.floor) / 2;

  return (
    <group>
      {/* Base */}
      <RoundedBox args={[6.2, 2.75, 4.2]} radius={0.1} smoothness={3} position={[0, 1.375, 0]} castShadow>
        <meshStandardMaterial color={NAVY} metalness={0.5} roughness={0.36} />
      </RoundedBox>
      <mesh position={[0, 2.72, 0]}>
        <boxGeometry args={[6.26, 0.1, 4.26]} />
        <meshStandardMaterial color={CREAM} metalness={0.3} roughness={0.34} />
      </mesh>
      <Neon position={[0, 0.16, 2.12]} length={5.8} color="#a993ff" horizontal />
      <Glow color="#a993ff" size={5} opacity={0.14} position={[0, 0.16, 2.2]} />

      <PrizeDoor />
      <StatusPanel />
      <CoinSlot />
      <Speaker x={0.1} />
      <Speaker x={2.14} />
      <ControlDeck />

      {/* Chamber */}
      <mesh position={[0, chamberY, -CHAMBER.depth - 0.2]}>
        <planeGeometry args={[5.9, chamberHeight]} />
        <meshStandardMaterial map={textures.wall} emissive="#ffffff" emissiveMap={textures.wall} emissiveIntensity={0.42} roughness={0.7} />
      </mesh>
      <mesh position={[0.95, CHAMBER.floor + 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.9, 4]} />
        <meshStandardMaterial color="#1a1b52" roughness={0.6} />
      </mesh>
      <mesh position={[-1.9, CHAMBER.floor + 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 4]} />
        <meshStandardMaterial color="#04050f" roughness={0.9} />
      </mesh>

      {/* Prize chute */}
      <mesh position={[CHUTE.x, CHAMBER.floor + 0.1, CHUTE.z]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.03, 12, 56]} />
        <meshBasicMaterial color="#ffd166" toneMapped={false} />
      </mesh>
      <Glow color="#ffd166" size={2.5} opacity={0.2} position={[CHUTE.x, CHAMBER.floor + 0.14, CHUTE.z]} />
      <mesh position={[-0.98, CHAMBER.floor + 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.7, 1]} />
        <meshPhysicalMaterial color="#b9d8ff" transparent opacity={0.13} roughness={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[-0.98, CHAMBER.floor + 1.02, 0]}>
        <boxGeometry args={[0.05, 0.05, 3.7]} />
        <meshStandardMaterial color={CREAM} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Ceiling light */}
      <mesh position={[0, CHAMBER.ceiling + 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.8, 3.9]} />
        <meshBasicMaterial color="#d9e6ff" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Pillars and neon edges */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <RoundedBox
            key={`${sx}${sz}`}
            args={[0.22, chamberHeight + 0.1, 0.22]}
            radius={0.05}
            smoothness={3}
            position={[sx * 3, chamberY, sz * 2]}
          >
            <meshStandardMaterial color={NAVY_DEEP} metalness={0.6} roughness={0.32} />
          </RoundedBox>
        )),
      )}
      <Neon position={[-2.85, chamberY, 2.03]} length={chamberHeight} color="#8ecbff" />
      <Neon position={[2.85, chamberY, 2.03]} length={chamberHeight} color="#c7b5ff" />
      <Glow color="#8ecbff" size={2.2} opacity={0.12} position={[-2.85, chamberY, 2.1]} />
      <Glow color="#c7b5ff" size={2.2} opacity={0.12} position={[2.85, chamberY, 2.1]} />

      {/* Glass */}
      <mesh position={[0, chamberY, 1.98]}>
        <planeGeometry args={[5.82, chamberHeight]} />
        <meshPhysicalMaterial
          color="#cfe2ff"
          transparent
          opacity={0.07}
          roughness={0.04}
          metalness={0.1}
          envMapIntensity={1.8}
          clearcoat={1}
          clearcoatRoughness={0.04}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, chamberY, 1.99]}>
        <planeGeometry args={[5.82, chamberHeight]} />
        <meshBasicMaterial map={textures.streak} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 2.96, chamberY, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.9, chamberHeight]} />
          <meshPhysicalMaterial color="#cfe2ff" transparent opacity={0.1} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}

      {/* Hood and marquee */}
      <RoundedBox args={[6.3, 0.46, 4.3]} radius={0.09} smoothness={3} position={[0, 7.4, 0]}>
        <meshStandardMaterial color={NAVY} metalness={0.5} roughness={0.36} />
      </RoundedBox>
      <mesh position={[0, 7.62, 0]}>
        <boxGeometry args={[6.34, 0.06, 4.34]} />
        <meshStandardMaterial color={CREAM} metalness={0.3} roughness={0.34} />
      </mesh>
      <RoundedBox args={[6.6, 1.72, 1.2]} radius={0.1} smoothness={3} position={[0, 8.47, 1.52]}>
        <meshStandardMaterial color={NAVY_DEEP} metalness={0.55} roughness={0.34} />
      </RoundedBox>
      <mesh position={[0, 8.47, 2.125]}>
        <planeGeometry args={[6.26, 1.4]} />
        <meshBasicMaterial map={textures.marquee} toneMapped={false} />
      </mesh>
      <MarqueeLights />
      <Glow color="#7f6bff" size={9} opacity={0.14} position={[0, 8.5, 2.3]} />
    </group>
  );
}
