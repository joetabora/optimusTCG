import { resolveCatalog } from "../catalog/resolve";
import { normalizeAction, type GameAction, type LegacyCommand } from "../types/action";
import type { ApplyResult } from "../types/event";
import type { GameState } from "../types/state";
import { incrementCommandIndex } from "../state/clone";
import { attack } from "./attack";
import { concede } from "./concede";
import { passOrEndTurn } from "./pass";
import { playCard } from "./play-card";
import { getLegalActions, validateAction, type ActionContext } from "./validate";

export type { ActionContext };

function finalizeResult(
  state: GameState,
  events: ApplyResult["events"],
): ApplyResult {
  return {
    state: incrementCommandIndex(state),
    events,
  };
}

export function applyAction(
  state: GameState,
  action: GameAction,
  context?: ActionContext,
): ApplyResult {
  const validationError = validateAction(state, action, context);
  if (validationError) {
    return { state, events: [], error: validationError };
  }

  const catalog = resolveCatalog(context?.catalog);

  switch (action.type) {
    case "play_card": {
      const result = playCard(state, action.playerId, action.instanceId, catalog);
      if ("error" in result) {
        return { state, events: [], error: result.error };
      }
      return finalizeResult(result.state, result.events);
    }

    case "attack": {
      const result = attack(
        state,
        action.playerId,
        action.attackerId,
        action.target,
        catalog,
      );
      if ("error" in result) {
        return { state, events: [], error: result.error };
      }
      return finalizeResult(result.state, result.events);
    }

    case "pass":
    case "end_turn": {
      const result = passOrEndTurn(state, action.playerId, catalog);
      if ("error" in result) {
        return { state, events: [], error: result.error };
      }
      return finalizeResult(result.state, result.events);
    }

    case "concede": {
      const result = concede(state, action.playerId);
      if ("error" in result) {
        return { state, events: [], error: result.error };
      }
      return finalizeResult(result.state, result.events);
    }

    case "activate_ability":
    case "resolve_choice":
      return {
        state,
        events: [],
        error: `"${action.type}" is not implemented yet.`,
      };

    default:
      return { state, events: [], error: "Unknown action." };
  }
}

export function applyLegacyCommand(
  state: GameState,
  command: LegacyCommand,
  context?: ActionContext,
): ApplyResult {
  return applyAction(state, normalizeAction(command), context);
}

export { getLegalActions, validateAction };
