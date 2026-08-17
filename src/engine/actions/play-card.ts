import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import { MAX_FIELD_CONSTRUCTS } from "../catalog/schema";
import { resolveAbilities } from "../abilities/resolve";
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
  chosenTargets: InstanceId[] = [],
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

    const resolved = resolveAbilities(nextState, "on_play", {
      catalog,
      sourcePlayerId: playerId,
      sourceInstanceId: instanceId,
      chosenTargets,
    }, definition.abilities);
    nextState = resolved.state;
    events.push(...resolved.events);
  } else {
    if (countFieldCards(nextState, playerId) >= MAX_FIELD_CONSTRUCTS) {
      return { error: "Field is full." };
    }

    const moved = moveInstance(nextState, instanceId, "field", playerId);
    nextState = moved.state;
    events.push(...moved.events);

    if (definition.kind === "construct") {
      const cardInstance = nextState.instances[instanceId];
      cardInstance.exhausted = !definition.keywords.includes("swift");
    }

    const resolved = resolveAbilities(nextState, "on_enter_field", {
      catalog,
      sourcePlayerId: playerId,
      sourceInstanceId: instanceId,
      chosenTargets,
    }, definition.abilities);
    nextState = resolved.state;
    events.push(...resolved.events);
  }

  events.push({ type: "card_played", playerId, instanceId });
  return { state: nextState, events };
}
