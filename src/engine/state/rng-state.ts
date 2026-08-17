import { createRng } from "../rng";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState, withState } from "./clone";

export function nextRandom(state: GameState): { state: GameState; value: number } {
  const rng = createRng(state.seed + state.rngIndex);
  const value = rng();
  return {
    state: withState(state, { rngIndex: state.rngIndex + 1 }),
    value,
  };
}

export function shuffleZone(
  state: GameState,
  playerId: PlayerId,
  zone: "vault",
): { state: GameState; events: GameEvent[] } {
  let nextState = cloneState(state);
  const ids = [...nextState.players[playerId][zone]];

  for (let index = ids.length - 1; index > 0; index -= 1) {
    const roll = nextRandom(nextState);
    nextState = roll.state;
    const swapIndex = Math.floor(roll.value * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }

  nextState.players[playerId][zone] = ids;
  return { state: nextState, events: [] };
}

export function drawCards(
  state: GameState,
  playerId: PlayerId,
  count: number,
): { state: GameState; events: GameEvent[]; drawn: InstanceId[] } {
  const nextState = cloneState(state);
  const events: GameEvent[] = [];
  const drawn: InstanceId[] = [];
  const player = nextState.players[playerId];

  for (let i = 0; i < count; i += 1) {
    const instanceId = player.vault.shift();
    if (!instanceId) {
      break;
    }

    const instance = nextState.instances[instanceId];
    instance.zone = "uplink";
    player.uplink.push(instanceId);
    drawn.push(instanceId);
    events.push({ type: "card_drawn", playerId, instanceId });
  }

  return { state: nextState, events, drawn };
}
