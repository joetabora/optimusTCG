import type { CardCatalog } from "../catalog/schema";
import { resolveCatalog, requireCardDefinition } from "../catalog/resolve";
import { MAX_FIELD_CONSTRUCTS } from "../catalog/schema";
import type { GameAction } from "../types/action";
import type { PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { isConstructOnField } from "../state/zones";
import { opponentOf } from "../state/clone";

export interface ActionContext {
  catalog?: CardCatalog;
}

function getCatalog(context?: ActionContext): CardCatalog {
  return resolveCatalog(context?.catalog);
}

export function validateAction(
  state: GameState,
  action: GameAction,
  context?: ActionContext,
): string | null {
  if (state.winnerId && action.type !== "concede") {
    return "Match is over.";
  }

  if (state.pendingChoice && action.type !== "resolve_choice" && action.type !== "concede") {
    return "Waiting for choice resolution.";
  }

  const catalog = getCatalog(context);

  switch (action.type) {
    case "play_card": {
      if (state.phase !== "operations") {
        return "Can only play cards during Operations.";
      }
      if (action.playerId !== state.activePlayerId) {
        return "Not your turn.";
      }

      const instance = state.instances[action.instanceId];
      if (!instance) {
        return "Unknown card instance.";
      }
      if (!state.players[action.playerId].uplink.includes(action.instanceId)) {
        return "Card must be in Uplink.";
      }

      const definition = requireCardDefinition(catalog, instance.defId);
      const player = state.players[action.playerId];
      if (player.flux < definition.fluxCost) {
        return "Insufficient Flux.";
      }

      if (definition.kind !== "schematic" && player.field.length >= MAX_FIELD_CONSTRUCTS) {
        return "Field is full.";
      }

      return null;
    }

    case "attack": {
      if (state.phase !== "operations") {
        return "Can only attack during Operations.";
      }
      if (action.playerId !== state.activePlayerId) {
        return "Not your turn.";
      }

      const attacker = state.instances[action.attackerId];
      if (!attacker) {
        return "Unknown attacker.";
      }
      if (!isConstructOnField(state, action.attackerId, catalog)) {
        return "Attacker must be a Construct on the Field.";
      }
      if (attacker.exhausted) {
        return "Attacker is exhausted.";
      }
      if (attacker.controllerId !== action.playerId) {
        return "You do not control this Construct.";
      }
      if (
        state.engagements.some(
          (engagement) => engagement.attackerId === action.attackerId,
        )
      ) {
        return "Construct is already assigned to attack.";
      }

      if (action.target !== "nexus") {
        const target = state.instances[action.target];
        if (!target || target.zone !== "field") {
          return "Invalid attack target.";
        }
        const targetDefinition = requireCardDefinition(catalog, target.defId);
        if (targetDefinition.kind !== "construct") {
          return "Can only attack Constructs or Nexus.";
        }
        if (target.controllerId === action.playerId) {
          return "Cannot attack your own Construct.";
        }
      }

      return null;
    }

    case "activate_ability": {
      if (state.phase !== "operations") {
        return "Can only activate abilities during Operations.";
      }
      if (action.playerId !== state.activePlayerId) {
        return "Not your turn.";
      }

      const instance = state.instances[action.instanceId];
      if (!instance || instance.zone !== "field") {
        return "Ability source must be on the Field.";
      }

      const definition = requireCardDefinition(catalog, instance.defId);
      const ability = definition.abilities.find(
        (entry) => entry.id === action.abilityId,
      );
      if (!ability || ability.trigger !== "activated") {
        return "Unknown activated ability.";
      }

      if (
        ability.oncePerCycle &&
        instance.abilitiesUsedThisCycle.includes(ability.id)
      ) {
        return "Ability already used this cycle.";
      }

      if (ability.fluxCost && state.players[action.playerId].flux < ability.fluxCost) {
        return "Insufficient Flux for ability.";
      }

      return null;
    }

    case "pass":
    case "end_turn": {
      if (state.phase !== "operations") {
        return "Can only pass during Operations.";
      }
      if (action.playerId !== state.activePlayerId) {
        return "Not your turn.";
      }
      return null;
    }

    case "resolve_choice": {
      if (!state.pendingChoice) {
        return "No pending choice.";
      }
      if (action.playerId !== state.pendingChoice.playerId) {
        return "Not your choice to resolve.";
      }
      if (action.choiceId !== state.pendingChoice.id) {
        return "Unknown choice id.";
      }
      return null;
    }

    case "concede":
      if (state.winnerId) {
        return "Match is already over.";
      }
      return null;

    default:
      return "Unknown action.";
  }
}

export function getLegalActions(
  state: GameState,
  playerId: PlayerId,
  context?: ActionContext,
): GameAction[] {
  if (state.winnerId) {
    return [];
  }

  const actions: GameAction[] = [];

  if (state.pendingChoice && state.pendingChoice.playerId === playerId) {
    actions.push({
      type: "resolve_choice",
      playerId,
      choiceId: state.pendingChoice.id,
      selected: [],
    });
    return actions;
  }

  const catalog = getCatalog(context);

  if (state.phase === "operations" && state.activePlayerId === playerId) {
    for (const instanceId of state.players[playerId].uplink) {
      const playAction: GameAction = {
        type: "play_card",
        playerId,
        instanceId,
      };
      if (!validateAction(state, playAction, context)) {
        actions.push(playAction);
      }
    }

    for (const instanceId of state.players[playerId].field) {
      const definition = requireCardDefinition(
        catalog,
        state.instances[instanceId].defId,
      );
      for (const ability of definition.abilities) {
        if (ability.trigger !== "activated") {
          continue;
        }
        const activateAction: GameAction = {
          type: "activate_ability",
          playerId,
          instanceId,
          abilityId: ability.id,
        };
        if (!validateAction(state, activateAction, context)) {
          actions.push(activateAction);
        }
      }

      const nexusAction: GameAction = {
        type: "attack",
        playerId,
        attackerId: instanceId,
        target: "nexus",
      };
      if (!validateAction(state, nexusAction, context)) {
        actions.push(nexusAction);
      }

      const opponentId = opponentOf(playerId);
      for (const targetId of state.players[opponentId].field) {
        const constructAction: GameAction = {
          type: "attack",
          playerId,
          attackerId: instanceId,
          target: targetId,
        };
        if (!validateAction(state, constructAction, context)) {
          actions.push(constructAction);
        }
      }
    }

    actions.push({ type: "pass", playerId });
    actions.push({ type: "end_turn", playerId });
  }

  actions.push({ type: "concede", playerId });
  return actions;
}
