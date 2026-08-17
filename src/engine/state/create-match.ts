import { getCardCatalog, validateDeckList } from "../catalog";
import {
  DEFAULT_STARTING_INTEGRITY,
  DEFAULT_STARTING_UPLINK_SIZE,
} from "../catalog/schema";
import { createRng, shuffleInPlace } from "../rng";
import { createCardInstance } from "../types/card";
import type { GameEvent } from "../types/event";
import type { CardDefId, InstanceId, PlayerId } from "../types/ids";
import type { GameState, MatchConfig, PlayerState } from "../types/state";

const PLAYER_IDS: PlayerId[] = ["a", "b"];

function createEmptyPlayerState(
  id: PlayerId,
  startingIntegrity: number,
): PlayerState {
  return {
    id,
    nexusIntegrity: startingIntegrity,
    flux: 0,
    fluxMax: 0,
    vault: [],
    uplink: [],
    field: [],
    scrap: [],
    nullZone: [],
  };
}

function buildPlayerVault(
  playerId: PlayerId,
  deck: CardDefId[],
  matchId: string,
  instanceOffset: number,
): { instances: GameState["instances"]; vault: InstanceId[]; nextOffset: number } {
  const cardCatalog = getCardCatalog();
  const instances: GameState["instances"] = {};
  const vault: InstanceId[] = [];
  let offset = instanceOffset;

  for (const defId of deck) {
    const definition = cardCatalog.get(defId);
    if (!definition) {
      throw new Error(`Unknown card id in deck: ${defId}`);
    }

    const instanceId = `${matchId}-${playerId}-${offset}`;
    offset += 1;
    instances[instanceId] = createCardInstance(
      instanceId,
      definition,
      playerId,
      "vault",
    );
    vault.push(instanceId);
  }

  return { instances, vault, nextOffset: offset };
}

function dealOpeningUplink(
  state: GameState,
  playerId: PlayerId,
  count: number,
  events: GameEvent[],
): void {
  const player = state.players[playerId];
  const drawnIds = player.vault.splice(0, count);

  for (const instanceId of drawnIds) {
    const instance = state.instances[instanceId];
    instance.zone = "uplink";
    player.uplink.push(instanceId);
    events.push({ type: "card_drawn", playerId, instanceId });
  }
}

export function createMatch(config: MatchConfig): GameState {
  const cardCatalog = getCardCatalog();
  const startingIntegrity = config.startingIntegrity ?? DEFAULT_STARTING_INTEGRITY;
  const startingUplinkSize = config.startingUplinkSize ?? DEFAULT_STARTING_UPLINK_SIZE;

  for (const playerId of PLAYER_IDS) {
    const deckErrors = validateDeckList(config.decks[playerId], cardCatalog);
    if (deckErrors.length > 0) {
      const summary = deckErrors.map((error) => error.message).join("; ");
      throw new Error(`Invalid deck for player ${playerId}: ${summary}`);
    }
  }

  const rng = createRng(config.seed);
  let instanceOffset = 0;
  const instances: GameState["instances"] = {};
  const players = {
    a: createEmptyPlayerState("a", startingIntegrity),
    b: createEmptyPlayerState("b", startingIntegrity),
  } satisfies Record<PlayerId, PlayerState>;

  for (const playerId of PLAYER_IDS) {
    const built = buildPlayerVault(
      playerId,
      config.decks[playerId],
      config.matchId,
      instanceOffset,
    );
    Object.assign(instances, built.instances);
    players[playerId].vault = shuffleInPlace(built.vault, rng);
    instanceOffset = built.nextOffset;
  }

  const state: GameState = {
    schemaVersion: 1,
    matchId: config.matchId,
    seed: config.seed,
    rngIndex: 0,
    cycle: 1,
    activePlayerId: "a",
    phase: "ignition",
    players,
    instances,
    pendingChoice: null,
    winnerId: null,
    winReason: null,
    commandIndex: 0,
  };

  for (const playerId of PLAYER_IDS) {
    dealOpeningUplink(state, playerId, startingUplinkSize, []);
  }

  return state;
}

export function createDefaultMatch(seed = 42, matchId = "local-1"): GameState {
  const cardCatalog = getCardCatalog();
  const validDeck: CardDefId[] = [];
  for (const card of cardCatalog.values()) {
    validDeck.push(card.id, card.id);
  }

  return createMatch({
    matchId,
    seed,
    decks: {
      a: [...validDeck],
      b: [...validDeck],
    },
  });
}
