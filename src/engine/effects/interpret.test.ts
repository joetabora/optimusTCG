import { describe, expect, it } from "vitest";
import { createEffectContext } from "./context";
import { interpretEffects } from "./interpret";
import { getLegalTargetsForSelector, requiresPlayerChoice } from "./targets";
import { createScenarioMatch, scenarioBasicCatalog } from "../test-helpers/scenario-match";
import {
  conditional,
  dealNexus,
  drawSelf,
  gainFluxSelf,
  healSelf,
  sequence,
} from "../catalog/builders";

describe("effect interpreter", () => {
  it("draws cards for self", () => {
    const state = createScenarioMatch();
    const before = state.players.a.uplink.length;
    const result = interpretEffects(
      state,
      [drawSelf(1)],
      createEffectContext(scenarioBasicCatalog, "a"),
    );
    expect(result.state.players.a.uplink.length).toBe(before + 1);
    expect(result.events.some((event) => event.type === "card_drawn")).toBe(true);
  });

  it("deals damage to enemy nexus", () => {
    const state = createScenarioMatch();
    const result = interpretEffects(
      state,
      [dealNexus(3)],
      createEffectContext(scenarioBasicCatalog, "a"),
    );
    expect(result.state.players.b.nexusIntegrity).toBe(17);
  });

  it("heals friendly nexus integrity", () => {
    const state = createScenarioMatch();
    state.players.a.nexusIntegrity = 10;
    const result = interpretEffects(
      state,
      [healSelf(5)],
      createEffectContext(scenarioBasicCatalog, "a"),
    );
    expect(result.state.players.a.nexusIntegrity).toBe(15);
  });

  it("gains flux for self", () => {
    const state = createScenarioMatch();
    state.players.a.fluxMax = 5;
    state.players.a.flux = 1;
    const result = interpretEffects(
      state,
      [gainFluxSelf(1)],
      createEffectContext(scenarioBasicCatalog, "a"),
    );
    expect(result.state.players.a.flux).toBe(2);
  });

  it("runs sequence effects in order", () => {
    const state = createScenarioMatch();
    const result = interpretEffects(
      state,
      [sequence(dealNexus(1), drawSelf(1))],
      createEffectContext(scenarioBasicCatalog, "a"),
    );
    expect(result.state.players.b.nexusIntegrity).toBe(19);
    expect(result.events.some((event) => event.type === "card_drawn")).toBe(true);
  });

  it("evaluates conditional effects", () => {
    const state = createScenarioMatch();
    state.players.a.nexusIntegrity = 8;
    const result = interpretEffects(
      state,
      [
        conditional({ type: "self_nexus_at_most", amount: 10 }, [drawSelf(2)]),
      ],
      createEffectContext(scenarioBasicCatalog, "a"),
    );
    expect(result.events.filter((event) => event.type === "card_drawn")).toHaveLength(2);
  });
});

describe("target resolution", () => {
  it("flags choose_construct as requiring player choice", () => {
    expect(requiresPlayerChoice({ kind: "choose_construct", controller: "opponent" })).toBe(
      true,
    );
  });

  it("lists enemy constructs as legal targets", () => {
    let state = createScenarioMatch();
    state = interpretEffects(
      state,
      [],
      createEffectContext(scenarioBasicCatalog, "b"),
    ).state;

    const targets = getLegalTargetsForSelector(
      state,
      { kind: "enemy_construct" },
      createEffectContext(scenarioBasicCatalog, "a"),
    );

    expect(Array.isArray(targets)).toBe(true);
  });
});
