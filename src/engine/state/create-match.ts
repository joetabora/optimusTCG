import { resolveCatalog, requireCardDefinition } from "../catalog/resolve";
import { validateDeckList } from "../catalog/validate";
import {
  DEFAULT_STARTING_INTEGRITY,
  DEFAULT_STARTING_UPLINK_SIZE,
  DEFAULT_VAULT_SIZE,
} from "../catalog/schema";
import { beginActiveTurn } from "../rules/phases";
import { createRng, shuffleInPlace } from "../rng";
import { createCardInstance } from "../types/card";
import type { GameEvent } from "../types/event";
import type { CardDefId, InstanceId, PlayerId } from "../types/ids";
import type { GameState, MatchConfig, PlayerState } from "../types/state";
import { cloneState } from "./clone";
import { drawCards } from "./rng-state";

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
  catalog: ReturnType<typeof resolveCatalog>,
): { instances: GameState["instances"]; vault: InstanceId[]; nextOffset: number } {
  const instances: GameState["instances"] = {};
  const vault: InstanceId[] = [];
  let offset = instanceOffset;

  for (const defId of deck) {
    const definition = requireCardDefinition(catalog, defId);
    void definition;

    const instanceId = `${matchId}-${playerId}-${offset}`;
    offset += 1;
    instances[instanceId] = createCardInstance(
      instanceId,
      requireCardDefinition(catalog, defId),
      playerId,
      "vault",
    );
    vault.push(instanceId);
  }

  return { instances, vault, nextOffset: offset };
}

export function createMatch(config: MatchConfig): GameState {
  const catalog = resolveCatalog(config.catalog);
  const startingIntegrity = config.startingIntegrity ?? DEFAULT_STARTING_INTEGRITY;
  const startingUplinkSize = config.startingUplinkSize ?? DEFAULT_STARTING_UPLINK_SIZE;
  const deckSize = config.deckSize ?? DEFAULT_VAULT_SIZE;

  for (const playerId of PLAYER_IDS) {
    const deckErrors = validateDeckList(
      config.decks[playerId],
      catalog,
      deckSize,
    );
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
      catalog,
    );
    Object.assign(instances, built.instances);
    players[playerId].vault = config.skipShuffle
      ? built.vault
      : shuffleInPlace(built.vault, rng);
    instanceOffset = built.nextOffset;
  }

  let state: GameState = {
    schemaVersion: 1,
    matchId: config.matchId,
    seed: config.seed,
    rngIndex: 0,
    instanceCounter: instanceOffset,
    cycle: 1,
    activePlayerId: "a",
    phase: "ignition",
    players,
    instances,
    engagements: [],
    hasPassedOperations: false,
    pendingChoice: null,
    winnerId: null,
    winReason: null,
    commandIndex: 0,
  };

  const events: GameEvent[] = [{ type: "match_started", seed: config.seed }];

  for (const playerId of PLAYER_IDS) {
    const dealt = drawCards(state, playerId, startingUplinkSize);
    state = dealt.state;
    events.push(...dealt.events);
  }

  if (!config.skipOpeningTurnSetup) {
    const turn = beginActiveTurn(state, catalog);
    state = turn.state;
    events.push(...turn.events);
  }

  void events;
  return cloneState(state);
}

export function createDefaultMatch(seed = 42, matchId = "local-1"): GameState {
  const catalog = resolveCatalog();
  const validDeck: CardDefId[] = [];
  for (const card of catalog.values()) {
    if (!card.collectible) {
      continue;
    }
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
