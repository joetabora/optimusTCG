import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId, ZoneId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState } from "./clone";

const ZONE_KEYS: Record<
  ZoneId,
  "vault" | "uplink" | "field" | "scrap" | "nullZone"
> = {
  vault: "vault",
  uplink: "uplink",
  field: "field",
  scrap: "scrap",
  null: "nullZone",
};

function removeFromZone(
  state: GameState,
  playerId: PlayerId,
  zone: ZoneId,
  instanceId: InstanceId,
): void {
  const key = ZONE_KEYS[zone];
  const zoneList = state.players[playerId][key];
  const index = zoneList.indexOf(instanceId);
  if (index >= 0) {
    zoneList.splice(index, 1);
  }
}

function addToZone(
  state: GameState,
  playerId: PlayerId,
  zone: ZoneId,
  instanceId: InstanceId,
): void {
  const key = ZONE_KEYS[zone];
  state.players[playerId][key].push(instanceId);
}

export function getZoneOwner(
  state: GameState,
  instanceId: InstanceId,
): { playerId: PlayerId; zone: ZoneId } | null {
  const instance = state.instances[instanceId];
  if (!instance) {
    return null;
  }

  for (const playerId of ["a", "b"] as PlayerId[]) {
    const player = state.players[playerId];
    for (const zone of Object.keys(ZONE_KEYS) as ZoneId[]) {
      const key = ZONE_KEYS[zone];
      if (player[key].includes(instanceId)) {
        return { playerId, zone };
      }
    }
  }

  return { playerId: instance.ownerId, zone: instance.zone };
}

export function moveInstance(
  state: GameState,
  instanceId: InstanceId,
  toZone: ZoneId,
  toPlayerId?: PlayerId,
): { state: GameState; events: GameEvent[] } {
  const nextState = cloneState(state);
  const instance = nextState.instances[instanceId];
  if (!instance) {
    throw new Error(`Unknown instance: ${instanceId}`);
  }

  const current = getZoneOwner(nextState, instanceId);
  if (!current) {
    throw new Error(`Instance ${instanceId} is not in any zone.`);
  }

  const destinationPlayerId = toPlayerId ?? current.playerId;
  removeFromZone(nextState, current.playerId, current.zone, instanceId);
  addToZone(nextState, destinationPlayerId, toZone, instanceId);
  instance.zone = toZone;
  instance.controllerId = destinationPlayerId;

  const events: GameEvent[] = [
    {
      type: "zone_changed",
      instanceId,
      from: current.zone,
      to: toZone,
      playerId: destinationPlayerId,
    },
  ];

  return { state: nextState, events };
}

export function countFieldCards(state: GameState, playerId: PlayerId): number {
  return state.players[playerId].field.length;
}

export function getConstructsOnField(
  state: GameState,
  playerId: PlayerId,
  catalog: CardCatalog,
): InstanceId[] {
  return state.players[playerId].field.filter((instanceId) => {
    const instance = state.instances[instanceId];
    const definition = requireCardDefinition(catalog, instance.defId);
    return definition.kind === "construct";
  });
}

export function isConstructOnField(
  state: GameState,
  instanceId: InstanceId,
  catalog: CardCatalog,
): boolean {
  const instance = state.instances[instanceId];
  if (!instance || instance.zone !== "field") {
    return false;
  }
  const definition = requireCardDefinition(catalog, instance.defId);
  return definition.kind === "construct";
}

export function findInstanceZone(
  state: GameState,
  playerId: PlayerId,
  instanceId: InstanceId,
): ZoneId | null {
  for (const zone of Object.keys(ZONE_KEYS) as ZoneId[]) {
    const key = ZONE_KEYS[zone];
    if (state.players[playerId][key].includes(instanceId)) {
      return zone;
    }
  }
  return null;
}
