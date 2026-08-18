"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FloatingEffect } from "@/hooks/use-animation-queue";

export function AnimationOverlay({
  effects,
}: {
  effects: FloatingEffect[];
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-sm font-semibold font-mono shadow-lg backdrop-blur-sm"
            style={{
              color:
                effect.kind === "damage"
                  ? "var(--helix-damage)"
                  : effect.kind === "ability"
                    ? "var(--helix-flux)"
                    : "var(--helix-nexus)",
              background: "var(--helix-glass)",
            }}
          >
            {effect.label}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export type { FloatingEffect };
