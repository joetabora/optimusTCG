"use client";

import { cn } from "@/lib/utils";
import type { PlayerId } from "@/engine/types/ids";

interface NexusPanelProps {
  playerId: PlayerId;
  integrity: number;
  label: string;
  side: "opponent" | "player";
  targetable?: boolean;
  onSelect?: () => void;
  selected?: boolean;
}

export function NexusPanel({
  playerId,
  integrity,
  label,
  side,
  targetable = false,
  onSelect,
  selected = false,
}: NexusPanelProps) {
  return (
    <button
      type="button"
      onPointerDown={(event) => {
        event.preventDefault();
        onSelect?.();
      }}
      disabled={!targetable}
      className={cn(
        "group flex min-h-11 min-w-[9rem] items-center gap-3 rounded-2xl border border-white/10 bg-[var(--helix-glass)] px-4 py-2 text-left backdrop-blur-md transition",
        side === "opponent" ? "self-start" : "self-end",
        targetable && "cursor-pointer ring-amber-300/70 hover:ring-2",
        selected && "ring-2 ring-amber-300",
        !targetable && "cursor-default",
      )}
      aria-label={`${label} Nexus Integrity ${integrity}`}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold",
          side === "opponent"
            ? "border-red-300/30 bg-red-950/40 text-red-100"
            : "border-cyan-300/30 bg-cyan-950/40 text-cyan-100",
        )}
      >
        {playerId.toUpperCase()}
      </div>
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/55">
          {label}
        </p>
        <p className="font-mono text-lg font-semibold text-[var(--helix-nexus)]">
          {integrity}
        </p>
        <p className="text-[0.62rem] text-white/45">Nexus Integrity</p>
      </div>
    </button>
  );
}
