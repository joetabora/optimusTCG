import type { GameState } from "../types/state";
import type { PlayerId } from "../types/ids";

export function checkWinCondition(state: GameState): GameState {
  if (state.winnerId) {
    return state;
  }

  for (const playerId of ["a", "b"] as PlayerId[]) {
    if (state.players[playerId].nexusIntegrity <= 0) {
      const winnerId: PlayerId = playerId === "a" ? "b" : "a";
      return {
        ...state,
        winnerId,
        winReason: "nexus_collapsed",
      };
    }
  }

  return state;
}
