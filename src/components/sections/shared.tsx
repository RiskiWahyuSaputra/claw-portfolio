"use client";

import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm ${className}`}>{children}</div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="pixel mb-3 text-xs text-[var(--accent)]">{children}</h2>;
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-cream/80">{children}</span>;
}
