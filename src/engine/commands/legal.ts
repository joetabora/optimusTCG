import type { Command } from "../types/command";
import type { GameState } from "../types/state";
import type { PlayerId } from "../types/ids";

/** Legal command enumeration — implemented in Phase 3. */
export function getLegalCommands(
  state: GameState,
  playerId: PlayerId,
): Command[] {
  void state;
  void playerId;
  return [];
}
