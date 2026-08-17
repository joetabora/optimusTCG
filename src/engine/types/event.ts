import type { InstanceId, PhaseId, PlayerId, ZoneId } from "./ids";

export type GameEvent =
  | { type: "match_started"; seed: number }
  | { type: "card_drawn"; playerId: PlayerId; instanceId: InstanceId }
  | { type: "card_played"; playerId: PlayerId; instanceId: InstanceId }
  | {
      type: "zone_changed";
      instanceId: InstanceId;
      from: ZoneId;
      to: ZoneId;
      playerId: PlayerId;
    }
  | { type: "phase_changed"; from: PhaseId; to: PhaseId; playerId: PlayerId }
  | { type: "flux_changed"; playerId: PlayerId; flux: number; fluxMax: number }
  | {
      type: "integrity_changed";
      playerId: PlayerId;
      nexusIntegrity: number;
    }
  | { type: "match_ended"; winnerId: PlayerId; reason: string }
  | {
      type: "damage_dealt";
      target: InstanceId | "nexus";
      targetPlayerId: PlayerId;
      amount: number;
      sourceId: InstanceId;
    }
  | { type: "construct_destroyed"; instanceId: InstanceId; playerId: PlayerId }
  | {
      type: "attack_declared";
      attackerId: InstanceId;
      target: InstanceId | "nexus";
      playerId: PlayerId;
    };

export interface ApplyResult {
  state: import("./state").GameState;
  events: GameEvent[];
  error?: string;
}
