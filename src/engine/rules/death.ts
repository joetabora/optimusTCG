import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import type { GameEvent } from "../types/event";
import type { InstanceId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState } from "../state/clone";
import { moveInstance } from "../state/zones";

export function isConstructDestroyed(
  state: GameState,
  instanceId: InstanceId,
  catalog: CardCatalog,
): boolean {
  const instance = state.instances[instanceId];
  if (!instance || instance.zone !== "field") {
    return false;
  }

  const definition = requireCardDefinition(catalog, instance.defId);
  if (definition.kind !== "construct") {
    return false;
  }

  return instance.damageMarked >= instance.stability;
}

export function destroyConstruct(
  state: GameState,
  instanceId: InstanceId,
): { state: GameState; events: GameEvent[] } {
  let nextState = cloneState(state);
  const instance = nextState.instances[instanceId];
  const playerId = instance.ownerId;

  const moved = moveInstance(nextState, instanceId, "scrap", playerId);
  nextState = moved.state;

  nextState.engagements = nextState.engagements.filter(
    (engagement) =>
      engagement.attackerId !== instanceId && engagement.target !== instanceId,
  );

  return {
    state: nextState,
    events: [
      ...moved.events,
      { type: "construct_destroyed", instanceId, playerId },
    ],
  };
}

export function checkAndDestroyDamagedConstructs(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  let nextState = cloneState(state);
  const events: GameEvent[] = [];
  const toCheck = Object.keys(nextState.instances);

  for (const instanceId of toCheck) {
    if (isConstructDestroyed(nextState, instanceId, catalog)) {
      const destroyed = destroyConstruct(nextState, instanceId);
      nextState = destroyed.state;
      events.push(...destroyed.events);
    }
  }

  return { state: nextState, events };
}
