import type { ApplyResult } from "../types/event";
import type { Command } from "../types/command";
import type { GameState } from "../types/state";

/** Command application — implemented in Phase 3. */
export function applyCommand(state: GameState, command: Command): ApplyResult {
  return {
    state,
    events: [],
    error: `Command "${command.type}" is not implemented yet.`,
  };
}
