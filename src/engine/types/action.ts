import type { EngagementAssignment } from "./effect";
import type { AbilityId, InstanceId, PlayerId } from "./ids";

/** Public action model for the deterministic game engine. */
export type GameAction =
  | {
      type: "play_card";
      playerId: PlayerId;
      instanceId: InstanceId;
      targets?: InstanceId[];
    }
  | {
      type: "attack";
      playerId: PlayerId;
      attackerId: InstanceId;
      target: InstanceId | "nexus";
    }
  | {
      type: "activate_ability";
      playerId: PlayerId;
      instanceId: InstanceId;
      abilityId: AbilityId;
      targets?: InstanceId[];
    }
  | { type: "pass"; playerId: PlayerId }
  | { type: "end_turn"; playerId: PlayerId }
  | {
      type: "resolve_choice";
      playerId: PlayerId;
      choiceId: string;
      selected: InstanceId[];
    }
  | { type: "concede"; playerId: PlayerId };

/** Map legacy assign_engagement commands to attack actions. */
export type LegacyCommand =
  | GameAction
  | {
      type: "assign_engagement";
      playerId: PlayerId;
      assignments: EngagementAssignment[];
    };

export function normalizeAction(action: LegacyCommand): GameAction {
  if (action.type === "assign_engagement") {
    const first = action.assignments[0];
    if (!first) {
      return { type: "pass", playerId: action.playerId };
    }
    return {
      type: "attack",
      playerId: action.playerId,
      attackerId: first.attackerId,
      target: first.target,
    };
  }

  return action;
}
