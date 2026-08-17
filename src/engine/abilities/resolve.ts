import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import { KEYWORD_REGISTRY } from "../catalog/keywords";
import { createEffectContext, type EffectContext } from "../effects/context";
import { interpretEffects } from "../effects/interpret";
import type { AbilityDefinition, TriggerKind } from "../types/effect";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState } from "../state/clone";

export interface AbilityContext {
  catalog: CardCatalog;
  sourcePlayerId: PlayerId;
  sourceInstanceId?: InstanceId;
  chosenTargets?: InstanceId[];
}

function collectAbilities(
  definitionAbilities: AbilityDefinition[],
  trigger: TriggerKind,
): AbilityDefinition[] {
  return definitionAbilities.filter((ability) => ability.trigger === trigger);
}

function collectKeywordAbilities(
  catalog: CardCatalog,
  defId: string,
  trigger: TriggerKind,
): AbilityDefinition[] {
  const definition = requireCardDefinition(catalog, defId);
  const keywordAbilities: AbilityDefinition[] = [];

  for (const keywordId of definition.keywords) {
    const keyword = KEYWORD_REGISTRY[keywordId];
    if (keyword.passiveAbility?.trigger === trigger) {
      keywordAbilities.push(keyword.passiveAbility);
    }
  }

  return keywordAbilities;
}

export function resolveAbilities(
  state: GameState,
  trigger: TriggerKind,
  abilityContext: AbilityContext,
  definitionAbilities: AbilityDefinition[] = [],
): { state: GameState; events: GameEvent[] } {
  const { catalog, sourcePlayerId, sourceInstanceId, chosenTargets = [] } =
    abilityContext;

  let nextState = cloneState(state);
  let events: GameEvent[] = [];

  const defId = sourceInstanceId
    ? nextState.instances[sourceInstanceId]?.defId
    : undefined;

  const abilities = [
    ...collectAbilities(definitionAbilities, trigger),
    ...(defId ? collectKeywordAbilities(catalog, defId, trigger) : []),
  ];

  for (const ability of abilities) {
    if (ability.oncePerCycle && sourceInstanceId) {
      const instance = nextState.instances[sourceInstanceId];
      if (instance.abilitiesUsedThisCycle.includes(ability.id)) {
        continue;
      }
      instance.abilitiesUsedThisCycle.push(ability.id);
    }

    const effectContext: EffectContext = createEffectContext(
      catalog,
      sourcePlayerId,
      sourceInstanceId,
      chosenTargets,
    );

    const result = interpretEffects(nextState, ability.effects, effectContext);
    nextState = result.state;
    events = [...events, ...result.events];

    if (result.pendingChoice) {
      return { state: nextState, events };
    }
  }

  return { state: nextState, events };
}

export function resolveActivatedAbility(
  state: GameState,
  abilityContext: AbilityContext,
  ability: AbilityDefinition,
): { state: GameState; events: GameEvent[] } | { error: string } {
  if (ability.trigger !== "activated") {
    return { error: "Not an activated ability." };
  }

  const nextState = cloneState(state);

  if (ability.fluxCost && ability.fluxCost > 0) {
    const player = nextState.players[abilityContext.sourcePlayerId];
    if (player.flux < ability.fluxCost) {
      return { error: "Insufficient Flux for ability." };
    }
    player.flux -= ability.fluxCost;
  }

  return resolveAbilities(nextState, "activated", abilityContext, [ability]);
}
