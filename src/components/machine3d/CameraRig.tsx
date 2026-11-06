"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { byId } from "@/data/collectibles";
import { FOCUS } from "@/game/layout";
import { pose } from "@/game/pose";
import { isBusy, useGame } from "@/game/store";
import { prefersReducedMotion } from "@/game/capabilities";

const FIT_HEIGHT = 10.9;
const FIT_WIDTH = 7.2;
const TARGET_Y = 5.02;

/** Keeps the machine framed at any aspect ratio, and runs the zoom-in on a win. */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const pointer = useRef({ x: 0, y: 0 });
  const zoom = useRef(1);
  const position = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const focusPosition = useMemo(() => new THREE.Vector3(), []);
  const focusLook = useMemo(() => new THREE.Vector3(FOCUS.x, FOCUS.y - 0.42, FOCUS.z), []);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useFrame((state, delta) => {
    const ratio = state.size.width / state.size.height;

    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const distance = Math.max(FIT_HEIGHT / (2 * Math.tan(halfFov)), FIT_WIDTH / (2 * Math.tan(halfFov) * ratio)) + 2;

    // A slight push-in while the claw is working.
    const busy = isBusy(useGame.getState().phase);
    const zoomTarget = busy ? 0.93 : 1;
    zoom.current += (zoomTarget - zoom.current) * Math.min(1, delta * 2.2);

    if (!reduced) {
      pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, delta * 3);
      pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, delta * 3);
    }

    position.set(pointer.current.x * 0.8, TARGET_Y + 0.9 + pointer.current.y * 0.4, distance * zoom.current);
    look.set(0, TARGET_Y, 0);

    const focusDistance = Math.max(9.5, 4.6 / (2 * Math.tan(halfFov) * ratio));
    focusPosition.set(FOCUS.x, FOCUS.y + 0.2, FOCUS.z + focusDistance);

    const f = pose.focus;
    position.lerp(focusPosition, f);
    look.lerp(focusLook, f);
    camera.position.copy(position);
    camera.lookAt(look);
  });

  return null;
}

/** Curtain between the machine and the won prize: background shifts to the section's color. */
export function FocusCurtain() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const { revealId, activeSection } = useGame.getState();
    const id = revealId ?? activeSection;
    if (!mesh.current || !material.current) return;
    mesh.current.visible = pose.focus > 0.001;
    if (id) material.current.color.set(byId(id).backdrop);
    material.current.opacity = pose.focus * 0.92;
  });

  return (
    <mesh ref={mesh} position={[0, 4.5, 3]} visible={false}>
      <planeGeometry args={[60, 40]} />
      <meshBasicMaterial ref={material} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
