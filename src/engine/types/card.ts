import type { AbilityDefinition } from "./effect";
import type {
  CardDefId,
  CardKind,
  InstanceId,
  PlayerId,
  ZoneId,
} from "./ids";

export interface CardDefinition {
  id: CardDefId;
  setId: string;
  name: string;
  kind: CardKind;
  fluxCost: number;
  tags: string[];
  rulesText: string;
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
  };
}
