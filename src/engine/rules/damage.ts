import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState, opponentOf } from "../state/clone";

export function dealImpactToConstruct(
  state: GameState,
  targetId: InstanceId,
  amount: number,
  sourceId: InstanceId,
): { state: GameState; events: GameEvent[] } {
  const nextState = cloneState(state);
  const target = nextState.instances[targetId];
  target.damageMarked += amount;

  const ownerId = target.ownerId;
  return {
    state: nextState,
    events: [
      {
        type: "damage_dealt",
        target: targetId,
        targetPlayerId: ownerId,
        amount,
        sourceId,
      },
    ],
  };
}

export function dealImpactToNexus(
  state: GameState,
  targetPlayerId: PlayerId,
  amount: number,
  sourceId: InstanceId,
): { state: GameState; events: GameEvent[] } {
  const nextState = cloneState(state);
  const player = nextState.players[targetPlayerId];
  player.nexusIntegrity -= amount;

  return {
    state: nextState,
    events: [
      {
        type: "damage_dealt",
        target: "nexus",
        targetPlayerId,
        amount,
        sourceId,
      },
      {
        type: "integrity_changed",
        playerId: targetPlayerId,
        nexusIntegrity: player.nexusIntegrity,
      },
    ],
  };
}

export function getAttackerImpact(
  state: GameState,
  attackerId: InstanceId,
  catalog: CardCatalog,
): number {
  const instance = state.instances[attackerId];
  const definition = requireCardDefinition(catalog, instance.defId);
  if (definition.kind !== "construct") {
    return 0;
  }
  return instance.impact;
}

export function getOpponentId(playerId: PlayerId): PlayerId {
  return opponentOf(playerId);
}
