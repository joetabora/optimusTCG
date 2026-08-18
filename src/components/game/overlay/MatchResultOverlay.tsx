"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PlayerId } from "@/engine/types/ids";
import { overlayFadeVariants } from "../animations/motion-presets";

interface MatchResultOverlayProps {
  winnerId: PlayerId | null;
  winReason: string | null;
  onRematch: () => void;
}

export function MatchResultOverlay({
  winnerId,
  winReason,
  onRematch,
}: MatchResultOverlayProps) {
  if (!winnerId) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      variants={overlayFadeVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[var(--helix-surface-elevated)] p-8 text-center shadow-2xl">
        <p className="text-sm uppercase tracking-[0.22em] text-white/50">
          Match Complete
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--helix-nexus)]">
          Player {winnerId.toUpperCase()} Wins
        </h2>
        {winReason ? (
          <p className="mt-2 text-sm text-white/65">{winReason}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              onRematch();
            }}
            className="min-h-11 rounded-full border border-cyan-300/35 bg-cyan-500/15 px-5 py-2 text-sm font-semibold text-cyan-50"
          >
            Rematch
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80"
          >
            Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
