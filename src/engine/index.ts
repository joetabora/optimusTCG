export { createMatch, createDefaultMatch } from "./state/create-match";
export { applyCommand } from "./commands/apply";
export { getLegalCommands } from "./commands/legal";
export { getCardCatalog, createDefaultDecks, buildDefaultDeck } from "./catalog";
export { isTerminal } from "./rules/terminal";

export type {
  GameState,
  MatchConfig,
  PlayerState,
  PendingChoice,
} from "./types/state";
export type { CardDefinition, CardInstance } from "./types/card";
export type {
  AbilityDefinition,
  EffectDefinition,
  EngagementAssignment,
  TargetSelector,
  TriggerKind,
} from "./types/effect";
export type { Command } from "./types/command";
export type { ApplyResult, GameEvent } from "./types/event";
export type {
  PlayerId,
  CardDefId,
  InstanceId,
  AbilityId,
  CardKind,
  ZoneId,
  PhaseId,
  WinReason,
} from "./types/ids";
