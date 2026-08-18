import type { CardCatalog } from "@/engine/catalog/schema";
import { requireCardDefinition } from "@/engine/catalog/resolve";
import {
  applyAction,
  getLegalActions,
  type GameAction,
  type GameEvent,
  type GameState,
  type PlayerId,
} from "@/engine";
import type { InstanceId } from "@/engine/types/ids";

function actionPriority(action: GameAction): number {
  switch (action.type) {
    case "resolve_choice":
      return 0;
    case "play_card":
      return 1;
    case "activate_ability":
      return 2;
    case "attack":
      return 3;
    case "end_turn":
      return 4;
    case "pass":
      return 5;
    case "keep_hand":
      return 0;
    case "mulligan":
      return 1;
    default:
      return 9;
  }
}

function actionSortKey(action: GameAction): string {
  switch (action.type) {
    case "play_card":
      return action.instanceId;
    case "activate_ability":
      return `${action.instanceId}:${action.abilityId}`;
    case "attack":
      return `${action.attackerId}:${String(action.target)}`;
    case "resolve_choice":
      return action.choiceId;
    default:
      return action.type;
  }
}

function compareActions(a: GameAction, b: GameAction): number {
  const priorityDiff = actionPriority(a) - actionPriority(b);
  if (priorityDiff !== 0) {
    return priorityDiff;
  }
  return actionSortKey(a).localeCompare(actionSortKey(b));
}

function playCardFlux(state: GameState, catalog: CardCatalog, action: GameAction): number {
  if (action.type !== "play_card") {
    return Number.MAX_SAFE_INTEGER;
  }
  const instance = state.instances[action.instanceId];
  if (!instance) {
    return Number.MAX_SAFE_INTEGER;
  }
  return requireCardDefinition(catalog, instance.defId).fluxCost;
}

function isConstructPlay(
  state: GameState,
  catalog: CardCatalog,
  action: GameAction,
): boolean {
  if (action.type !== "play_card") {
    return false;
  }
  const instance = state.instances[action.instanceId];
  if (!instance) {
    return false;
  }
  return requireCardDefinition(catalog, instance.defId).kind === "construct";
}

function targetConstructStability(
  state: GameState,
  target: InstanceId | "nexus",
): number {
  if (typeof target !== "string" || target === "nexus") {
    return Number.MAX_SAFE_INTEGER;
  }
  const instance = state.instances[target];
  return instance?.stability ?? Number.MAX_SAFE_INTEGER;
}

export function chooseAction(
  state: GameState,
  playerId: PlayerId,
  catalog: CardCatalog,
): GameAction | null {
  const legal = getLegalActions(state, playerId, { catalog }).filter(
    (action) => action.type !== "concede" && action.type !== "pass",
  );

  if (legal.length === 0) {
    return null;
  }

  if (state.pendingChoice && state.pendingChoice.playerId === playerId) {
    const choice = legal.find((action) => action.type === "resolve_choice");
    if (!choice || choice.type !== "resolve_choice") {
      return null;
    }
    const targets =
      state.pendingChoice.legalTargets === "nexus"
        ? []
        : state.pendingChoice.legalTargets;
    return {
      ...choice,
      selected: targets.slice(0, 1),
    };
  }

  const pregameActions = legal.filter(
    (action) => action.type === "keep_hand" || action.type === "mulligan",
  );
  if (pregameActions.length > 0) {
    return pregameActions.sort(compareActions)[0] ?? null;
  }

  const plays = legal.filter((action) => action.type === "play_card");
  const constructs = plays.filter((action) => isConstructPlay(state, catalog, action));
  if (constructs.length > 0) {
    return constructs.sort(
      (a, b) => playCardFlux(state, catalog, a) - playCardFlux(state, catalog, b),
    )[0];
  }
  if (plays.length > 0) {
    return plays.sort(
      (a, b) => playCardFlux(state, catalog, a) - playCardFlux(state, catalog, b),
    )[0];
  }

  const activations = legal.filter((action) => action.type === "activate_ability");
  if (activations.length > 0) {
    return activations.sort(compareActions)[0];
  }

  const attacks = legal.filter((action) => action.type === "attack");
  if (attacks.length > 0) {
    const nexusAttack = attacks.find(
      (action) => action.type === "attack" && action.target === "nexus",
    );
    if (nexusAttack) {
      return nexusAttack;
    }
    return attacks.sort((a, b) => {
      if (a.type !== "attack" || b.type !== "attack") {
        return 0;
      }
      return (
        targetConstructStability(state, a.target) -
        targetConstructStability(state, b.target)
      );
    })[0];
  }

  const endTurn = legal.find((action) => action.type === "end_turn");
  return endTurn ?? legal.sort(compareActions)[0] ?? null;
}

export function runAiTurn(
  state: GameState,
  playerId: PlayerId,
  catalog: CardCatalog,
  maxSteps = 32,
): { state: GameState; events: GameEvent[] } {
  let current = state;
  const events: GameEvent[] = [];
  let steps = 0;

  while (
    steps < maxSteps &&
    !current.winnerId &&
    current.activePlayerId === playerId &&
    (current.pregame !== "complete" ||
      current.phase === "operations" ||
      current.pendingChoice?.playerId === playerId)
  ) {
    const action = chooseAction(current, playerId, catalog);
    if (!action) {
      break;
    }

    const result = applyAction(current, action, { catalog });
    if (result.error) {
      break;
    }

    current = result.state;
    events.push(...result.events);
    steps += 1;

    if (action.type === "end_turn") {
      break;
    }

    if (
      current.pregame === "complete" &&
      current.activePlayerId !== playerId &&
      !current.pendingChoice
    ) {
      break;
    }
  }

  return { state: current, events };
}
