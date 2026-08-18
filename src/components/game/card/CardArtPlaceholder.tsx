"use client";

import { cn } from "@/lib/utils";
import type { FactionId } from "@/engine/types/card-meta";
import { FACTION_COLORS } from "@/lib/game/card-presenter";

const FACTION_GLYPH: Record<FactionId, string> = {
  synapse: "◈",
  lattice: "⬡",
  fluxbound: "⚡",
  neutral: "○",
};

interface CardArtPlaceholderProps {
  name: string;
  faction: FactionId;
  kind: string;
  className?: string;
}

export function CardArtPlaceholder({
  name,
  faction,
  kind,
  className,
}: CardArtPlaceholderProps) {
  const color = FACTION_COLORS[faction];

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md",
        className,
      )}
      style={{
        background: `linear-gradient(145deg, color-mix(in oklch, ${color} 35%, black), color-mix(in oklch, ${color} 12%, black))`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 9px)",
        }}
      />
      <span
        className="text-3xl font-light drop-shadow-lg"
        style={{ color }}
        aria-hidden
      >
        {FACTION_GLYPH[faction]}
      </span>
      <span className="mt-2 px-2 text-center text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white/70">
        {kind}
      </span>
      <span className="absolute bottom-2 left-2 right-2 truncate text-center text-[0.62rem] font-semibold text-white/85">
        {name}
      </span>
    </div>
  );
}
