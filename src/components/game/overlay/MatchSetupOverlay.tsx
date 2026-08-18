"use client";

import { motion } from "framer-motion";
import type { MatchMode } from "@/hooks/use-helix-match";
import { overlayFadeVariants } from "../animations/motion-presets";

interface MatchSetupOverlayProps {
  onStart: (mode: MatchMode) => void;
}

export function MatchSetupOverlay({ onStart }: MatchSetupOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      variants={overlayFadeVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[var(--helix-surface-elevated)] p-8 text-center shadow-2xl">
        <p className="text-sm uppercase tracking-[0.22em] text-white/50">
          Local Play
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--helix-nexus)]">
          New Match
        </h1>
        <p className="mt-2 text-sm text-white/65">
          Choose a mode to begin. Both modes include an opening mulligan phase.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              onStart("vsAi");
            }}
            className="min-h-12 rounded-full border border-cyan-300/35 bg-cyan-500/15 px-5 py-3 text-sm font-semibold text-cyan-50"
          >
            Human vs AI
          </button>
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              onStart("hotSeat");
            }}
            className="min-h-12 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80"
          >
            Hot Seat (2 Players)
          </button>
        </div>
      </div>
    </motion.div>
  );
}
