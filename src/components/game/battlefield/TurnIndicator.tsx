"use client";

import type { PhaseId, PlayerId } from "@/engine/types/ids";
import { cn } from "@/lib/utils";

interface TurnIndicatorProps {
  cycle: number;
  phase: PhaseId;
  activePlayerId: PlayerId;
}

const PHASE_LABELS: Record<PhaseId, string> = {
  ignition: "Ignition",
  draw: "Draw",
  operations: "Operations",
  resolution: "Resolution",
  cooldown: "Cooldown",
};

export function TurnIndicator({
  cycle,
  phase,
  activePlayerId,
}: TurnIndicatorProps) {
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-white/10 bg-[var(--helix-glass)] px-4 py-2 backdrop-blur-md">
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/55">
          Cycle {cycle}
        </p>
        <p className="text-sm font-semibold text-white/90">
          Player {activePlayerId.toUpperCase()}
        </p>
      </div>
      <div
        className={cn(
          "rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
          phase === "operations"
            ? "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-300/30"
            : "bg-white/5 text-white/65",
        )}
      >
        {PHASE_LABELS[phase]}
      </div>
    </div>
  );
}
