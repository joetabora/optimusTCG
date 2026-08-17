export type PlayerId = "a" | "b";

export type CardDefId = string;

export type InstanceId = string;

export type AbilityId = string;

export type CommandIndex = number;

export type CardKind = "construct" | "schematic" | "installation";

export type ZoneId = "vault" | "uplink" | "field" | "scrap" | "null";

export type PhaseId =
  | "ignition"
  | "draw"
  | "operations"
  | "resolution"
  | "cooldown";

export type WinReason = "nexus_collapsed" | "concede";
