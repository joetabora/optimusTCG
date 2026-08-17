import { requireCardDefinition } from "../catalog/resolve";
import { MAX_FIELD_CONSTRUCTS } from "../catalog/schema";
import type { CardCatalog } from "../catalog/schema";
import { createCardInstance } from "../types/card";
import type { GameEvent } from "../types/event";
import type { CardDefId, InstanceId, PlayerId, ZoneId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState, withState } from "./clone";
import { moveInstance } from "./zones";

export function allocateInstanceId(state: GameState, ownerId: PlayerId): {
  state: GameState;
  instanceId: InstanceId;
} {
  const nextCounter = state.instanceCounter + 1;
  return {
    state: withState(state, { instanceCounter: nextCounter }),
    instanceId: `${state.matchId}-token-${ownerId}-${nextCounter}`,
  };
}

export function spawnInstance(
  state: GameState,
  catalog: CardCatalog,
  cardDefId: CardDefId,
  ownerId: PlayerId,
  zone: ZoneId,
): { state: GameState; instanceId: InstanceId; events: GameEvent[] } | { error: string } {
  const definition = requireCardDefinition(catalog, cardDefId);
  let nextState = cloneState(state);

  if (zone === "field" && nextState.players[ownerId].field.length >= MAX_FIELD_CONSTRUCTS) {
    return { error: "Field is full." };
  }

  const allocated = allocateInstanceId(nextState, ownerId);
  nextState = allocated.state;

  nextState.instances[allocated.instanceId] = createCardInstance(
    allocated.instanceId,
    definition,
    ownerId,
    zone,
  );

  if (definition.kind === "construct" && definition.keywords.includes("swift")) {
    nextState.instances[allocated.instanceId].exhausted = false;
  }

  const moved = moveInstance(nextState, allocated.instanceId, zone, ownerId);
  nextState = moved.state;

  return {
    state: nextState,
    instanceId: allocated.instanceId,
    events: [
      ...moved.events,
      {
        type: "token_created",
        instanceId: allocated.instanceId,
        defId: cardDefId,
        playerId: ownerId,
        zone,
      },
    ],
  };
}
