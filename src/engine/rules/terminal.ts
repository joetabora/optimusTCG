import type { GameState } from "../types/state";

export function isTerminal(state: GameState): boolean {
  return state.winnerId !== null;
}
