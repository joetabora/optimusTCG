import { describe, expect, it } from "vitest";
import { checkAndDestroyDamagedConstructs } from "./death";
import { dealImpactToConstruct } from "./damage";
import { createScenarioMatch, scenarioBasicCatalog } from "../test-helpers/scenario-match";
import { applyAction } from "../actions/apply";

const context = { catalog: scenarioBasicCatalog };

describe("death rules", () => {
  it("destroys constructs when damage meets stability", () => {
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
    state = dealImpactToConstruct(state, targetId, 1, targetId).state;

    const destroyed = checkAndDestroyDamagedConstructs(state, scenarioBasicCatalog);

    expect(destroyed.state.players.a.scrap).toContain(targetId);
    expect(destroyed.events.some((event) => event.type === "construct_destroyed")).toBe(
      true,
    );
  });
});
