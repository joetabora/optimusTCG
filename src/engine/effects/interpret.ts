import { requireCardDefinition } from "../catalog/resolve";
import { evaluateCondition } from "./conditions";
import type { EffectContext } from "./context";
import {
  getLegalTargetsForSelector,
  getNexusTargetPlayer,
  requiresPlayerChoice,
  resolveTargetInstances,
  targetsNexus,
} from "./targets";
import { drawCards } from "../state/rng-state";
import { cloneState, opponentOf, withState } from "../state/clone";
import { moveInstance } from "../state/zones";
import { spawnInstance } from "../state/instances";
import { dealImpactToConstruct, dealImpactToNexus } from "../rules/damage";
import { checkAndDestroyDamagedConstructs } from "../rules/death";
import { checkWinCondition, maybeEmitMatchEnded } from "../rules/win";
import type { EffectDefinition, TargetSelector } from "../types/effect";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState, PendingChoice } from "../types/state";
import { createCardInstance } from "../types/card";

export interface InterpretResult {
  state: GameState;
  events: GameEvent[];
  pendingChoice?: PendingChoice;
}

function mergeResults(
  state: GameState,
  events: GameEvent[],
  pendingChoice?: PendingChoice,
): InterpretResult {
  return { state, events, pendingChoice };
}

