"use client";

import { Suspense, use, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig, FocusCurtain } from "./CameraRig";
import { Cabinet } from "./Cabinet";
import { Claw } from "./Claw";
import { Prizes } from "./Prizes";
import { loadTextureFonts } from "./textures";

const fontsReady = typeof document !== "undefined" ? loadTextureFonts() : Promise.resolve();

function Lights() {
  return (
    <>
      <ambientLight intensity={0.42} color="#b9b4ff" />
      <spotLight
        position={[0.6, 7, 0.4]}
        angle={1}
        penumbra={0.75}
        intensity={46}
        decay={1.7}
        color="#fff2dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />
      <pointLight position={[-4.5, 5, 6]} intensity={46} color="#8ecbff" />
      <pointLight position={[5, 3.5, 6]} intensity={42} color="#a993ff" />
      <directionalLight position={[0, 6, 12]} intensity={0.75} color="#ffffff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#dfe9ff" position={[0, 6, 9]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#a993ff" position={[-9, 3, 4]} rotation={[0, Math.PI / 2, 0]} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#8ecbff" position={[9, 3, 4]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 6, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#ffe2b0" position={[0, 9, -2]} rotation={[Math.PI / 2, 0, 0]} scale={7} />
      </Environment>
    </>
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    frames.current += 1;
    if (!done.current && frames.current >= 3) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

function World({ onReady }: { onReady: () => void }) {
  use(fontsReady);
  return (
    <>
      <Lights />
      <Cabinet />
      <Claw />
      <Prizes />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.72} scale={15} blur={2.8} far={5} frames={1} color="#02030c" />
      <FocusCurtain />
      <CameraRig />
      <ReadySignal onReady={onReady} />
    </>
  );
}

type Props = { onReady: () => void; onContextLost: () => void; paused: boolean };

export default function Scene({ onReady, onContextLost, paused }: Props) {
  const [dpr, setDpr] = useState(1.6);

  return (
    <Canvas
      dpr={dpr}
      shadows="percentage"
      frameloop={paused ? "never" : "always"}
      camera={{ fov: 27, position: [0, 5.6, 26], near: 0.5, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.04;
        gl.domElement.addEventListener("webglcontextlost", onContextLost);
      }}
    >
      {/* Slow devices keep the full machine and trade resolution for frame rate. */}
      <PerformanceMonitor onDecline={() => setDpr((current) => Math.max(1, current - 0.3))} />
      <Suspense fallback={null}>
        <World onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
