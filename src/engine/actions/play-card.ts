import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import { MAX_FIELD_CONSTRUCTS } from "../catalog/schema";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { spendFlux } from "../rules/flux";
import { countFieldCards, findInstanceZone, moveInstance } from "../state/zones";

export function playCard(
  state: GameState,
  playerId: PlayerId,
  instanceId: InstanceId,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } | { error: string } {
  const instance = state.instances[instanceId];
  if (!instance) {
    return { error: "Unknown card instance." };
  }

  const zone = findInstanceZone(state, playerId, instanceId);
  if (zone !== "uplink") {
    return { error: "Card must be in Uplink to play." };
  }

  const definition = requireCardDefinition(catalog, instance.defId);

  const spent = spendFlux(state, playerId, definition.fluxCost);
  if ("error" in spent) {
    return spent;
  }

  let nextState = spent.state;
  const events: GameEvent[] = [...spent.events];

  if (definition.kind === "schematic") {
    const moved = moveInstance(nextState, instanceId, "scrap", playerId);
    nextState = moved.state;
    events.push(...moved.events);
  } else {
    if (countFieldCards(nextState, playerId) >= MAX_FIELD_CONSTRUCTS) {
      return { error: "Field is full." };
    }

    const moved = moveInstance(nextState, instanceId, "field", playerId);
    nextState = moved.state;
    events.push(...moved.events);

    if (definition.kind === "construct") {
      nextState.instances[instanceId].exhausted = true;
    }
  }

  events.push({ type: "card_played", playerId, instanceId });
  return { state: nextState, events };
}
