"use client";

import type { CardCatalog } from "@/engine/catalog/schema";
import type { PlayerId } from "@/engine/types/ids";
import type { GameState } from "@/engine/types/state";
import { resolveCardDisplay } from "@/lib/game/card-presenter";
import { GameCard } from "../card/GameCard";
import { useInteraction } from "../interaction/InteractionProvider";

interface HandZoneProps {
  playerId: PlayerId;
  state: GameState;
  catalog: CardCatalog;
  faceDown?: boolean;
}

export function HandZone({
  playerId,
  state,
  catalog,
  faceDown = false,
}: HandZoneProps) {
  const interaction = useInteraction();
  const uplinkIds = state.players[playerId].uplink;

  return (
    <div className="relative flex min-h-[calc(var(--card-height)+2rem)] items-end justify-center overflow-x-auto px-4 pb-2 pt-4">
      <div className="relative flex items-end justify-center">
        {faceDown
          ? uplinkIds.map((instanceId, index) => (
              <div
                key={instanceId}
                className="relative"
                style={{
                  marginLeft: index === 0 ? 0 : "-2.2rem",
                  zIndex: index,
                }}
              >
                <GameCard
                  card={{
                    instanceId,
                    defId: "",
                    name: "Hidden",
                    kind: "schematic",
                    description: "",
                    rulesText: "",
                    faction: "neutral",
                    keywords: [],
                    fluxCost: 0,
                    impact: 0,
                    stability: 0,
                    damageMarked: 0,
                    exhausted: false,
                    statuses: [],
                    zone: "uplink",
                    controllerId: playerId,
                    ownerId: playerId,
                  }}
                  faceDown
                  interactive={false}
                />
              </div>
            ))
          : uplinkIds.map((instanceId, index) => {
              const card = resolveCardDisplay(catalog, state.instances, instanceId);
              if (!card) {
                return null;
              }
              const total = uplinkIds.length;
              const center = (total - 1) / 2;
              const offset = index - center;
              const rotation = offset * 4;
              const playable = interaction.isHandCardPlayable(instanceId);
              const disabledReason = interaction.handCardDisabledReason(instanceId);

              return (
                <div
                  key={instanceId}
                  className="relative"
                  style={{
                    marginLeft: index === 0 ? 0 : "-2rem",
                    zIndex: index,
                    transform: `rotate(${rotation}deg) translateY(${Math.abs(offset) * 2}px)`,
                  }}
                  title={disabledReason ?? undefined}
                  aria-label={
                    disabledReason
                      ? `${card.name}: ${disabledReason}`
                      : card.name
                  }
                >
                  <GameCard
                    card={card}
                    orientation="hand"
                    selected={interaction.selectedHandCardId === instanceId}
                    interactive
                    draggable={playable && interaction.canControl}
                    disabled={!playable}
                    onSelect={() => {
                      interaction.selectHandCard(instanceId);
                    }}
                    onInspect={() => interaction.openInspect(instanceId)}
                  />
                </div>
              );
            })}
      </div>
      {faceDown ? (
        <div className="absolute right-4 top-2 rounded-full bg-black/50 px-3 py-1 text-xs font-mono text-white/70">
          Uplink ×{uplinkIds.length}
        </div>
      ) : null}
    </div>
  );
}
