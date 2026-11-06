"use client";

import { useEffect, useRef } from "react";
import { fx } from "@/game/engine";
import { prefersReducedMotion } from "@/game/capabilities";

type Particle = { x: number; y: number; vx: number; vy: number; size: number; life: number; color: string; spin: number };

/** Pixel confetti, drawn on its own canvas above the whole page. */
export function ParticleBurst() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    let particles: Particle[] = [];
    let frame = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, el.width, el.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.life -= dt;
        p.vy += 900 * dt;
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.spin += dt * 7;
        ctx.globalAlpha = Math.min(1, p.life * 1.8);
        ctx.fillStyle = p.color;
        const w = p.size * Math.abs(Math.cos(p.spin));
        ctx.fillRect(p.x - w / 2, p.y - p.size / 2, Math.max(w, 1.5), p.size);
      }
      ctx.globalAlpha = 1;
      if (particles.length) frame = requestAnimationFrame(step);
      else frame = 0;
    };

    fx.burst = (color) => {
      if (prefersReducedMotion()) return;
      el.width = window.innerWidth;
      el.height = window.innerHeight;
      const colors = [color, color, "#f4ecdc", "#8ecbff", "#ffd166"];
      const originX = el.width / 2;
      const originY = el.height * 0.58;
      for (let i = 0; i < 130; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.5;
        const speed = 320 + Math.random() * 620;
        particles.push({
          x: originX + (Math.random() - 0.5) * 80,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 6,
          life: 1 + Math.random() * 1.1,
          color: colors[i % colors.length],
          spin: Math.random() * 6,
        });
      }
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    };

    return () => {
      fx.burst = () => {};
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[60] size-full" aria-hidden="true" />;
}
