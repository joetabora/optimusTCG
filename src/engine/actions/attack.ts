import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { declareAttack } from "../rules/engagement";
import { opponentOf } from "../state/clone";
import { isConstructOnField } from "../state/zones";

export function attack(
  state: GameState,
  playerId: PlayerId,
  attackerId: InstanceId,
  target: InstanceId | "nexus",
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } | { error: string } {
  if (!isConstructOnField(state, attackerId, catalog)) {
    return { error: "Only ready Constructs on your Field can attack." };
  }

  const attacker = state.instances[attackerId];
  if (attacker.controllerId !== playerId) {
    return { error: "You do not control this Construct." };
  }

  if (target !== "nexus") {
    const targetInstance = state.instances[target];
    if (!targetInstance || targetInstance.zone !== "field") {
      return { error: "Invalid attack target." };
    }

    const targetDefinition = requireCardDefinition(catalog, targetInstance.defId);
    if (targetDefinition.kind !== "construct") {
      return { error: "Can only attack enemy Constructs or Nexus." };
    }

    if (targetInstance.controllerId === playerId) {
      return { error: "Cannot attack your own Construct." };
    }
  } else {
    const opponentId = opponentOf(playerId);
    if (state.players[opponentId].nexusIntegrity <= 0) {
      return { error: "Opponent Nexus is already collapsed." };
    }
  }

  return declareAttack(state, playerId, attackerId, target);
}
