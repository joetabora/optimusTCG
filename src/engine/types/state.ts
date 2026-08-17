import type { CardInstance } from "./card";
import type { EngagementAssignment } from "./effect";
import type { CommandIndex, InstanceId, PhaseId, PlayerId, WinReason } from "./ids";
import type { CardCatalog } from "../catalog/schema";

export interface PendingChoice {
  id: string;
  playerId: PlayerId;
  prompt: "choose_target" | "assign_engagements";
  legalTargets: InstanceId[] | "nexus";
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

export interface GameState {
  schemaVersion: 1;
  matchId: string;
  seed: number;
  rngIndex: number;
  cycle: number;
  activePlayerId: PlayerId;
  phase: PhaseId;
  players: Record<PlayerId, PlayerState>;
  instances: Record<InstanceId, CardInstance>;
  engagements: EngagementAssignment[];
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
  catalog?: CardCatalog;
  deckSize?: number;
  startingIntegrity?: number;
  startingUplinkSize?: number;
  skipOpeningTurnSetup?: boolean;
  skipShuffle?: boolean;
}
