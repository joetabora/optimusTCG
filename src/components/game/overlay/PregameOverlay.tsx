"use client";

import { motion } from "framer-motion";
import type { PlayerId } from "@/engine/types/ids";
import type { PregameStage } from "@/engine/types/state";
import { overlayFadeVariants } from "../animations/motion-presets";

interface PregameOverlayProps {
  pregame: PregameStage;
  playerId: PlayerId;
  canControl: boolean;
  mulliganUsed: boolean;
  onKeepHand: () => void;
  onMulligan: () => void;
  waitingForOpponent?: boolean;
}

export function PregameOverlay({
  pregame,
  playerId,
  canControl,
  mulliganUsed,
  onKeepHand,
  onMulligan,
  waitingForOpponent = false,
}: PregameOverlayProps) {
  if (pregame === "complete") {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-24 z-40 flex justify-center px-4"
      variants={overlayFadeVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="pointer-events-auto w-full max-w-lg rounded-3xl border border-white/10 bg-[var(--helix-glass)] p-6 text-center shadow-2xl backdrop-blur-md">
        <p className="text-sm uppercase tracking-[0.22em] text-white/50">
          Opening Uplink
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Player {playerId.toUpperCase()} — Mulligan
        </h2>
        {waitingForOpponent ? (
          <p className="mt-3 text-sm text-white/65">Waiting for opponent…</p>
        ) : canControl ? (
          <>
            <p className="mt-3 text-sm text-white/65">
              Keep your hand or shuffle back into the Vault and redraw.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  onKeepHand();
                }}
                className="min-h-11 rounded-full border border-cyan-300/35 bg-cyan-500/15 px-5 py-2 text-sm font-semibold text-cyan-50"
              >
                Keep Hand
              </button>
              <button
                type="button"
                disabled={mulliganUsed}
                onPointerDown={(event) => {
                  event.preventDefault();
                  onMulligan();
                }}
                className="min-h-11 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {mulliganUsed ? "Mulligan Used" : "Mulligan"}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-white/65">
            Waiting for Player {playerId.toUpperCase()}…
          </p>
        )}
      </div>
    </motion.div>
  );
}
