import type { AbilityDefinition } from "./effect";
import type {
  CardDefId,
  CardKind,
  InstanceId,
  PlayerId,
  ZoneId,
} from "./ids";
import type { FactionId, KeywordId, Rarity } from "./card-meta";
import type { StatusId } from "./status";

export interface CardDefinition {
  id: CardDefId;
  setId: string;
  name: string;
  kind: CardKind;
  fluxCost: number;
  description: string;
  rulesText: string;
  flavorText?: string;
  faction: FactionId;
  rarity: Rarity;
  keywords: KeywordId[];
  tags: string[];
  artRef: string;
  collectible: boolean;
  impact?: number;
  stability?: number;
  abilities: AbilityDefinition[];
}

export interface CardInstance {
  instanceId: InstanceId;
  defId: CardDefId;
  ownerId: PlayerId;
  controllerId: PlayerId;
  zone: ZoneId;
  impact: number;
  stability: number;
  damageMarked: number;
  exhausted: boolean;
  counters: Record<string, number>;
  attachments: InstanceId[];
  statuses: StatusId[];
  /** Tracks activated/on-cycle abilities used this cycle. */
  abilitiesUsedThisCycle: string[];
}

export function createCardInstance(
  instanceId: InstanceId,
  definition: CardDefinition,
  ownerId: PlayerId,
  zone: ZoneId,
): CardInstance {
  return {
    instanceId,
    defId: definition.id,
    ownerId,
    controllerId: ownerId,
    zone,
    impact: definition.impact ?? 0,
    stability: definition.stability ?? 0,
    damageMarked: 0,
    exhausted: definition.kind === "construct",
    counters: {},
    attachments: [],
    statuses: [],
    abilitiesUsedThisCycle: [],
  };
}
