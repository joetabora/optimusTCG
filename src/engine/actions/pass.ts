import type { CardCatalog } from "../catalog/schema";
import type { GameEvent } from "../types/event";
import type { PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { advanceFromOperations } from "../rules/phases";

export function passOrEndTurn(
  state: GameState,
  playerId: PlayerId,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } | { error: string } {
  if (state.phase !== "operations") {
    return { error: "Can only pass during Operations phase." };
  }

  if (playerId !== state.activePlayerId) {
    return { error: "Not your turn." };
  }

  return advanceFromOperations(state, catalog);
}
