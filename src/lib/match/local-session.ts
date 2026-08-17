import type { Command } from "@/engine/types/command";
import type { GameState } from "@/engine/types/state";
import type { PlayerId } from "@/engine/types/ids";
import { applyCommand, createDefaultMatch, getLegalCommands } from "@/engine";

/** Thin browser adapter over the pure engine — expanded in Phase 4. */
export class LocalMatchSession {
  private state: GameState;

  constructor(seed?: number) {
    this.state = createDefaultMatch(seed);
  }

  getState(): GameState {
    return this.state;
  }

  dispatch(command: Command) {
    const result = applyCommand(this.state, command);
    if (!result.error) {
      this.state = result.state;
    }
    return result;
  }

  getLegalCommandsFor(playerId: PlayerId) {
    return getLegalCommands(this.state, playerId);
  }
}
