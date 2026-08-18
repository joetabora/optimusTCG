import { applyAction, getCardCatalog } from "@/engine";
import type { GameState } from "@/engine/types/state";

export function completePregame(state: GameState, catalog = getCardCatalog()): GameState {
  let current = state;
  let result = applyAction(current, { type: "keep_hand", playerId: "a" }, { catalog });
  if (result.error) {
    throw new Error(result.error);
  }
  current = result.state;
  result = applyAction(current, { type: "keep_hand", playerId: "b" }, { catalog });
  if (result.error) {
    throw new Error(result.error);
  }
  return result.state;
}