function applyFluxGain(
  state: GameState,
  playerId: PlayerId,
  amount: number,
): { state: GameState; events: GameEvent[] } {
  const nextState = cloneState(state);
  const player = nextState.players[playerId];
  player.flux = Math.min(player.flux + amount, player.fluxMax);
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

function applyIntegrityChange(
  state: GameState,
  playerId: PlayerId,
  amount: number,
): { state: GameState; events: GameEvent[] } {
  const nextState = cloneState(state);
  const player = nextState.players[playerId];
  player.nexusIntegrity += amount;
  return {
    state: nextState,
    events: [
      {
        type: "integrity_changed",
        playerId,
        nexusIntegrity: player.nexusIntegrity,
      },
    ],
  };
}

function maybeRequestChoice(
  state: GameState,
  selector: TargetSelector,
  context: EffectContext,
  continuationEffects: EffectDefinition[],
  cursor: number,
): InterpretResult | null {
  if (!requiresPlayerChoice(selector)) {
    return null;
  }

  const legalTargets = getLegalTargetsForSelector(state, selector, context);
  if (legalTargets.length === 0) {
    return null;
  }

  if (context.chosenTargets.length > 0) {
    return null;
  }

  const choiceId = `${state.commandIndex}-choice-${cursor}`;
  const pendingChoice: PendingChoice = {
    id: choiceId,
    playerId: context.sourcePlayerId,
    prompt: "choose_target",
    legalTargets,
    continuation: {
      effects: continuationEffects,
      cursor,
      context,
    },
  };

  return mergeResults(withState(state, { pendingChoice }), [], pendingChoice);
}

export function interpretEffect(
  state: GameState,
  effect: EffectDefinition,
  context: EffectContext,
  allEffects: EffectDefinition[] = [effect],
  cursor = 0,
): InterpretResult {
  switch (effect.type) {
    case "sequence":
      return interpretEffects(state, effect.effects, context);
    case "conditional": {
      const pass = evaluateCondition(state, effect.condition, context);
      const branch = pass ? effect.ifTrue : (effect.ifFalse ?? []);
      return interpretEffects(state, branch, context);
    }
    case "draw": {
      const playerId =
        effect.target === "self" ? context.sourcePlayerId : opponentOf(context.sourcePlayerId);
      const drawn = drawCards(state, playerId, effect.count);
      return mergeResults(drawn.state, drawn.events);
    }
    case "gain_flux": {
      const playerId =
        effect.target === "self" ? context.sourcePlayerId : opponentOf(context.sourcePlayerId);
      const gained = applyFluxGain(state, playerId, effect.amount);
      return mergeResults(gained.state, gained.events);
    }
    case "modify_integrity":
    case "heal_integrity": {
      const playerId =
        effect.target === "self" ? context.sourcePlayerId : opponentOf(context.sourcePlayerId);
      const changed = applyIntegrityChange(state, playerId, effect.amount);
      const nextState = checkWinCondition(changed.state);
      const events = [...changed.events, ...maybeEmitMatchEnded(nextState)];
      return mergeResults(nextState, events);
    }
    case "deal_impact": {
      if (targetsNexus(effect.target)) {
        const targetPlayer = getNexusTargetPlayer(effect.target, context.sourcePlayerId);
        if (!targetPlayer) {
          return mergeResults(state, []);
        }
        const sourceId = context.sourceInstanceId ?? context.sourcePlayerId;
        const hit = dealImpactToNexus(state, targetPlayer, effect.amount, sourceId);
        const nextState = checkWinCondition(hit.state);
        return mergeResults(nextState, [
          ...hit.events,
          ...maybeEmitMatchEnded(nextState),
        ]);
      }

      const choice = maybeRequestChoice(state, effect.target, context, allEffects, cursor);
      if (choice) {
        return choice;
      }

      const targets = resolveTargetInstances(state, effect.target, context);
      let nextState = state;
      const events: GameEvent[] = [];
      const sourceId = context.sourceInstanceId ?? context.sourcePlayerId;

      for (const targetId of targets) {
        const hit = dealImpactToConstruct(nextState, targetId, effect.amount, sourceId);
        nextState = hit.state;
        events.push(...hit.events);
      }

      const destroyed = checkAndDestroyDamagedConstructs(nextState, context.catalog);
      nextState = checkWinCondition(destroyed.state);
      return mergeResults(nextState, [
        ...events,
        ...destroyed.events,
        ...maybeEmitMatchEnded(nextState),
      ]);
    }
    case "destroy": {
      const choice = maybeRequestChoice(state, effect.target, context, allEffects, cursor);
      if (choice) {
        return choice;
      }

      const targets = resolveTargetInstances(state, effect.target, context);
      let nextState = state;
      const events: GameEvent[] = [];

      for (const targetId of targets) {
        const moved = moveInstance(nextState, targetId, "scrap");
        nextState = moved.state;
        events.push(...moved.events, {
          type: "construct_destroyed",
          instanceId: targetId,
          playerId: nextState.instances[targetId].ownerId,
        });
      }

      return mergeResults(nextState, events);
    }
    case "modify_stat": {
      const targets = resolveTargetInstances(state, effect.target, context);
      const nextState = cloneState(state);
      const events: GameEvent[] = [];

      for (const targetId of targets) {
        const instance = nextState.instances[targetId];
        if (effect.stat === "impact") {
          instance.impact += effect.amount;
        } else {
          instance.stability += effect.amount;
        }
        events.push({
          type: "stat_modified",
          instanceId: targetId,
          stat: effect.stat,
          amount: effect.amount,
        });
      }

      return mergeResults(nextState, events);
    }
    case "apply_status": {
      const targets = resolveTargetInstances(state, effect.target, context);
      const nextState = cloneState(state);
      const events: GameEvent[] = [];

      for (const targetId of targets) {
        const instance = nextState.instances[targetId];
        if (!instance.statuses.includes(effect.status)) {
          instance.statuses.push(effect.status);
          events.push({
            type: "status_applied",
            instanceId: targetId,
            status: effect.status,
            playerId: instance.ownerId,
          });
        }
      }

      return mergeResults(nextState, events);
    }
    case "remove_status": {
      const targets = resolveTargetInstances(state, effect.target, context);
      const nextState = cloneState(state);
      const events: GameEvent[] = [];

      for (const targetId of targets) {
        const instance = nextState.instances[targetId];
        instance.statuses = instance.statuses.filter((s) => s !== effect.status);
        events.push({
          type: "status_removed",
          instanceId: targetId,
          status: effect.status,
          playerId: instance.ownerId,
        });
      }

      return mergeResults(nextState, events);
    }
    case "move_zone": {
      const choice = maybeRequestChoice(state, effect.target, context, allEffects, cursor);
      if (choice) {
        return choice;
      }

      const targets = resolveTargetInstances(state, effect.target, context);
      let nextState = state;
      const events: GameEvent[] = [];

      for (const targetId of targets) {
        const instance = nextState.instances[targetId];
        const destinationPlayer =
          effect.destination === "owner"
            ? instance.ownerId
            : effect.destination === "self"
              ? context.sourcePlayerId
              : opponentOf(context.sourcePlayerId);
        const moved = moveInstance(
          nextState,
          targetId,
          effect.toZone,
          destinationPlayer,
        );
        nextState = moved.state;
        events.push(...moved.events);
      }

      return mergeResults(nextState, events);
    }
    case "summon": {
      const controller =
        effect.controller === "self"
          ? context.sourcePlayerId
          : opponentOf(context.sourcePlayerId);
      const spawned = spawnInstance(
        state,
        context.catalog,
        effect.cardDefId,
        controller,
        effect.zone,
      );
      if ("error" in spawned) {
        return mergeResults(state, []);
      }
      return mergeResults(spawned.state, spawned.events);
    }
    case "create_tokens": {
      let nextState = state;
      const events: GameEvent[] = [];
      const controller =
        effect.controller === "self"
          ? context.sourcePlayerId
          : opponentOf(context.sourcePlayerId);

      for (let i = 0; i < effect.count; i += 1) {
        const spawned = spawnInstance(
          nextState,
          context.catalog,
          effect.cardDefId,
          controller,
          effect.zone,
        );
        if ("error" in spawned) {
          break;
        }
        nextState = spawned.state;
        events.push(...spawned.events);
      }

      return mergeResults(nextState, events);
    }
    case "transform": {
      const choice = maybeRequestChoice(state, effect.target, context, allEffects, cursor);
      if (choice) {
        return choice;
      }

      const targets = resolveTargetInstances(state, effect.target, context);
      const nextState = cloneState(state);
      const events: GameEvent[] = [];
      const definition = requireCardDefinition(context.catalog, effect.intoDefId);

      for (const targetId of targets) {
        const instance = nextState.instances[targetId];
        const fromDefId = instance.defId;
        Object.assign(
          instance,
          createCardInstance(targetId, definition, instance.ownerId, instance.zone),
        );
        instance.instanceId = targetId;
        instance.defId = definition.id;
        events.push({
          type: "card_transformed",
          instanceId: targetId,
          fromDefId,
          toDefId: definition.id,
          playerId: instance.ownerId,
        });
      }

      return mergeResults(nextState, events);
    }
    default:
      return mergeResults(state, []);
  }
}

export function interpretEffects(
  state: GameState,
  effects: EffectDefinition[],
  context: EffectContext,
): InterpretResult {
  let nextState = state;
  let events: GameEvent[] = [];

  for (let index = 0; index < effects.length; index += 1) {
    const effect = effects[index];
    const result = interpretEffect(nextState, effect, context, effects, index);
    nextState = result.state;
    events = [...events, ...result.events];
    if (result.pendingChoice) {
      return result;
    }
  }

  return mergeResults(nextState, events);
}

export function resumeEffectContinuation(
  state: GameState,
  selectedTargets: InstanceId[],
): InterpretResult {
  const pending = state.pendingChoice;
  if (!pending?.continuation) {
    return mergeResults(state, []);
  }

  const { effects, cursor, context } = pending.continuation;
  const effect = effects[cursor];
  const resumedContext = {
    ...context,
    chosenTargets: selectedTargets,
  };

  let nextState = withState(state, { pendingChoice: null });
  const result = interpretEffect(nextState, effect, resumedContext, effects, cursor);
  nextState = result.state;

  const remaining = effects.slice(cursor + 1);
  if (remaining.length === 0 || result.pendingChoice) {
    return result;
  }

  const tail = interpretEffects(nextState, remaining, resumedContext);
  return mergeResults(tail.state, [...result.events, ...tail.events], tail.pendingChoice);
}
