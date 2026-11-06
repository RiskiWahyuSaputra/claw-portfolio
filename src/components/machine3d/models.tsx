"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { PrizeId } from "@/data/collectibles";
import { laptopScreenTexture } from "./textures";

/** Deterministic, so server and client layouts never disagree. */
export function seededRandom(start: number) {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

const lathe = (points: [number, number][]) =>
  new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), 40);

function MiniDev() {
  return (
    <group position={[0, -0.4, 0]} scale={1.04}>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.07, 36]} />
        <meshStandardMaterial color="#26214f" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.2, 0.2, 8, 20]} />
        <meshStandardMaterial color="#6f58c9" roughness={0.55} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.24, 0.28, 0.02]} rotation={[0, 0, side * 0.2]}>
          <capsuleGeometry args={[0.06, 0.18, 6, 12]} />
          <meshStandardMaterial color="#8a74e0" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.25, 32, 24]} />
        <meshStandardMaterial color="#e9bb92" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.79, -0.015]} rotation={[-0.25, 0, 0]}>
        <sphereGeometry args={[0.265, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial color="#14162e" roughness={0.75} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.095, 0.71, 0.225]}>
          <sphereGeometry args={[0.032, 14, 14]} />
          <meshStandardMaterial color="#14162e" roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0.76, 0]}>
        <torusGeometry args={[0.275, 0.022, 10, 36, Math.PI]} />
        <meshStandardMaterial color="#8ecbff" metalness={0.6} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.27, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.085, 0.085, 0.07, 22]} />
          <meshStandardMaterial color="#8ecbff" emissive="#3a84c9" emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function MiniLaptop() {
  const screen = useMemo(() => laptopScreenTexture(), []);
  return (
    <group position={[0, -0.25, 0.05]} rotation={[0.1, 0, 0]}>
      <RoundedBox args={[0.98, 0.06, 0.68]} radius={0.025} smoothness={3}>
        <meshStandardMaterial color="#b9c6e4" metalness={0.75} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0.034, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.84, 0.38]} />
        <meshStandardMaterial color="#1a2140" roughness={0.7} />
      </mesh>
      <group position={[0, 0.03, -0.33]} rotation={[-0.22, 0, 0]}>
        <RoundedBox args={[0.98, 0.66, 0.045]} radius={0.02} smoothness={3} position={[0, 0.33, 0]}>
          <meshStandardMaterial color="#b9c6e4" metalness={0.75} roughness={0.28} />
        </RoundedBox>
        <mesh position={[0, 0.33, 0.025]}>
          <planeGeometry args={[0.9, 0.57]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function MiniRocket() {
  const body = useMemo(
    () => lathe([[0, -0.42], [0.14, -0.42], [0.21, -0.22], [0.235, 0], [0.2, 0.2], [0.11, 0.38], [0, 0.48]]),
    [],
  );
  return (
    <group rotation={[0, 0, -0.14]} scale={1.04}>
      <mesh geometry={body}>
        <meshStandardMaterial color="#f4ecdc" metalness={0.15} roughness={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.355, 0]}>
        <coneGeometry args={[0.132, 0.2, 32]} />
        <meshStandardMaterial color="#ff7b9c" metalness={0.2} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.06, 0.205]}>
        <sphereGeometry args={[0.088, 24, 20]} />
        <meshStandardMaterial color="#8ecbff" metalness={0.5} roughness={0.12} emissive="#2a6fb0" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.06, 0.2]}>
        <torusGeometry args={[0.095, 0.02, 12, 32]} />
        <meshStandardMaterial color="#8b90a8" metalness={0.8} roughness={0.25} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3 + Math.PI / 2, 0]}>
          <mesh position={[0.26, -0.3, 0]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.17, 0.26, 0.035]} />
            <meshStandardMaterial color="#ff7b9c" metalness={0.2} roughness={0.32} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.53, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.24, 20]} />
        <meshBasicMaterial color="#ffb45e" toneMapped={false} />
      </mesh>
    </group>
  );
}

