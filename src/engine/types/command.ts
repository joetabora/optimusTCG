import type { EngagementAssignment } from "./effect";
import type { AbilityId, InstanceId, PlayerId } from "./ids";

export type Command =
  | {
      type: "play_card";
      playerId: PlayerId;
      instanceId: InstanceId;
      targets?: InstanceId[];
    }
  | {
      type: "activate_ability";
      playerId: PlayerId;
      instanceId: InstanceId;
      abilityId: AbilityId;
      targets?: InstanceId[];
    }
  | {
      type: "assign_engagement";
      playerId: PlayerId;
      assignments: EngagementAssignment[];
    }
  | { type: "pass"; playerId: PlayerId }
  | {
      type: "resolve_choice";
      playerId: PlayerId;
      choiceId: string;
      selected: InstanceId[];
    }
  | { type: "concede"; playerId: PlayerId };
