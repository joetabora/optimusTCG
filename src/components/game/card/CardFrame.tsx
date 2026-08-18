"use client";

import { cn } from "@/lib/utils";
import type { CardDisplayModel } from "@/lib/game/card-presenter";
import { FACTION_COLORS } from "@/lib/game/card-presenter";
import { CardArtPlaceholder } from "./CardArtPlaceholder";

interface CardFrameProps {
  card: CardDisplayModel;
  faceDown?: boolean;
  orientation?: "hand" | "field" | "inspect";
  exhausted?: boolean;
  selected?: boolean;
  targetable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CardFrame({
  card,
  faceDown = false,
  orientation = "field",
  exhausted = false,
  selected = false,
  targetable = false,
  className,
  children,
}: CardFrameProps) {
  const factionColor = FACTION_COLORS[card.faction];
  const isInspect = orientation === "inspect";
  const widthVar = isInspect ? "var(--card-width-inspect)" : "var(--card-width)";
  const heightVar = isInspect ? "var(--card-height-inspect)" : "var(--card-height)";

  if (faceDown) {
    return (
      <div
        className={cn(
          "relative rounded-xl border border-white/10 bg-[linear-gradient(145deg,#1a2230,#0d1118)] shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
          className,
        )}
        style={{ width: widthVar, height: heightVar }}
      >
        <div className="absolute inset-2 rounded-lg border border-cyan-400/20 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_70%)]" />
        <div className="absolute inset-0 flex items-center justify-center text-cyan-300/50 text-2xl">
          ⬡
        </div>
      </div>
    );
  }

  const remainingStability = Math.max(0, card.stability - card.damageMarked);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 bg-[#101622] shadow-[0_12px_28px_rgba(0,0,0,0.5)]",
        exhausted && "opacity-75 saturate-75",
        selected && "ring-2 ring-cyan-300/80",
        targetable && "ring-2 ring-amber-300/90",
        className,
      )}
      style={{
        width: widthVar,
        height: heightVar,
        borderColor: factionColor,
        boxShadow: selected
          ? `0 0 0 1px ${factionColor}, 0 16px 40px rgba(0,0,0,0.55)`
          : undefined,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: factionColor }}
      />

      <div className="absolute left-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[0.65rem] font-bold font-mono text-cyan-200 ring-1 ring-cyan-400/40">
        {card.fluxCost}
      </div>

      {card.kind === "construct" || card.kind === "installation" ? (
        <>
          <div className="absolute bottom-1.5 left-1.5 z-10 flex h-6 min-w-6 items-center justify-center rounded-md bg-black/75 px-1 text-[0.65rem] font-bold font-mono text-amber-100 ring-1 ring-amber-400/35">
            {card.impact}
          </div>
          <div className="absolute bottom-1.5 right-1.5 z-10 flex h-6 min-w-6 items-center justify-center rounded-md bg-black/75 px-1 text-[0.65rem] font-bold font-mono text-emerald-100 ring-1 ring-emerald-400/35">
            {remainingStability}
          </div>
        </>
      ) : null}

      <div className="absolute inset-[0.45rem] bottom-8 overflow-hidden rounded-md">
        <CardArtPlaceholder
          name={card.name}
          faction={card.faction}
          kind={card.kind}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-black/78 px-2 py-1">
        <p className="truncate text-[0.62rem] font-semibold text-white/90">
          {card.name}
        </p>
      </div>

      {card.damageMarked > 0 ? (
        <div className="absolute right-1.5 top-8 rounded bg-red-950/80 px-1 text-[0.55rem] font-mono text-red-200">
          -{card.damageMarked}
        </div>
      ) : null}

      {card.statuses.length > 0 ? (
        <div className="absolute left-1.5 top-8 flex gap-0.5">
          {card.statuses.map((status) => (
            <span
              key={status}
              className="rounded bg-violet-900/80 px-1 text-[0.5rem] uppercase tracking-wide text-violet-100"
            >
              {status.slice(0, 3)}
            </span>
          ))}
        </div>
      ) : null}

      {children}
    </div>
  );
}
