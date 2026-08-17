export { createMatch, createDefaultMatch } from "./state/create-match";
export {
  applyAction,
  applyLegacyCommand,
  getLegalActions,
  validateAction,
} from "./actions/apply";
export { applyCommand } from "./commands/apply";
export { getLegalCommands } from "./commands/legal";
export { getCardCatalog, createDefaultDecks, buildDefaultDeck } from "./catalog";
export { isTerminal } from "./rules/terminal";
export { getTurnState } from "./types/turn";
export { createScenarioMatch } from "./test-helpers/scenario-match";

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
export type { GameAction, LegacyCommand } from "./types/action";
export type { Command } from "./types/command";
export type { ApplyResult, GameEvent } from "./types/event";
export type { TurnState } from "./types/turn";
export type { ActionContext } from "./actions/apply";
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
