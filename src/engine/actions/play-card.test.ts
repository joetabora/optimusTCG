import { describe, expect, it } from "vitest";
import { applyAction } from "../actions/apply";
import { scenarioBasicCatalog } from "../catalog/sets/scenario-basic";
import { createMatch } from "../state/create-match";
import { createScenarioMatch } from "../test-helpers/scenario-match";

const context = { catalog: scenarioBasicCatalog };

describe("play_card action", () => {
  it("plays a construct onto the field and spends flux", () => {
    let state = createScenarioMatch();
    const sparkNode = state.players.a.uplink.find(
      (id) => state.instances[id].defId === "hx_test_003",
    );

    expect(sparkNode).toBeDefined();

    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: sparkNode! },
      context,
    );

    expect(result.error).toBeUndefined();
    state = result.state;
    expect(state.players.a.field).toContain(sparkNode);
    expect(state.players.a.uplink).not.toContain(sparkNode);
    expect(state.players.a.flux).toBe(1);
    expect(state.instances[sparkNode!].exhausted).toBe(true);
    expect(result.events.some((event) => event.type === "card_played")).toBe(true);
  });

  it("rejects plays when flux is insufficient", () => {
    const state = createScenarioMatch();
    const wallUnit = state.players.a.uplink.find(
      (id) => state.instances[id].defId === "hx_test_002",
    );

    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: wallUnit! },
      context,
    );

    expect(result.error).toMatch(/Insufficient Flux/);
    expect(result.state).toBe(state);
  });

  it("sends schematics to scrap", () => {
    const schematicDeck = [
      "hx_test_004",
      "hx_test_004",
      "hx_test_003",
      "hx_test_003",
      "hx_test_001",
      "hx_test_001",
      "hx_test_002",
      "hx_test_002",
      "hx_test_005",
      "hx_test_005",
    ];

    const state = createMatch({
      matchId: "schematic-test",
      seed: 1,
      catalog: scenarioBasicCatalog,
      deckSize: schematicDeck.length,
      decks: { a: schematicDeck, b: schematicDeck },
      skipShuffle: true,
    });

    const dataBurst = state.players.a.uplink.find(
      (id) => state.instances[id].defId === "hx_test_004",
    );
    expect(dataBurst).toBeDefined();

    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: dataBurst! },
      context,
    );

    expect(result.error).toBeUndefined();
    expect(result.state.players.a.scrap).toContain(dataBurst);
  });
});
