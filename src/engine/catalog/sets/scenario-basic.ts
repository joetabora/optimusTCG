import type { CardDefinition } from "../../types/card";
import { artRef, onPlay, dealNexus } from "../builders";
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
    description: `${impact}/${stability} test construct.`,
    rulesText: `${impact}/${stability} test construct.`,
    faction: "neutral",
    rarity: "common",
    keywords: [],
    tags: ["test"],
    artRef: artRef(id),
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
    description: "Test schematic.",
    rulesText: "Test schematic.",
    faction: "neutral",
    rarity: "common",
    keywords: [],
    tags: ["test"],
    artRef: artRef(id),
    collectible: false,
    abilities:
      id === "hx_test_004"
        ? [onPlay(dealNexus(1))]
        : [],
  };
}

function installation(id: string, name: string, fluxCost: number): CardDefinition {
  return {
    id,
    setId: SET_ID,
    name,
    kind: "installation",
    fluxCost,
    description: "Test installation.",
    rulesText: "Test installation.",
    faction: "neutral",
    rarity: "common",
    keywords: [],
    tags: ["test"],
    artRef: artRef(id),
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
