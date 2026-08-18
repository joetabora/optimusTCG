import type { GameAction } from "@/engine/types/action";
import type { GameState } from "@/engine/types/state";
import type { PlayerId } from "@/engine/types/ids";
import type { ApplyResult } from "@/engine/types/event";
import {
  applyAction,
  createDefaultMatch,
  getCardCatalog,
  getLegalActions,
} from "@/engine";

/** Thin browser adapter over the pure engine. */
export class LocalMatchSession {
  private state: GameState;
  private readonly catalog = getCardCatalog();

  constructor(seed?: number) {
    this.state = createDefaultMatch(seed);
  }

  getState(): GameState {
    return this.state;
  }

  dispatch(action: GameAction): ApplyResult {
    const result = applyAction(this.state, action, { catalog: this.catalog });
    if (!result.error) {
      this.state = result.state;
    }
    return result;
  }

  getLegalActionsFor(playerId: PlayerId) {
    return getLegalActions(this.state, playerId, { catalog: this.catalog });
  }

  rematch(seed?: number) {
    this.state = createDefaultMatch(seed);
  }
}
