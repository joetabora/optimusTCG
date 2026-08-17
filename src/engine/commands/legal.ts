import { getLegalActions, type ActionContext } from "../actions/apply";
import type { Command } from "../types/command";
import type { GameState } from "../types/state";
import type { PlayerId } from "../types/ids";
import type { GameAction } from "../types/action";

/** Backward-compatible legal command enumeration. */
export function getLegalCommands(
  state: GameState,
  playerId: PlayerId,
  context?: ActionContext,
): Command[] {
  return getLegalActions(state, playerId, context) as Command[];
}

export function getLegalActionsAsCommands(
  state: GameState,
  playerId: PlayerId,
  context?: ActionContext,
): GameAction[] {
  return getLegalActions(state, playerId, context);
}
