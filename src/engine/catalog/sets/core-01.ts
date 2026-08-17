import type { CardDefinition } from "../../types/card";

const SET_ID = "core-01";

function construct(
  id: string,
  name: string,
  fluxCost: number,
  impact: number,
  stability: number,
  rulesText: string,
): CardDefinition {
  return {
    id,
    setId: SET_ID,
    name,
    kind: "construct",
    fluxCost,
    tags: [],
    rulesText,
    collectible: true,
    impact,
    stability,
    abilities: [],
  };
}

function schematic(
  id: string,
  name: string,
  fluxCost: number,
  rulesText: string,
): CardDefinition {
  return {
    id,
    setId: SET_ID,
    name,
    kind: "schematic",
    fluxCost,
    tags: [],
    rulesText,
    collectible: true,
    abilities: [],
  };
}

function installation(
  id: string,
  name: string,
  fluxCost: number,
  rulesText: string,
): CardDefinition {
  return {
    id,
    setId: SET_ID,
    name,
    kind: "installation",
    fluxCost,
    tags: [],
    rulesText,
    collectible: true,
    abilities: [],
  };
}

/** Stub core set — 20 unique cards for default 40-card vaults (2 copies each). */
export const CORE_01_CARDS: CardDefinition[] = [
  construct("hx_core_001", "Pulse Drone", 1, 1, 1, "A lightweight scout construct."),
  construct("hx_core_002", "Static Warden", 2, 1, 3, "Guards a circuit junction."),
  construct("hx_core_003", "Wire Scout", 2, 2, 1, "Fast probe unit."),
  construct("hx_core_004", "Spark Courier", 1, 1, 2, "Carries flux between nodes."),
  construct("hx_core_005", "Circuit Hound", 2, 2, 2, "Tracks unstable signals."),
  construct("hx_core_006", "Bulkhead", 2, 0, 4, "Reinforced barrier construct."),
  construct("hx_core_007", "Pulse Array", 3, 3, 3, "Synchronized strike platform."),
  construct("hx_core_008", "Breach Runner", 4, 3, 2, "Breaks through outer lattice."),
  construct("hx_core_009", "Iron Lattice", 5, 2, 5, "Heavy defensive frame."),
  construct("hx_core_010", "Anchor Pylon", 3, 0, 6, "Stabilizes the field grid."),
  schematic("hx_core_011", "Flux Siphon", 2, "Draw 1 card."),
  schematic("hx_core_012", "Overcharge", 1, "Deal 2 impact to the enemy Nexus."),
  schematic("hx_core_013", "Patch Routine", 2, "Restore 2 Nexus Integrity."),
  schematic("hx_core_014", "Cache Pull", 3, "Draw 2 cards."),
  schematic("hx_core_015", "Data Spike", 2, "Deal 3 impact to a target construct."),
  schematic("hx_core_016", "Grid Tap", 1, "Gain 1 Flux this cycle."),
  schematic("hx_core_017", "Reset Protocol", 1, "Draw 1 card."),
  schematic("hx_core_018", "Scramble Signal", 3, "Destroy target construct."),
  installation("hx_core_019", "Relay Node", 3, "Persistent flux relay."),
  installation("hx_core_020", "Null Filter", 2, "Filters hostile schematics."),
];

export function buildDefaultDeck(): string[] {
  return CORE_01_CARDS.flatMap((card) => [card.id, card.id]);
}
