"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { glowTexture } from "./textures";

let shared: THREE.Texture | null = null;
const getTexture = () => (shared ??= glowTexture());

type Props = {
  color: string;
  size: number;
  opacity?: number;
  position?: [number, number, number];
};

/** Cheap additive light bloom: a soft sprite instead of a post-processing pass. */
export const Glow = forwardRef<THREE.Sprite, Props>(function Glow({ color, size, opacity = 0.6, position }, ref) {
  const map = useMemo(getTexture, []);
  return (
    <sprite ref={ref} position={position} scale={[size, size, 1]}>
      <spriteMaterial
        map={map}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
});
