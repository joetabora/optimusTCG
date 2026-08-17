import { describe, expect, it } from "vitest";
import {
  applyAction,
  getLegalActions,
  isTerminal,
} from "../index";
import { createMatch } from "../state/create-match";
import {
  buildScenarioDeck,
  scenarioBasicCatalog,
} from "../catalog/sets/scenario-basic";

const context = { catalog: scenarioBasicCatalog };

function endTurn(state: ReturnType<typeof createMatch>, playerId: "a" | "b") {
  return applyAction(state, { type: "end_turn", playerId }, context);
}

function createFlowMatch() {
  const deck = buildScenarioDeck();
  return createMatch({
    matchId: "flow-test",
    seed: 7,
    catalog: scenarioBasicCatalog,
    deckSize: deck.length,
    decks: { a: [...deck], b: [...deck] },
    skipShuffle: true,
  });
}

describe("basic flow scenario", () => {
  it("covers game creation through victory", () => {
    // 1. Game creation
    let state = createFlowMatch();
    expect(state.matchId).toBe("flow-test");
    expect(state.phase).toBe("operations");

    // 2. Deck initialization
    expect(Object.keys(state.instances)).toHaveLength(20);
    expect(state.players.a.vault.length + state.players.a.uplink.length).toBe(10);

    // 3. Starting hand
    expect(state.players.a.uplink.length).toBe(6);
    expect(state.players.b.uplink.length).toBe(5);

    // 4. Turn progression + 5. Resource generation
    expect(state.players.a.flux).toBe(1);
    expect(state.players.a.fluxMax).toBe(1);

    // 6. Playing cards
    const sparkNode = state.players.a.uplink.find(
      (id) => state.instances[id].defId === "hx_test_003",
    )!;
    const played = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: sparkNode },
      context,
    );
    expect(played.error).toBeUndefined();
    state = played.state;
    expect(state.players.a.field).toContain(sparkNode);

    // Ready the construct by completing a full turn cycle
    state = endTurn(state, "a").state;
    state = endTurn(state, "b").state;

    // 7. Attacking
    const attack = applyAction(
      state,
      {
        type: "attack",
        playerId: "a",
        attackerId: sparkNode,
        target: "nexus",
      },
      context,
    );
    expect(attack.error).toBeUndefined();
    state = attack.state;
    expect(state.instances[sparkNode].exhausted).toBe(true);

    // End turn resolves damage
    const endTurnResult = endTurn(state, "a");
    expect(endTurnResult.error).toBeUndefined();

    // 8. Damage
    expect(endTurnResult.state.players.b.nexusIntegrity).toBe(19);
    expect(endTurnResult.events.some((event) => event.type === "damage_dealt")).toBe(
      true,
    );

    // Pass player b quickly
    state = endTurnResult.state;
    state = endTurn(state, "b").state;

    // Player a turn cycle 2 with more flux - play probe and attack nexus
    const probe = state.players.a.uplink.find(
      (id) => state.instances[id].defId === "hx_test_001",
    )!;
    state = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: probe },
      context,
    ).state;

    state = endTurn(state, "a").state;
    state = endTurn(state, "b").state;

    state = applyAction(
      state,
      { type: "attack", playerId: "a", attackerId: probe, target: "nexus" },
      context,
    ).state;

    state = endTurn(state, "a").state;
    expect(state.players.b.nexusIntegrity).toBe(17);

    // 10. Victory condition via concede
    const concede = applyAction(
      state,
      { type: "concede", playerId: "b" },
      context,
    );
    expect(concede.error).toBeUndefined();
    expect(concede.state.winnerId).toBe("a");
    expect(concede.state.winReason).toBe("concede");
    expect(isTerminal(concede.state)).toBe(true);
    expect(concede.events.some((event) => event.type === "match_ended")).toBe(true);

    // 9. Unit destruction in a focused combat scenario
    let combatState = createMatch({
      matchId: "combat-test",
      seed: 11,
      catalog: scenarioBasicCatalog,
      deckSize: buildScenarioDeck().length,
      decks: { a: buildScenarioDeck(), b: buildScenarioDeck() },
      skipShuffle: true,
    });

    const attackerCard = combatState.players.a.uplink.find(
      (id) => combatState.instances[id].defId === "hx_test_001",
    )!;
    combatState = applyAction(
      combatState,
      { type: "play_card", playerId: "a", instanceId: attackerCard },
      context,
    ).state;
    combatState = endTurn(combatState, "a").state;

    const defenderCard = combatState.players.b.uplink.find(
      (id) => combatState.instances[id].defId === "hx_test_003",
    )!;
    const playDefender = applyAction(
      combatState,
      { type: "play_card", playerId: "b", instanceId: defenderCard },
      context,
    );
    expect(playDefender.error).toBeUndefined();
    combatState = playDefender.state;
    const defenderOnField = combatState.players.b.field[0];
    expect(defenderOnField).toBeDefined();

    combatState = endTurn(combatState, "b").state;

    const attackerOnField = combatState.players.a.field[0];
    combatState = applyAction(
      combatState,
      {
        type: "attack",
        playerId: "a",
        attackerId: attackerOnField,
        target: defenderOnField,
      },
      context,
    ).state;

    combatState = endTurn(combatState, "a").state;
    expect(combatState.players.b.scrap).toContain(defenderOnField);

    // Legal action validation sanity check
    const legal = getLegalActions(createFlowMatch(), "a", context);
    expect(legal.some((action) => action.type === "play_card")).toBe(true);
    expect(legal.some((action) => action.type === "end_turn")).toBe(true);
  });
});
