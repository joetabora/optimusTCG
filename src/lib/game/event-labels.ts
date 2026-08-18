import type { CardCatalog } from "@/engine/catalog/schema";
import type { GameEvent } from "@/engine/types/event";

function cardName(
  catalog: CardCatalog,
  instances: Record<string, { defId: string }>,
  instanceId: string,
): string {
  const instance = instances[instanceId];
  if (!instance) {
    return instanceId;
  }
  return catalog.get(instance.defId)?.name ?? instance.defId;
}

export function formatGameEvent(
  event: GameEvent,
  catalog: CardCatalog,
  instances: Record<string, { defId: string }>,
): string {
  switch (event.type) {
    case "match_started":
      return "Match started.";
    case "card_drawn":
      return `Player ${event.playerId.toUpperCase()} drew ${cardName(catalog, instances, event.instanceId)}.`;
    case "card_played":
      return `Player ${event.playerId.toUpperCase()} played ${cardName(catalog, instances, event.instanceId)}.`;
    case "zone_changed":
      return `${cardName(catalog, instances, event.instanceId)} moved from ${event.from} to ${event.to}.`;
    case "phase_changed":
      return `Phase: ${event.to}.`;
    case "flux_changed":
      return `Player ${event.playerId.toUpperCase()} Flux ${event.flux}/${event.fluxMax}.`;
    case "integrity_changed":
      return `Player ${event.playerId.toUpperCase()} Nexus Integrity ${event.nexusIntegrity}.`;
    case "match_ended":
      return `Player ${event.winnerId.toUpperCase()} wins (${event.reason}).`;
    case "damage_dealt":
      if (event.target === "nexus") {
        return `Nexus took ${event.amount} Impact.`;
      }
      return `${cardName(catalog, instances, event.target)} took ${event.amount} Impact.`;
    case "construct_destroyed":
      return `${cardName(catalog, instances, event.instanceId)} was destroyed.`;
    case "attack_declared":
      if (event.target === "nexus") {
        return `${cardName(catalog, instances, event.attackerId)} declared attack on Nexus.`;
      }
      return `${cardName(catalog, instances, event.attackerId)} declared attack on ${cardName(catalog, instances, event.target)}.`;
    case "status_applied":
      return `${cardName(catalog, instances, event.instanceId)} gained ${event.status}.`;
    case "status_removed":
      return `${cardName(catalog, instances, event.instanceId)} lost ${event.status}.`;
    case "token_created":
      return `Token ${catalog.get(event.defId)?.name ?? event.defId} created.`;
    case "card_transformed":
      return `${cardName(catalog, instances, event.instanceId)} transformed.`;
    case "stat_modified":
      return `${cardName(catalog, instances, event.instanceId)} ${event.stat} ${event.amount >= 0 ? "+" : ""}${event.amount}.`;
    case "hand_mulliganed":
      return `Player ${event.playerId.toUpperCase()} mulliganed.`;
    case "pregame_advanced":
      return `Pregame: ${event.from} → ${event.to}.`;
    default:
      return "Unknown event.";
  }
}
