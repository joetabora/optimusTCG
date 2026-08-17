import type { AbilityId, InstanceId } from "./ids";

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
  id: AbilityId;
  trigger: TriggerKind;
  effects: EffectDefinition[];
  oncePerCycle?: boolean;
}

export type TargetSelector =
  | { kind: "self" }
  | { kind: "opponent" }
  | { kind: "this" }
  | { kind: "choose_construct"; controller: "any" | "self" | "opponent" }
  | { kind: "all_constructs"; controller: "any" | "self" | "opponent" };

export type EffectDefinition =
  | {
      type: "deal_impact";
      amount: number;
      target: TargetSelector;
    }
  | {
      type: "draw";
      count: number;
      target: "self" | "opponent";
    }
  | {
      type: "gain_flux";
      amount: number;
      target: "self" | "opponent";
    }
  | {
      type: "modify_integrity";
      amount: number;
      target: "self" | "opponent";
    }
  | {
      type: "destroy";
      target: TargetSelector;
    }
  | {
      type: "modify_stat";
      stat: "impact" | "stability";
      amount: number;
      target: TargetSelector;
      duration: "until_cooldown" | "permanent";
    };

export interface EngagementAssignment {
  attackerId: InstanceId;
  target: InstanceId | "nexus";
}
