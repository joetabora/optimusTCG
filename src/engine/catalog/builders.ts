import type { AbilityDefinition, EffectDefinition, TargetSelector } from "../types/effect";
import type { CardDefId } from "../types/ids";
import type { StatusId } from "../types/status";
import type { ConditionDefinition } from "../types/condition";

export function onPlay(...effects: EffectDefinition[]): AbilityDefinition {
  return { id: "on_play", trigger: "on_play", effects };
}

export function onEnterField(...effects: EffectDefinition[]): AbilityDefinition {
  return { id: "on_enter_field", trigger: "on_enter_field", effects };
}

export function onCycleStart(...effects: EffectDefinition[]): AbilityDefinition {
  return { id: "on_cycle_start", trigger: "on_cycle_start", effects };
}

export function activated(
  id: string,
  fluxCost: number,
  ...effects: EffectDefinition[]
): AbilityDefinition {
  return { id, trigger: "activated", fluxCost, effects, oncePerCycle: true };
}

export function drawSelf(count: number): EffectDefinition {
  return { type: "draw", count, target: "self" };
}

export function drawOpponent(count: number): EffectDefinition {
  return { type: "draw", count, target: "opponent" };
}

export function dealNexus(amount: number): EffectDefinition {
  return { type: "deal_impact", amount, target: { kind: "enemy_nexus" } };
}

export function healSelf(amount: number): EffectDefinition {
  return { type: "heal_integrity", amount, target: "self" };
}

export function gainFluxSelf(amount: number): EffectDefinition {
  return { type: "gain_flux", amount, target: "self" };
}

export function destroyEnemyConstruct(): EffectDefinition {
  return {
    type: "destroy",
    target: { kind: "choose_construct", controller: "opponent" },
  };
}

export function buffThisImpact(amount: number): EffectDefinition {
  return {
    type: "modify_stat",
    stat: "impact",
    amount,
    target: { kind: "this" },
    duration: "until_cooldown",
  };
}

export function buffThisStability(amount: number): EffectDefinition {
  return {
    type: "modify_stat",
    stat: "stability",
    amount,
    target: { kind: "this" },
    duration: "until_cooldown",
  };
}

export function applyStatusToThis(status: StatusId): EffectDefinition {
  return { type: "apply_status", status, target: { kind: "this" } };
}

export function applyStatusToTarget(
  status: StatusId,
  target: TargetSelector,
): EffectDefinition {
  return { type: "apply_status", status, target };
}

export function summonToken(
  cardDefId: CardDefId,
  zone: "field" | "uplink" = "field",
): EffectDefinition {
  return { type: "summon", cardDefId, controller: "self", zone };
}

export function createTokens(
  cardDefId: CardDefId,
  count: number,
): EffectDefinition {
  return {
    type: "create_tokens",
    cardDefId,
    count,
    controller: "self",
    zone: "uplink",
  };
}

export function returnFromScrap(): EffectDefinition {
  return {
    type: "move_zone",
    target: { kind: "choose_construct", controller: "self" },
    toZone: "uplink",
    destination: "owner",
  };
}

export function transformTarget(intoDefId: CardDefId): EffectDefinition {
  return {
    type: "transform",
    target: { kind: "choose_construct", controller: "any" },
    intoDefId,
  };
}

export function sequence(...effects: EffectDefinition[]): EffectDefinition {
  return { type: "sequence", effects };
}

export function conditional(
  condition: ConditionDefinition,
  ifTrue: EffectDefinition[],
  ifFalse?: EffectDefinition[],
): EffectDefinition {
  return { type: "conditional", condition, ifTrue, ifFalse };
}

export function artRef(cardId: string): string {
  return `placeholder/${cardId}.svg`;
}
