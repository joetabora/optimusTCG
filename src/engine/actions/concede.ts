import type { GameEvent } from "../types/event";
import type { PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { applyConcede } from "../rules/win";

export function concede(
  state: GameState,
  playerId: PlayerId,
): { state: GameState; events: GameEvent[] } | { error: string } {
  if (state.winnerId) {
    return { error: "Match is already over." };
  }

  return applyConcede(state, playerId);
}
