import { describe, expect, it } from "vitest";
import { resolveAbilities } from "./resolve";
import { KEYWORD_REGISTRY } from "../catalog/keywords";
import { createScenarioMatch, scenarioBasicCatalog } from "../test-helpers/scenario-match";
import { activated, buffThisImpact } from "../catalog/builders";

describe("resolveAbilities", () => {
  it("filters abilities by trigger", () => {
    const state = createScenarioMatch();
    const result = resolveAbilities(
      state,
      "on_play",
      { catalog: scenarioBasicCatalog, sourcePlayerId: "a" },
      [activated("x", 1, buffThisImpact(1))],
    );

    expect(result.events).toHaveLength(0);
  });

  it("executes on_play abilities", () => {
    const state = createScenarioMatch();
    const result = resolveAbilities(
      state,
      "on_play",
      { catalog: scenarioBasicCatalog, sourcePlayerId: "a" },
      [{ id: "draw", trigger: "on_play", effects: [{ type: "draw", count: 1, target: "self" }] }],
    );

    expect(result.events.some((event) => event.type === "card_drawn")).toBe(true);
  });
});

describe("keyword passives", () => {
  it("exposes bulwark keyword in registry", () => {
    expect(KEYWORD_REGISTRY.bulwark.passiveAbility?.trigger).toBe("on_enter_field");
  });
});
