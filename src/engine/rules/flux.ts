import { MAX_FLUX } from "../catalog/schema";
import type { GameEvent } from "../types/event";
import type { PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState } from "../state/clone";

export function runIgnition(
  state: GameState,
): { state: GameState; events: GameEvent[] } {
  const nextState = cloneState(state);
  const player = nextState.players[nextState.activePlayerId];
  const events: GameEvent[] = [];

  player.fluxMax = Math.min(player.fluxMax + 1, MAX_FLUX);
  player.flux = player.fluxMax;
  events.push({
    type: "flux_changed",
    playerId: nextState.activePlayerId,
    flux: player.flux,
    fluxMax: player.fluxMax,
  });

  for (const instanceId of player.field) {
    const instance = nextState.instances[instanceId];
    instance.exhausted = false;
  }

  nextState.phase = "ignition";
  return { state: nextState, events };
}

export function spendFlux(
  state: GameState,
  playerId: PlayerId,
  cost: number,
): { state: GameState; events: GameEvent[] } | { error: string } {
  const nextState = cloneState(state);
  const player = nextState.players[playerId];

  if (player.flux < cost) {
    return { error: "Insufficient Flux." };
  }

  player.flux -= cost;
  return {
    state: nextState,
    events: [
      {
        type: "flux_changed",
        playerId,
        flux: player.flux,
        fluxMax: player.fluxMax,
      },
    ],
  };
}
