import type { CardInstance } from "../types/card";
import type { PlayerId } from "../types/ids";
import type { GameState, PlayerState } from "../types/state";

export function clonePlayerState(player: PlayerState): PlayerState {
  return {
    ...player,
    vault: [...player.vault],
    uplink: [...player.uplink],
    field: [...player.field],
    scrap: [...player.scrap],
    nullZone: [...player.nullZone],
  };
}

export function cloneInstance(instance: CardInstance): CardInstance {
  return {
    ...instance,
    counters: { ...instance.counters },
    attachments: [...instance.attachments],
  };
}

export function clonePlayers(
  players: Record<PlayerId, PlayerState>,
): Record<PlayerId, PlayerState> {
  return {
    a: clonePlayerState(players.a),
    b: clonePlayerState(players.b),
  };
}

export function cloneInstances(
  instances: Record<string, CardInstance>,
): Record<string, CardInstance> {
  const next: Record<string, CardInstance> = {};
  for (const [id, instance] of Object.entries(instances)) {
    next[id] = cloneInstance(instance);
  }
  return next;
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: clonePlayers(state.players),
    instances: cloneInstances(state.instances),
    engagements: [...state.engagements],
    pendingChoice: state.pendingChoice
      ? {
          ...state.pendingChoice,
          legalTargets:
            state.pendingChoice.legalTargets === "nexus"
              ? "nexus"
              : [...state.pendingChoice.legalTargets],
        }
      : null,
  };
}

export function withState(
  state: GameState,
  patch: Partial<GameState>,
): GameState {
  return {
    ...cloneState(state),
    ...patch,
  };
}

export function incrementCommandIndex(state: GameState): GameState {
  return withState(state, { commandIndex: state.commandIndex + 1 });
}

export function opponentOf(playerId: PlayerId): PlayerId {
  return playerId === "a" ? "b" : "a";
}
