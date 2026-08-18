import { describe, expect, it } from "vitest";
import { applyAction } from "../actions/apply";
import { createMatch } from "../state/create-match";
import {
  buildScenarioDeck,
  scenarioBasicCatalog,
} from "../catalog/sets/scenario-basic";

const context = { catalog: scenarioBasicCatalog };

function endTurn(state: ReturnType<typeof createMatch>, playerId: "a" | "b") {
  return applyAction(state, { type: "end_turn", playerId }, context);
}

describe("attack action", () => {
  it("declares an attack and exhausts the attacker", () => {
    let state = createMatch({
      matchId: "attack-test",
      seed: 1,
      catalog: scenarioBasicCatalog,
      deckSize: buildScenarioDeck().length,
      decks: { a: buildScenarioDeck(), b: buildScenarioDeck() },
      skipShuffle: true,
      skipMulligan: true,
    });

    const sparkNode = state.players.a.uplink.find(
      (id) => state.instances[id].defId === "hx_test_003",
    )!;

    state = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: sparkNode },
      context,
    ).state;
    state = endTurn(state, "a").state;
    state = endTurn(state, "b").state;

    const attackerId = state.players.a.field[0];
    expect(state.instances[attackerId].exhausted).toBe(false);

    const result = applyAction(
      state,
      {
        type: "attack",
        playerId: "a",
        attackerId,
        target: "nexus",
      },
      context,
    );

    expect(result.error).toBeUndefined();
    expect(result.state.engagements).toHaveLength(1);
    expect(result.state.instances[attackerId].exhausted).toBe(true);
    expect(result.events.some((event) => event.type === "attack_declared")).toBe(
      true,
    );
  });

  it("resolves nexus damage on end turn", () => {
    let state = createMatch({
      matchId: "attack-damage-test",
      seed: 1,
      catalog: scenarioBasicCatalog,
      deckSize: buildScenarioDeck().length,
      decks: { a: buildScenarioDeck(), b: buildScenarioDeck() },
      skipShuffle: true,
      skipMulligan: true,
    });

    const sparkNode = state.players.a.uplink.find(
      (id) => state.instances[id].defId === "hx_test_003",
    )!;

    state = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: sparkNode },
      context,
    ).state;
    state = endTurn(state, "a").state;
    state = endTurn(state, "b").state;

    const attackerId = state.players.a.field[0];
    state = applyAction(
      state,
      {
        type: "attack",
        playerId: "a",
        attackerId,
        target: "nexus",
      },
      context,
    ).state;

    const ended = endTurn(state, "a");

    expect(ended.error).toBeUndefined();
    expect(ended.events.some((event) => event.type === "damage_dealt")).toBe(true);
    expect(ended.state.players.b.nexusIntegrity).toBe(19);
    expect(ended.state.activePlayerId).toBe("b");
    expect(ended.state.phase).toBe("operations");
  });
});
