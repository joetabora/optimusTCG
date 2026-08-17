import type { ConditionDefinition } from "../types/condition";
import type { EffectContext } from "./context";
import type { GameState } from "../types/state";
import { opponentOf } from "../state/clone";
import { requireCardDefinition } from "../catalog/resolve";

export function evaluateCondition(
  state: GameState,
  condition: ConditionDefinition,
  context: EffectContext,
): boolean {
  switch (condition.type) {
    case "active_phase_is":
      return state.phase === condition.phase;
    case "source_zone_is": {
      if (!context.sourceInstanceId) {
        return false;
      }
      return state.instances[context.sourceInstanceId]?.zone === condition.zone;
    }
    case "controller_has_constructs_at_least": {
      const count = state.players[context.sourcePlayerId].field.filter(
        (instanceId) => {
          const def = requireCardDefinition(
            context.catalog,
            state.instances[instanceId].defId,
          );
          return def.kind === "construct";
        },
      ).length;
      return count >= condition.count;
    }
    case "opponent_nexus_at_most": {
      const opponent = opponentOf(context.sourcePlayerId);
      return (
        state.players[opponent].nexusIntegrity <= condition.amount
      );
    }
    case "self_nexus_at_most":
      return (
        state.players[context.sourcePlayerId].nexusIntegrity <= condition.amount
      );
    case "targets_remaining_integrity_at_most": {
      if (context.chosenTargets.length === 0) {
        return false;
      }
      const target = state.instances[context.chosenTargets[0]];
      if (!target) {
        return false;
      }
      const remaining = target.stability - target.damageMarked;
      return remaining <= condition.amount;
    }
    default:
      return false;
  }
}
