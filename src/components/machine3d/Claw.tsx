"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pose } from "@/game/pose";
import { useGame } from "@/game/store";
import { byId } from "@/data/collectibles";
import { CHAMBER } from "@/game/layout";
import { Glow } from "./Glow";

const RAIL_Y = 6.92;
const CLOSED = 0.06;
const OPENED = 0.74;

const prongCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.3, -0.24, 0),
  new THREE.Vector3(0.36, -0.56, 0),
  new THREE.Vector3(0.22, -0.84, 0),
  new THREE.Vector3(0.09, -0.93, 0),
]);

function Prong({ angle, innerRef }: { angle: number; innerRef: (g: THREE.Group | null) => void }) {
  const tube = useMemo(() => new THREE.TubeGeometry(prongCurve, 28, 0.045, 10, false), []);
  return (
    <group rotation={[0, angle, 0]}>
      <group ref={innerRef} position={[0.13, -0.1, 0]}>
        <mesh geometry={tube} castShadow>
          <meshStandardMaterial color="#d7dcec" metalness={0.95} roughness={0.2} />
        </mesh>
        <mesh position={[0.09, -0.93, 0]} castShadow>
          <sphereGeometry args={[0.068, 16, 14]} />
          <meshStandardMaterial color="#8ecbff" emissive="#2f6fb5" emissiveIntensity={0.8} metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export function Claw() {
  const carriage = useRef<THREE.Group>(null);
  const bridge = useRef<THREE.Group>(null);
  const cable = useRef<THREE.Mesh>(null);
  const hub = useRef<THREE.Group>(null);
  const prongs = useRef<(THREE.Group | null)[]>([]);
  const beam = useRef<THREE.Mesh>(null);
  const beamMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const physics = useRef({ swing: 0, velocity: 0, lastX: pose.x });
  const beamColor = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = physics.current;

    // A damped spring: the hub lags behind the carriage, then settles.
    const carriageVelocity = (pose.x - s.lastX) / Math.max(dt, 0.001);
    s.lastX = pose.x;
    s.velocity += (-s.swing * 42 - s.velocity * 5.5 - carriageVelocity * 1.15) * dt;
    s.swing = THREE.MathUtils.clamp(s.swing + s.velocity * dt, -0.2, 0.2);
    pose.swing = s.swing;

    if (carriage.current) carriage.current.position.set(pose.x, RAIL_Y, pose.z);
    if (bridge.current) bridge.current.position.x = pose.x;

    const hubX = pose.x + s.swing;
    if (hub.current) {
      hub.current.position.set(hubX, pose.y, pose.z);
      hub.current.rotation.z = -s.swing * 0.5;
    }
    if (cable.current) {
      const length = RAIL_Y - pose.y;
      cable.current.position.set(pose.x + s.swing / 2, pose.y + length / 2, pose.z);
      cable.current.scale.y = length;
      cable.current.rotation.z = Math.atan2(s.swing, length);
    }
    const spread = THREE.MathUtils.lerp(CLOSED, OPENED, pose.open);
    prongs.current.forEach((prong) => {
      if (prong) prong.rotation.z = spread - 0.42;
    });

    const { mode, phase, aimed } = useGame.getState();
    const showBeam = mode === "manual" && phase === "idle";
    if (beam.current && beamMaterial.current) {
      beam.current.visible = showBeam;
      if (showBeam) {
        const top = pose.y - 0.9;
        const bottom = CHAMBER.floor + 0.3;
        beam.current.position.set(hubX, (top + bottom) / 2, pose.z);
        beam.current.scale.set(1, top - bottom, 1);
        beamMaterial.current.color.copy(beamColor.set(aimed ? byId(aimed).accent : "#8ecbff"));
        beamMaterial.current.opacity = aimed ? 0.26 : 0.1;
      }
    }
  });

  return (
    <group>
      {/* Rails along the ceiling */}
      {[-1.5, 1.5].map((z) => (
        <mesh key={z} position={[0, RAIL_Y + 0.08, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 5.5, 12]} />
          <meshStandardMaterial color="#9aa3bf" metalness={0.92} roughness={0.25} />
        </mesh>
      ))}
      <group ref={bridge} position={[0, RAIL_Y + 0.08, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.052, 0.052, 3.05, 12]} />
          <meshStandardMaterial color="#c7cede" metalness={0.92} roughness={0.22} />
        </mesh>
      </group>
      <group ref={carriage}>
        <mesh>
          <boxGeometry args={[0.42, 0.2, 0.42]} />
          <meshStandardMaterial color="#222a55" metalness={0.65} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.1, 0.13, 0.08, 18]} />
          <meshStandardMaterial color="#f4ecdc" metalness={0.4} roughness={0.35} />
        </mesh>
      </group>
      <mesh ref={cable}>
        <cylinderGeometry args={[0.016, 0.016, 1, 8]} />
        <meshStandardMaterial color="#d7dcec" metalness={0.9} roughness={0.3} />
      </mesh>
      <group ref={hub}>
        <mesh castShadow>
          <cylinderGeometry args={[0.17, 0.25, 0.27, 24]} />
          <meshStandardMaterial color="#f4ecdc" metalness={0.35} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.07, 0.15, 0.1, 18]} />
          <meshStandardMaterial color="#232b58" metalness={0.65} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.235, 0.024, 10, 36]} />
          <meshBasicMaterial color="#8ecbff" toneMapped={false} />
        </mesh>
        <Glow color="#8ecbff" size={1} opacity={0.26} position={[0, -0.09, 0]} />
        {[0, 1, 2].map((i) => (
          <Prong
            key={i}
            angle={(i * Math.PI * 2) / 3 + Math.PI / 6}
            innerRef={(g) => {
              prongs.current[i] = g;
            }}
          />
        ))}
      </group>
      <mesh ref={beam} visible={false}>
        <cylinderGeometry args={[0.03, 0.34, 1, 24, 1, true]} />
        <meshBasicMaterial
          ref={beamMaterial}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
