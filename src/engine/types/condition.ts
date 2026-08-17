import type { PhaseId, ZoneId } from "./ids";

export type ConditionDefinition =
  | { type: "targets_remaining_integrity_at_most"; amount: number }
  | { type: "source_zone_is"; zone: ZoneId }
  | { type: "controller_has_constructs_at_least"; count: number }
  | { type: "active_phase_is"; phase: PhaseId }
  | { type: "opponent_nexus_at_most"; amount: number }
  | { type: "self_nexus_at_most"; amount: number };
