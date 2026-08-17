import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import { resolveActivatedAbility } from "../abilities/resolve";
import type { GameEvent } from "../types/event";
import type { AbilityId, InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";

export function activateAbility(
  state: GameState,
  playerId: PlayerId,
  instanceId: InstanceId,
  abilityId: AbilityId,
  catalog: CardCatalog,
  chosenTargets: InstanceId[] = [],
): { state: GameState; events: GameEvent[] } | { error: string } {
  const instance = state.instances[instanceId];
  if (!instance || instance.zone !== "field") {
    return { error: "Ability source must be on the Field." };
  }

  if (instance.controllerId !== playerId) {
    return { error: "You do not control this card." };
  }

  const definition = requireCardDefinition(catalog, instance.defId);
  const ability = definition.abilities.find((entry) => entry.id === abilityId);
  if (!ability || ability.trigger !== "activated") {
    return { error: "Unknown activated ability." };
  }

  if (
    ability.oncePerCycle &&
    instance.abilitiesUsedThisCycle.includes(ability.id)
  ) {
    return { error: "Ability already used this cycle." };
  }

  return resolveActivatedAbility(
    state,
    {
      catalog,
      sourcePlayerId: playerId,
      sourceInstanceId: instanceId,
      chosenTargets,
    },
    ability,
  );
}
