import { describe, expect, it } from "vitest";
import { dealImpactToConstruct, dealImpactToNexus } from "./damage";
import { createScenarioMatch, scenarioBasicCatalog } from "../test-helpers/scenario-match";
import { applyAction } from "../actions/apply";

const context = { catalog: scenarioBasicCatalog };

describe("damage rules", () => {
  it("marks damage on constructs", () => {
    let state = createScenarioMatch();
    state = applyAction(
      state,
      {
        type: "play_card",
        playerId: "a",
        instanceId: state.players.a.uplink.find(
          (id) => state.instances[id].defId === "hx_test_003",
        )!,
      },
      context,
    ).state;

    const targetId = state.players.a.field[0];
    const result = dealImpactToConstruct(state, targetId, 1, targetId);

    expect(result.state.instances[targetId].damageMarked).toBe(1);
    expect(result.events[0]?.type).toBe("damage_dealt");
  });

  it("reduces nexus integrity", () => {
    const state = createScenarioMatch();
    const attackerId = state.players.a.uplink[0];
    const result = dealImpactToNexus(state, "b", 2, attackerId);

    expect(result.state.players.b.nexusIntegrity).toBe(18);
    expect(result.events.some((event) => event.type === "integrity_changed")).toBe(
      true,
    );
  });
});
