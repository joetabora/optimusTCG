import type { CardDefinition } from "../../types/card";
import { buildCatalog } from "../validate";

const SET_ID = "scenario-basic";

function construct(
  id: string,
  name: string,
  fluxCost: number,
  impact: number,
  stability: number,
): CardDefinition {
  return {
    id,
    setId: SET_ID,
    name,
    kind: "construct",
    fluxCost,
    tags: ["test"],
    rulesText: `${impact}/${stability} test construct.`,
    collectible: false,
    impact,
    stability,
    abilities: [],
  };
}

function schematic(id: string, name: string, fluxCost: number): CardDefinition {
  return {
    id,
    setId: SET_ID,
    name,
    kind: "schematic",
    fluxCost,
    tags: ["test"],
    rulesText: "Test schematic.",
    collectible: false,
    abilities: [],
  };
}

function installation(id: string, name: string, fluxCost: number): CardDefinition {
  return {
    id,
    setId: SET_ID,
    name,
    kind: "installation",
    fluxCost,
    tags: ["test"],
    rulesText: "Test installation.",
    collectible: false,
    abilities: [],
  };
}

export const SCENARIO_BASIC_CARDS: CardDefinition[] = [
  construct("hx_test_001", "Probe Unit", 1, 2, 1),
  construct("hx_test_002", "Wall Unit", 2, 1, 4),
  construct("hx_test_003", "Spark Node", 0, 1, 1),
  schematic("hx_test_004", "Data Burst", 1),
  installation("hx_test_005", "Relay Plate", 2),
];

export const scenarioBasicCatalog = buildCatalog(SCENARIO_BASIC_CARDS);

export function buildScenarioDeck(): string[] {
  return SCENARIO_BASIC_CARDS.flatMap((card) => [card.id, card.id]);
}
