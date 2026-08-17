import { describe, expect, it } from "vitest";
import { applyAction } from "../actions/apply";
import { createScenarioMatch, scenarioBasicCatalog } from "../test-helpers/scenario-match";

const context = { catalog: scenarioBasicCatalog };

describe("phase rules", () => {
  it("ramps flux on ignition for the active player", () => {
    const state = createScenarioMatch();

    expect(state.players.a.fluxMax).toBe(1);
    expect(state.players.a.flux).toBe(1);
    expect(state.phase).toBe("operations");
  });

  it("advances to the next player after end turn", () => {
    let state = createScenarioMatch();

    const ended = applyAction(
      state,
      { type: "end_turn", playerId: "a" },
      context,
    );

    state = ended.state;
    expect(state.activePlayerId).toBe("b");
    expect(state.phase).toBe("operations");
    expect(state.players.b.fluxMax).toBe(1);
    expect(state.players.b.flux).toBe(1);
  });

  it("increments cycle when player b finishes", () => {
    let state = createScenarioMatch();

    state = applyAction(state, { type: "end_turn", playerId: "a" }, context).state;
    state = applyAction(state, { type: "end_turn", playerId: "b" }, context).state;

    expect(state.cycle).toBe(2);
    expect(state.activePlayerId).toBe("a");
    expect(state.players.a.fluxMax).toBe(2);
  });
});
