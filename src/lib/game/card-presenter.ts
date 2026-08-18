import type { CardCatalog } from "@/engine/catalog/schema";
import type { CardDefinition, CardInstance } from "@/engine/types/card";
import type { FactionId, KeywordId } from "@/engine/types/card-meta";
import type { CardKind, InstanceId, PlayerId } from "@/engine/types/ids";
import type { StatusId } from "@/engine/types/status";

export interface CardDisplayModel {
  instanceId: InstanceId;
  defId: string;
  name: string;
  kind: CardKind;
  description: string;
  rulesText: string;
  flavorText?: string;
  faction: FactionId;
  keywords: KeywordId[];
  fluxCost: number;
  impact: number;
  stability: number;
  damageMarked: number;
  exhausted: boolean;
  statuses: StatusId[];
  zone: CardInstance["zone"];
  controllerId: PlayerId;
  ownerId: PlayerId;
}

export function presentCard(
  instance: CardInstance,
  definition: CardDefinition,
): CardDisplayModel {
  return {
    instanceId: instance.instanceId,
    defId: instance.defId,
    name: definition.name,
    kind: definition.kind,
    description: definition.description,
    rulesText: definition.rulesText,
    flavorText: definition.flavorText,
    faction: definition.faction,
    keywords: definition.keywords,
    fluxCost: definition.fluxCost,
    impact: instance.impact,
    stability: instance.stability,
    damageMarked: instance.damageMarked,
    exhausted: instance.exhausted,
    statuses: instance.statuses,
    zone: instance.zone,
    controllerId: instance.controllerId,
    ownerId: instance.ownerId,
  };
}

export function resolveCardDisplay(
  catalog: CardCatalog,
  instances: Record<InstanceId, CardInstance>,
  instanceId: InstanceId,
): CardDisplayModel | null {
  const instance = instances[instanceId];
  if (!instance) {
    return null;
  }
  const definition = catalog.get(instance.defId);
  if (!definition) {
    return null;
  }
  return presentCard(instance, definition);
}

export function opponentOf(playerId: PlayerId): PlayerId {
  return playerId === "a" ? "b" : "a";
}

export const FACTION_COLORS: Record<FactionId, string> = {
  synapse: "var(--helix-faction-synapse)",
  lattice: "var(--helix-faction-lattice)",
  fluxbound: "var(--helix-faction-fluxbound)",
  neutral: "var(--helix-faction-neutral)",
};
