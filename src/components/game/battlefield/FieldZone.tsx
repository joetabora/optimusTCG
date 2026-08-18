"use client";

import type { CardCatalog } from "@/engine/catalog/schema";
import type { PlayerId } from "@/engine/types/ids";
import type { GameState } from "@/engine/types/state";
import { resolveCardDisplay } from "@/lib/game/card-presenter";
import { GameCard } from "../card/GameCard";
import { useInteraction } from "../interaction/InteractionProvider";
import { cn } from "@/lib/utils";

interface FieldZoneProps {
  playerId: PlayerId;
  state: GameState;
  catalog: CardCatalog;
  opponentView?: boolean;
  isDeployZone?: boolean;
}

export function FieldZone({
  playerId,
  state,
  catalog,
  opponentView = false,
  isDeployZone = false,
}: FieldZoneProps) {
  const interaction = useInteraction();
  const fieldIds = state.players[playerId].field;
  const deployHighlight =
    isDeployZone &&
    interaction.mode === "playCard" &&
    interaction.isPendingConstructPlay();

  return (
    <div
      className={cn(
        "relative flex min-h-[calc(var(--card-height)+1.5rem)] flex-1 items-center justify-center gap-3 px-4 py-3",
        opponentView ? "flex-row-reverse" : "flex-row",
        deployHighlight && "ring-1 ring-inset ring-cyan-300/30",
      )}
      onPointerUp={() => {
        if (deployHighlight) {
          interaction.playPendingOnField();
        }
      }}
    >
      <div
        className={cn(
          "absolute inset-3 rounded-[1.4rem] border border-white/5 bg-black/15 backdrop-blur-[1px]",
          deployHighlight && "border-cyan-300/25 bg-cyan-500/5",
        )}
      />
      <div className="relative z-10 flex flex-wrap items-end justify-center gap-3">
        {fieldIds.map((instanceId) => {
          const card = resolveCardDisplay(catalog, state.instances, instanceId);
          if (!card) {
            return null;
          }

          const targetable =
            (interaction.mode === "declareAttack" &&
              interaction.isValidAttackTarget(instanceId)) ||
            (interaction.mode === "targeting" &&
              interaction.isPendingTargetLegal(instanceId));
          const selected =
            interaction.isAttackerSelected(instanceId) ||
            interaction.isPendingTarget(instanceId);

          return (
            <GameCard
              key={instanceId}
              card={card}
              orientation="field"
              selected={selected}
              targetable={targetable}
              interactive={interaction.canControl}
              onSelect={() => {
                if (interaction.mode === "declareAttack") {
                  interaction.selectAttackTarget(instanceId);
                  return;
                }
                if (interaction.mode === "targeting") {
                  if (interaction.isPendingTargetLegal(instanceId)) {
                    interaction.selectPendingTarget(instanceId);
                  }
                  return;
                }
                interaction.selectFieldCard(instanceId);
              }}
              onInspect={() => interaction.openInspect(instanceId)}
            />
          );
        })}
        {fieldIds.length === 0 ? (
          <p className="px-4 text-sm text-white/30">
            {deployHighlight ? "Release to deploy" : "Field empty"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
