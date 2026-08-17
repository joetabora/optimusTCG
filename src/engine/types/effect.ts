import type { CardDefId, InstanceId, ZoneId } from "./ids";
import type { ConditionDefinition } from "./condition";

export type TriggerKind =
  | "on_play"
  | "on_enter_field"
  | "on_leave_field"
  | "on_cycle_start"
  | "on_cycle_end"
  | "on_assign_engagement"
  | "on_deal_impact"
  | "on_destroyed"
  | "activated";

export interface AbilityDefinition {
  id: string;
  trigger: TriggerKind;
  effects: EffectDefinition[];
  oncePerCycle?: boolean;
  fluxCost?: number;
}

export type TargetFilter =
  | { type: "has_keyword"; keyword: string }
  | { type: "min_impact"; amount: number };

export type TargetSelector =
  | { kind: "self" }
  | { kind: "opponent" }
  | { kind: "this" }
  | { kind: "enemy_nexus" }
  | { kind: "friendly_construct" }
  | { kind: "enemy_construct" }
  | {
      kind: "choose_construct";
      controller: "any" | "self" | "opponent";
      filters?: TargetFilter[];
    }
  | { kind: "all_constructs"; controller: "any" | "self" | "opponent" };

export type AtomicEffectDefinition =
  | { type: "deal_impact"; amount: number; target: TargetSelector }
  | { type: "draw"; count: number; target: "self" | "opponent" }
  | { type: "gain_flux"; amount: number; target: "self" | "opponent" }
  | { type: "modify_integrity"; amount: number; target: "self" | "opponent" }
  | { type: "heal_integrity"; amount: number; target: "self" | "opponent" }
  | { type: "destroy"; target: TargetSelector }
  | {
      type: "modify_stat";
      stat: "impact" | "stability";
      amount: number;
      target: TargetSelector;
      duration: "until_cooldown" | "permanent";
    }
  | { type: "apply_status"; status: import("./status").StatusId; target: TargetSelector }
  | { type: "remove_status"; status: import("./status").StatusId; target: TargetSelector }
  | {
      type: "move_zone";
      target: TargetSelector;
      toZone: ZoneId;
      destination: "self" | "opponent" | "owner";
    }
  | {
      type: "summon";
      cardDefId: CardDefId;
      controller: "self" | "opponent";
      zone: "field" | "uplink";
    }
  | {
      type: "create_tokens";
      cardDefId: CardDefId;
      count: number;
      controller: "self" | "opponent";
      zone: "uplink" | "field";
    }
  | { type: "transform"; target: TargetSelector; intoDefId: CardDefId };

export type EffectDefinition =
  | AtomicEffectDefinition
  | { type: "sequence"; effects: EffectDefinition[] }
  | {
      type: "conditional";
      condition: ConditionDefinition;
      ifTrue: EffectDefinition[];
      ifFalse?: EffectDefinition[];
    };

export interface EngagementAssignment {
  attackerId: InstanceId;
  target: InstanceId | "nexus";
}
