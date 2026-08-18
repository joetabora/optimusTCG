import type { CardCatalog } from "../catalog/schema";
import { DEFAULT_STARTING_UPLINK_SIZE } from "../catalog/schema";
import { beginActiveTurn } from "../rules/phases";
import type { GameEvent } from "../types/event";
import type { PlayerId } from "../types/ids";
import type { GameState, PregameStage } from "../types/state";
import { cloneState } from "../state/clone";
import { drawCards, shuffleZone } from "../state/rng-state";
import { moveInstance } from "../state/zones";

export function getPregamePlayer(state: GameState): PlayerId | null {
  if (state.pregame === "mulligan_a") {
    return "a";
  }
  if (state.pregame === "mulligan_b") {
    return "b";
  }
  return null;
}

function nextPregameStage(stage: PregameStage): PregameStage {
  if (stage === "mulligan_a") {
    return "mulligan_b";
  }
  return "complete";
}

function advancePregameStage(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  const nextStage = nextPregameStage(state.pregame);
  let nextState = cloneState(state);
  const events: GameEvent[] = [
    {
      type: "pregame_advanced",
      from: state.pregame,
      to: nextStage,
    },
  ];

  nextState.pregame = nextStage;

  if (nextStage === "complete") {
    const turn = beginActiveTurn(nextState, catalog);
    nextState = turn.state;
    events.push(...turn.events);
  }

  return { state: nextState, events };
}

function returnUplinkToVault(state: GameState, playerId: PlayerId): GameState {
  let nextState = cloneState(state);
  const uplinkIds = [...nextState.players[playerId].uplink];

  for (const instanceId of uplinkIds) {
    const moved = moveInstance(nextState, instanceId, "vault", playerId);
    nextState = moved.state;
  }

  return nextState;
}

export function keepHand(
  state: GameState,
  playerId: PlayerId,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } | { error: string } {
  const pregamePlayer = getPregamePlayer(state);
  if (!pregamePlayer) {
    return { error: "Pregame is complete." };
  }
  if (pregamePlayer !== playerId) {
    return { error: "Not your mulligan step." };
  }

  return advancePregameStage(state, catalog);
}

export function mulliganHand(
  state: GameState,
  playerId: PlayerId,
  catalog: CardCatalog,
  startingUplinkSize: number = DEFAULT_STARTING_UPLINK_SIZE,
): { state: GameState; events: GameEvent[] } | { error: string } {
  const pregamePlayer = getPregamePlayer(state);
  if (!pregamePlayer) {
    return { error: "Pregame is complete." };
  }
  if (pregamePlayer !== playerId) {
    return { error: "Not your mulligan step." };
  }
  if (state.mulliganUsed[playerId]) {
    return { error: "Mulligan already used." };
  }

  let nextState = returnUplinkToVault(state, playerId);
  nextState.mulliganUsed[playerId] = true;

  const shuffled = shuffleZone(nextState, playerId, "vault");
  nextState = shuffled.state;

  const drawn = drawCards(nextState, playerId, startingUplinkSize);
  nextState = drawn.state;

  const events: GameEvent[] = [
    { type: "hand_mulliganed", playerId },
    ...drawn.events,
  ];

  const advanced = advancePregameStage(nextState, catalog);
  return {
    state: advanced.state,
    events: [...events, ...advanced.events],
  };
}
