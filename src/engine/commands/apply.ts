import { applyLegacyCommand } from "../actions/apply";
import type { ApplyResult } from "../types/event";
import type { Command } from "../types/command";
import type { GameState } from "../types/state";
import type { ActionContext } from "../actions/apply";

/** Backward-compatible command entry point. */
export function applyCommand(
  state: GameState,
  command: Command,
  context?: ActionContext,
): ApplyResult {
  return applyLegacyCommand(state, command, context);
}
