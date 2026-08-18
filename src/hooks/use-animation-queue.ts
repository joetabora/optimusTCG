import type { Dispatch, SetStateAction } from "react";
import type { GameEvent } from "@/engine/types/event";

export interface FloatingEffect {
  id: string;
  kind: "damage" | "heal" | "ability" | "death" | "draw" | "attack";
  instanceId?: string;
  label: string;
}

export function eventsToFloatingEffects(
  events: GameEvent[],
  batchId: number,
): FloatingEffect[] {
  const effects: FloatingEffect[] = [];

  events.forEach((event, index) => {
    const id = `${batchId}-${index}-${event.type}`;
    switch (event.type) {
      case "damage_dealt":
        effects.push({
          id,
          kind: "damage",
          instanceId: event.target === "nexus" ? undefined : event.target,
          label: `-${event.amount}`,
        });
        break;
      case "integrity_changed":
        effects.push({
          id,
          kind: "heal",
          label: `${event.nexusIntegrity}`,
        });
        break;
      case "construct_destroyed":
        effects.push({
          id,
          kind: "death",
          instanceId: event.instanceId,
          label: "Destroyed",
        });
        break;
      case "card_drawn":
        effects.push({
          id,
          kind: "draw",
          instanceId: event.instanceId,
          label: "Draw",
        });
        break;
      case "attack_declared":
        effects.push({
          id,
          kind: "attack",
          instanceId: event.attackerId,
          label: "Attack",
        });
        break;
      case "stat_modified":
        effects.push({
          id,
          kind: "ability",
          instanceId: event.instanceId,
          label: `${event.stat === "impact" ? "Impact" : "Stability"} ${event.amount >= 0 ? "+" : ""}${event.amount}`,
        });
        break;
      default:
        break;
    }
  });

  return effects;
}

export function scheduleFloatingEffects(
  events: GameEvent[],
  setEffects: Dispatch<SetStateAction<FloatingEffect[]>>,
  batchId: number,
) {
  const mapped = eventsToFloatingEffects(events, batchId);
  if (mapped.length === 0) {
    return;
  }

  setEffects((previous) => [...previous, ...mapped].slice(-12));
  window.setTimeout(() => {
    setEffects((previous) =>
      previous.filter((effect) => !mapped.some((entry) => entry.id === effect.id)),
    );
  }, 1200);
}
