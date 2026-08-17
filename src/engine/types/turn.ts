import type { GameState } from "./state";
import type { PhaseId, PlayerId } from "./ids";

export interface TurnState {
  cycle: number;
  phase: PhaseId;
  activePlayerId: PlayerId;
}

export function getTurnState(state: GameState): TurnState {
  return {
    cycle: state.cycle,
    phase: state.phase,
    activePlayerId: state.activePlayerId,
  };
}
