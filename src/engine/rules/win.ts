import type { GameEvent } from "../types/event";
import type { PlayerId, WinReason } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState, opponentOf } from "../state/clone";

export function checkWinCondition(state: GameState): GameState {
  if (state.winnerId) {
    return state;
  }

  for (const playerId of ["a", "b"] as PlayerId[]) {
    if (state.players[playerId].nexusIntegrity <= 0) {
      const winnerId = opponentOf(playerId);
      return finalizeMatch(state, winnerId, "nexus_collapsed");
    }
  }

  return state;
}

export function finalizeMatch(
  state: GameState,
  winnerId: PlayerId,
  winReason: WinReason,
): GameState {
  return {
    ...cloneState(state),
    winnerId,
    winReason,
    phase: "cooldown",
  };
}

export function applyConcede(
  state: GameState,
  playerId: PlayerId,
): { state: GameState; events: GameEvent[] } {
  const winnerId = opponentOf(playerId);
  const nextState = finalizeMatch(state, winnerId, "concede");
  return {
    state: nextState,
    events: [
      {
        type: "match_ended",
        winnerId,
        reason: "concede",
      },
    ],
  };
}

export function applyDeckEmptyLoss(
  state: GameState,
  playerId: PlayerId,
): { state: GameState; events: GameEvent[] } {
  const winnerId = opponentOf(playerId);
  const nextState = finalizeMatch(state, winnerId, "deck_empty");
  return {
    state: nextState,
    events: [
      {
        type: "match_ended",
        winnerId,
        reason: "deck_empty",
      },
    ],
  };
}

export function maybeEmitMatchEnded(state: GameState): GameEvent[] {
  if (!state.winnerId || !state.winReason) {
    return [];
  }

  return [
    {
      type: "match_ended",
      winnerId: state.winnerId,
      reason: state.winReason,
    },
  ];
}
