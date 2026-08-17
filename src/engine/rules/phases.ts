import type { CardCatalog } from "../catalog/schema";
import type { GameEvent } from "../types/event";
import type { PhaseId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState, opponentOf } from "../state/clone";
import { drawCards } from "../state/rng-state";
import { resolveAbilities } from "../abilities/resolve";
import { requireCardDefinition } from "../catalog/resolve";
import { runIgnition } from "./flux";
import {
  applyDeckEmptyLoss,
  checkWinCondition,
  maybeEmitMatchEnded,
} from "./win";
import { resolveEngagements } from "./engagement";

const PHASE_ORDER: PhaseId[] = [
  "ignition",
  "draw",
  "operations",
  "resolution",
  "cooldown",
];

export function setPhase(
  state: GameState,
  phase: PhaseId,
): { state: GameState; events: GameEvent[] } {
  const nextState = cloneState(state);
  const from = nextState.phase;
  nextState.phase = phase;

  if (from === phase) {
    return { state: nextState, events: [] };
  }

  return {
    state: nextState,
    events: [
      {
        type: "phase_changed",
        from,
        to: phase,
        playerId: nextState.activePlayerId,
      },
    ],
  };
}

export function runDrawPhase(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  void catalog;
  let nextState = cloneState(state);
  const events: GameEvent[] = [];
  const playerId = nextState.activePlayerId;

  if (nextState.players[playerId].vault.length === 0) {
    const loss = applyDeckEmptyLoss(nextState, playerId);
    return { state: loss.state, events: loss.events };
  }

  const drawn = drawCards(nextState, playerId, 1);
  nextState = drawn.state;
  events.push(...drawn.events);

  if (drawn.drawn.length === 0) {
    const loss = applyDeckEmptyLoss(nextState, playerId);
    return { state: loss.state, events: [...events, ...loss.events] };
  }

  const phased = setPhase(nextState, "draw");
  return {
    state: phased.state,
    events: [...events, ...phased.events],
  };
}

export function resolveFieldCycleStartAbilities(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  let nextState = cloneState(state);
  let events: GameEvent[] = [];
  const playerId = nextState.activePlayerId;

  for (const instanceId of nextState.players[playerId].field) {
    const definition = requireCardDefinition(
      catalog,
      nextState.instances[instanceId].defId,
    );
    const resolved = resolveAbilities(nextState, "on_cycle_start", {
      catalog,
      sourcePlayerId: playerId,
      sourceInstanceId: instanceId,
    }, definition.abilities);
    nextState = resolved.state;
    events = [...events, ...resolved.events];
    if (nextState.pendingChoice) {
      break;
    }
  }

  return { state: nextState, events };
}

export function beginActiveTurn(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  let nextState = cloneState(state);
  const events: GameEvent[] = [];

  const ignition = runIgnition(nextState);
  nextState = ignition.state;
  events.push(...ignition.events);

  const cycleStart = resolveFieldCycleStartAbilities(nextState, catalog);
  nextState = cycleStart.state;
  events.push(...cycleStart.events);

  const ignitionPhase = setPhase(nextState, "ignition");
  nextState = ignitionPhase.state;
  events.push(...ignitionPhase.events);

  const drawPhase = runDrawPhase(nextState, catalog);
  nextState = drawPhase.state;
  events.push(...drawPhase.events);

  if (nextState.winnerId) {
    return { state: nextState, events };
  }

  const operations = setPhase(nextState, "operations");
  nextState = operations.state;
  events.push(...operations.events);
  nextState.hasPassedOperations = false;

  return { state: nextState, events };
}

export function runCooldown(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  let nextState = cloneState(state);
  const events: GameEvent[] = [];

  const previousPlayer = nextState.activePlayerId;
  const nextPlayer = opponentOf(previousPlayer);
  nextState.activePlayerId = nextPlayer;

  if (previousPlayer === "b") {
    nextState.cycle += 1;
  }

  nextState.engagements = [];
  nextState.hasPassedOperations = false;

  const cooldownPhase = setPhase(nextState, "cooldown");
  nextState = cooldownPhase.state;
  events.push(...cooldownPhase.events);

  if (nextState.winnerId) {
    return { state: nextState, events };
  }

  const nextTurn = beginActiveTurn(nextState, catalog);
  return {
    state: nextTurn.state,
    events: [...events, ...nextTurn.events],
  };
}

export function runResolutionPhase(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  let nextState = cloneState(state);
  const events: GameEvent[] = [];

  const resolutionPhase = setPhase(nextState, "resolution");
  nextState = resolutionPhase.state;
  events.push(...resolutionPhase.events);

  const resolved = resolveEngagements(nextState, catalog);
  nextState = resolved.state;
  events.push(...resolved.events);

  nextState = checkWinCondition(nextState);
  events.push(...maybeEmitMatchEnded(nextState));

  if (nextState.winnerId) {
    return { state: nextState, events };
  }

  const cooldown = runCooldown(nextState, catalog);
  return {
    state: cooldown.state,
    events: [...events, ...cooldown.events],
  };
}

export function advanceFromOperations(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  return runResolutionPhase(state, catalog);
}

export function nextPhase(state: GameState): PhaseId | null {
  const index = PHASE_ORDER.indexOf(state.phase);
  if (index < 0 || index >= PHASE_ORDER.length - 1) {
    return null;
  }
  return PHASE_ORDER[index + 1];
}
