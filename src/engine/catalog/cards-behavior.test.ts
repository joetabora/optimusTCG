import { describe, expect, it } from "vitest";
import { applyAction } from "../actions/apply";
import { catalog } from "../catalog";
import { createMatch } from "../state/create-match";
import { buildDefaultDeck } from "../catalog/sets/core-01";
import type { CardDefId } from "../types/ids";
import type { GameState } from "../types/state";

const context = { catalog };

function buildDeckWithLeading(...leading: CardDefId[]): CardDefId[] {
  const leadingSet = new Set(leading);
  const rest = buildDefaultDeck().filter((id) => !leadingSet.has(id));
  const deck = [...leading.flatMap((id) => [id, id]), ...rest];
  return deck.slice(0, buildDefaultDeck().length);
}

function createCore01Match(leading: CardDefId[], seed = 1): GameState {
  const state = createMatch({
    matchId: "cards",
    seed,
    catalog,
    decks: { a: buildDeckWithLeading(...leading), b: buildDefaultDeck() },
    skipShuffle: true,
    skipMulligan: true,
  });
  state.players.a.flux = 5;
  state.players.a.fluxMax = 5;
  return state;
}

function findInUplink(state: GameState, defId: CardDefId, playerId: "a" | "b" = "a") {
  return state.players[playerId].uplink.find(
    (id) => state.instances[id].defId === defId,
  );
}

function endTurn(state: GameState, playerId: "a" | "b") {
  return applyAction(state, { type: "end_turn", playerId }, context);
}

describe("core-01 card behaviors", () => {
  it("Flux Siphon draws a card when played", () => {
    const state = createCore01Match(["hx_core_011"]);
    const siphon = findInUplink(state, "hx_core_011")!;
    const uplinkBefore = state.players.a.uplink.length;

    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: siphon },
      context,
    );

    expect(result.error).toBeUndefined();
    expect(result.state.players.a.scrap).toContain(siphon);
    expect(result.state.players.a.uplink.length).toBe(uplinkBefore);
    expect(result.events.some((event) => event.type === "card_drawn")).toBe(true);
  });

  it("Overcharge deals 2 to enemy Nexus", () => {
    const state = createCore01Match(["hx_core_012"]);
    const overcharge = findInUplink(state, "hx_core_012")!;

    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: overcharge },
      context,
    );

    expect(result.state.players.b.nexusIntegrity).toBe(18);
  });

  it("Patch Routine heals friendly Nexus", () => {
    const state = createCore01Match(["hx_core_013"]);
    state.players.a.nexusIntegrity = 10;

    const patch = findInUplink(state, "hx_core_013")!;

    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: patch },
      context,
    );

    expect(result.state.players.a.nexusIntegrity).toBe(12);
  });

  it("Scramble Signal summons a Spark Fragment token", () => {
    const state = createCore01Match(["hx_core_018"]);

    const scramble = findInUplink(state, "hx_core_018")!;

    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: scramble },
      context,
    );

    const tokenOnField = result.state.players.a.field.find(
      (id) => result.state.instances[id].defId === "hx_core_token_001",
    );
    expect(tokenOnField).toBeDefined();
    expect(result.events.some((event) => event.type === "token_created")).toBe(true);
  });

  it("Wire Scout enters ready with Swift keyword", () => {
    const state = createCore01Match(["hx_core_003"]);
    const scout = findInUplink(state, "hx_core_003")!;

    const played = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: scout },
      context,
    );

    expect(played.state.instances[scout].exhausted).toBe(false);
  });

  it("Circuit Hound activated ability grants +1 Impact", () => {
    let state = createCore01Match(["hx_core_005"], 6);
    const hound = findInUplink(state, "hx_core_005")!;

    state = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: hound },
      context,
    ).state;
    state = endTurn(state, "a").state;
    state = endTurn(state, "b").state;

    const before = state.instances[hound].impact;
    const activated = applyAction(
      state,
      {
        type: "activate_ability",
        playerId: "a",
        instanceId: hound,
        abilityId: "overcharge",
      },
      context,
    );

    expect(activated.state.instances[hound].impact).toBe(before + 1);
  });

  it("Static Warden gains extra stability from Bulwark keyword passive", () => {
    const state = createCore01Match(["hx_core_002"], 7);
    const warden = findInUplink(state, "hx_core_002")!;

    const played = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: warden },
      context,
    );

    expect(played.state.instances[warden].stability).toBe(4);
  });

  it("cards expose full metadata", () => {
    const pulse = catalog.get("hx_core_001");
    expect(pulse?.faction).toBe("synapse");
    expect(pulse?.rarity).toBe("common");
    expect(pulse?.artRef).toBe("placeholder/hx_core_001.svg");
    expect(pulse?.description).toBeTruthy();
  });
});
