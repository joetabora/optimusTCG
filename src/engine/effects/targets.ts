import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import type { EffectContext } from "./context";
import type { TargetFilter, TargetSelector } from "../types/effect";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { opponentOf } from "../state/clone";

function matchesFilters(
  state: GameState,
  catalog: CardCatalog,
  instanceId: InstanceId,
  filters: TargetFilter[] | undefined,
): boolean {
  if (!filters || filters.length === 0) {
    return true;
  }

  const instance = state.instances[instanceId];
  const definition = requireCardDefinition(catalog, instance.defId);

  return filters.every((filter) => {
    switch (filter.type) {
      case "has_keyword":
        return definition.keywords.includes(filter.keyword as never);
      case "min_impact":
        return instance.impact >= filter.amount;
      default:
        return true;
    }
  });
}

function constructsForController(
  state: GameState,
  catalog: CardCatalog,
  controller: PlayerId,
): InstanceId[] {
  return state.players[controller].field.filter((instanceId) => {
    const definition = requireCardDefinition(
      catalog,
      state.instances[instanceId].defId,
    );
    return definition.kind === "construct";
  });
}

export function resolveTargetInstances(
  state: GameState,
  selector: TargetSelector,
  context: EffectContext,
): InstanceId[] {
  const { catalog, sourcePlayerId, sourceInstanceId, chosenTargets } = context;
  const opponentId = opponentOf(sourcePlayerId);

  switch (selector.kind) {
    case "this":
      return sourceInstanceId ? [sourceInstanceId] : [];
    case "self":
      return sourceInstanceId ? [sourceInstanceId] : [];
    case "opponent":
      return [];
    case "enemy_nexus":
      return [];
    case "friendly_construct":
      return constructsForController(state, catalog, sourcePlayerId).filter(
        (id) => matchesFilters(state, catalog, id, undefined),
      );
    case "enemy_construct":
      return constructsForController(state, catalog, opponentId);
    case "choose_construct": {
      if (chosenTargets.length > 0) {
        return chosenTargets.filter((id) => {
          const instance = state.instances[id];
          if (!instance || instance.zone !== "field") {
            return false;
          }
          const controller = instance.controllerId;
          if (selector.controller === "self" && controller !== sourcePlayerId) {
            return false;
          }
          if (
            selector.controller === "opponent" &&
            controller !== opponentId
          ) {
            return false;
          }
          return matchesFilters(state, catalog, id, selector.filters);
        });
      }

      const controllers: PlayerId[] =
        selector.controller === "any"
          ? [sourcePlayerId, opponentId]
          : selector.controller === "self"
            ? [sourcePlayerId]
            : [opponentId];

      return controllers.flatMap((controller) =>
        constructsForController(state, catalog, controller).filter((id) =>
          matchesFilters(state, catalog, id, selector.filters),
        ),
      );
    }
    case "all_constructs": {
      const controllers: PlayerId[] =
        selector.controller === "any"
          ? [sourcePlayerId, opponentId]
          : selector.controller === "self"
            ? [sourcePlayerId]
            : [opponentId];
      return controllers.flatMap((controller) =>
        constructsForController(state, catalog, controller),
      );
    }
    default:
      return [];
  }
}

export function requiresPlayerChoice(selector: TargetSelector): boolean {
  return selector.kind === "choose_construct";
}

export function targetsNexus(selector: TargetSelector): boolean {
  return selector.kind === "enemy_nexus" || selector.kind === "opponent";
}

export function getNexusTargetPlayer(
  selector: TargetSelector,
  sourcePlayerId: PlayerId,
): PlayerId | null {
  if (selector.kind === "enemy_nexus" || selector.kind === "opponent") {
    return opponentOf(sourcePlayerId);
  }
  return null;
}

export function getLegalTargetsForSelector(
  state: GameState,
  selector: TargetSelector,
  context: EffectContext,
): InstanceId[] {
  if (!requiresPlayerChoice(selector)) {
    return resolveTargetInstances(state, selector, context);
  }

  return resolveTargetInstances(state, selector, {
    ...context,
    chosenTargets: [],
  });
}
