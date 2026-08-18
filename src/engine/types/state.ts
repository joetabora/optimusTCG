import type { CardInstance } from "./card";
import type { EffectDefinition } from "./effect";
import type { CommandIndex, InstanceId, PhaseId, PlayerId, WinReason } from "./ids";
import type { EffectContext } from "../effects/context";

export interface EffectContinuation {
  effects: EffectDefinition[];
  cursor: number;
  context: EffectContext;
}

export interface PendingChoice {
  id: string;
  playerId: PlayerId;
  prompt: "choose_target" | "assign_engagements";
  legalTargets: InstanceId[] | "nexus";
  continuation?: EffectContinuation;
}

export interface PlayerState {
  id: PlayerId;
  nexusIntegrity: number;
  flux: number;
  fluxMax: number;
  vault: InstanceId[];
  uplink: InstanceId[];
  field: InstanceId[];
  scrap: InstanceId[];
  nullZone: InstanceId[];
}

export type PregameStage = "mulligan_a" | "mulligan_b" | "complete";

export interface GameState {
  schemaVersion: 1;
  matchId: string;
  seed: number;
  rngIndex: number;
  instanceCounter: number;
  cycle: number;
  activePlayerId: PlayerId;
  phase: PhaseId;
  pregame: PregameStage;
  mulliganUsed: Record<PlayerId, boolean>;
  players: Record<PlayerId, PlayerState>;
  instances: Record<InstanceId, CardInstance>;
  engagements: import("./effect").EngagementAssignment[];
  hasPassedOperations: boolean;
  pendingChoice: PendingChoice | null;
  winnerId: PlayerId | null;
  winReason: WinReason | null;
  commandIndex: CommandIndex;
}

export interface MatchConfig {
  matchId: string;
  seed: number;
  decks: Record<PlayerId, import("./ids").CardDefId[]>;
  catalog?: import("../catalog/schema").CardCatalog;
  deckSize?: number;
  startingIntegrity?: number;
  startingUplinkSize?: number;
  skipOpeningTurnSetup?: boolean;
  skipShuffle?: boolean;
  skipMulligan?: boolean;
}