function MiniTrophy() {
  const cup = useMemo(
    () => lathe([[0, -0.03], [0.1, -0.02], [0.2, 0.08], [0.27, 0.26], [0.29, 0.46], [0.26, 0.46], [0.24, 0.28], [0.15, 0.1], [0, 0.06]]),
    [],
  );
  return (
    <group position={[0, -0.28, 0]}>
      <RoundedBox args={[0.5, 0.13, 0.42]} radius={0.03} smoothness={3} position={[0, -0.14, 0]}>
        <meshStandardMaterial color="#2b2560" metalness={0.5} roughness={0.32} />
      </RoundedBox>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.13, 0.17, 0.06, 28]} />
        <meshStandardMaterial color="#f0dfba" metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.042, 0.062, 0.2, 20]} />
        <meshStandardMaterial color="#f0dfba" metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh geometry={cup} position={[0, 0.16, 0]}>
        <meshStandardMaterial color="#f6e7c8" metalness={0.95} roughness={0.17} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.28, 0.42, 0]} rotation={[0, side > 0 ? 0 : Math.PI, -Math.PI / 2]}>
          <torusGeometry args={[0.11, 0.024, 12, 26, Math.PI]} />
          <meshStandardMaterial color="#f0dfba" metalness={0.92} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function createCells() {
  const greens = ["#123f33", "#1a6e4f", "#28a874", "#6df0b0"];
  const out: { p: [number, number, number]; color: string }[] = [];
  const rand = seededRandom(7);
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        const corner = Math.abs(x) + Math.abs(y) + Math.abs(z) === 3;
        if (corner && rand() > 0.6) continue;
        out.push({ p: [x * 0.235, y * 0.235, z * 0.235], color: greens[Math.floor(rand() * greens.length)] });
      }
  return out;
}

function PixelCube() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cells = useMemo(() => createCells(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    cells.forEach((cell, i) => {
      m.setPosition(...cell.p);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(cell.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cells]);

  return (
    <group rotation={[0.42, 0.62, 0]} scale={1.05}>
      <instancedMesh ref={ref} args={[undefined, undefined, cells.length]}>
        <boxGeometry args={[0.215, 0.215, 0.215]} />
        <meshStandardMaterial roughness={0.35} metalness={0.15} emissive="#1f8f63" emissiveIntensity={0.34} />
      </instancedMesh>
    </group>
  );
}

function GoldenCapsule() {
  return (
    <group rotation={[0.2, 0, 0.32]} scale={1.08}>
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.39, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffc94d" metalness={1} roughness={0.14} emissive="#b97800" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.39, 40, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#fff0c7" metalness={0.85} roughness={0.2} emissive="#a86b00" emissiveIntensity={0.34} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.392, 0.03, 14, 56]} />
        <meshBasicMaterial color="#fff3cf" toneMapped={false} />
      </mesh>
      <Sparkles count={18} scale={1.5} size={3.2} speed={0.45} color="#ffe39a" />
    </group>
  );
}

function createStar() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 0.27 : 0.115;
    const angle = Math.PI / 2 + (i * Math.PI) / 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.13, bevelEnabled: false });
}

function HoloToken() {
  const star = useMemo(() => createStar(), []);
  return (
    <group scale={1.06}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.09, 56]} />
        <meshPhysicalMaterial
          color="#c9d4ff"
          metalness={0.92}
          roughness={0.16}
          iridescence={1}
          iridescenceIOR={1.8}
          iridescenceThicknessMinimum={180}
          iridescenceThicknessMaximum={620}
          emissive="#3d2fb0"
          emissiveIntensity={0.42}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[0.452, 0.034, 14, 64]} />
        <meshBasicMaterial color="#9ff0ff" toneMapped={false} />
      </mesh>
      <mesh geometry={star} position={[0, 0, -0.065]}>
        <meshBasicMaterial color="#e9fcff" toneMapped={false} />
      </mesh>
      <Sparkles count={22} scale={1.7} size={3.4} speed={0.5} color="#9ff0ff" />
    </group>
  );
}

export const PRIZE_MODELS: Record<PrizeId, () => React.ReactNode> = {
  who: MiniDev,
  work: MiniLaptop,
  journey: MiniRocket,
  certificates: MiniTrophy,
  contribution: PixelCube,
  contact: GoldenCapsule,
  secret: HoloToken,
};
