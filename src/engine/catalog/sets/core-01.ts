import type { CardDefinition } from "../../types/card";
import {
  activated,
  applyStatusToTarget,
  artRef,
  buffThisImpact,
  conditional,
  dealNexus,
  destroyEnemyConstruct,
  drawSelf,
  gainFluxSelf,
  healSelf,
  onCycleStart,
  onEnterField,
  onPlay,
  sequence,
  summonToken,
} from "../builders";

const SET_ID = "core-01";

interface CardSpec {
  name: string;
  kind: CardDefinition["kind"];
  fluxCost: number;
  description: string;
  rulesText: string;
  flavorText?: string;
  faction: CardDefinition["faction"];
  rarity: CardDefinition["rarity"];
  keywords?: CardDefinition["keywords"];
  tags?: string[];
  impact?: number;
  stability?: number;
  abilities?: CardDefinition["abilities"];
}

function defineCard(id: string, spec: CardSpec): CardDefinition {
  return {
    id,
    setId: SET_ID,
    name: spec.name,
    kind: spec.kind,
    fluxCost: spec.fluxCost,
    description: spec.description,
    rulesText: spec.rulesText,
    flavorText: spec.flavorText,
    faction: spec.faction,
    rarity: spec.rarity,
    keywords: spec.keywords ?? [],
    tags: spec.tags ?? [],
    artRef: artRef(id),
    collectible: true,
    impact: spec.impact,
    stability: spec.stability,
    abilities: spec.abilities ?? [],
  };
}

/** Token referenced by summon/create effects in this set. */
export const SPARK_FRAGMENT: CardDefinition = defineCard("hx_core_token_001", {
  name: "Spark Fragment",
  kind: "construct",
  fluxCost: 0,
  description: "0-cost 1/1 token construct.",
  rulesText: "Token.",
  faction: "neutral",
  rarity: "common",
  tags: ["token"],
  impact: 1,
  stability: 1,
});

// Override token collectibility after defineCard defaults.
SPARK_FRAGMENT.collectible = false;

export const CORE_01_CARDS: CardDefinition[] = [
  defineCard("hx_core_001", {
    name: "Pulse Drone",
    kind: "construct",
    fluxCost: 1,
    description: "1 Flux — 1/1 Probe construct.",
    rulesText: "A lightweight scout construct.",
    flavorText: "It maps the lattice before the Architects arrive.",
    faction: "synapse",
    rarity: "common",
    keywords: ["probe"],
    tags: ["scout"],
    impact: 1,
    stability: 1,
  }),
  defineCard("hx_core_002", {
    name: "Static Warden",
    kind: "construct",
    fluxCost: 2,
    description: "2 Flux — 1/3 Bulwark construct.",
    rulesText: "Bulwark. Guards a circuit junction.",
    faction: "lattice",
    rarity: "common",
    keywords: ["bulwark"],
    impact: 1,
    stability: 3,
  }),
  defineCard("hx_core_003", {
    name: "Wire Scout",
    kind: "construct",
    fluxCost: 2,
    description: "2 Flux — 2/1 Swift construct.",
    rulesText: "Swift. Fast probe unit.",
    faction: "synapse",
    rarity: "common",
    keywords: ["swift", "probe"],
    impact: 2,
    stability: 1,
  }),
  defineCard("hx_core_004", {
    name: "Spark Courier",
    kind: "construct",
    fluxCost: 1,
    description: "1 Flux — 1/2 Relay construct.",
    rulesText: "Relay. Carries flux between nodes.",
    faction: "fluxbound",
    rarity: "common",
    keywords: ["relay"],
    impact: 1,
    stability: 2,
  }),
  defineCard("hx_core_005", {
    name: "Circuit Hound",
    kind: "construct",
    fluxCost: 2,
    description: "2 Flux — 2/2 with activated +1 Impact.",
    rulesText: "Activated: pay 1 Flux — this Construct gets +1 Impact this cycle.",
    faction: "fluxbound",
    rarity: "uncommon",
    impact: 2,
    stability: 2,
    abilities: [activated("overcharge", 1, buffThisImpact(1))],
  }),
  defineCard("hx_core_006", {
    name: "Bulkhead",
    kind: "construct",
    fluxCost: 2,
    description: "2 Flux — 0/4 defensive construct.",
    rulesText: "Bulwark. Reinforced barrier construct.",
    faction: "lattice",
    rarity: "common",
    keywords: ["bulwark"],
    impact: 0,
    stability: 4,
  }),
  defineCard("hx_core_007", {
    name: "Pulse Array",
    kind: "construct",
    fluxCost: 3,
    description: "3 Flux — 3/3 construct.",
    rulesText: "Synchronized strike platform.",
    faction: "fluxbound",
    rarity: "uncommon",
    impact: 3,
    stability: 3,
  }),
  defineCard("hx_core_008", {
    name: "Breach Runner",
    kind: "construct",
    fluxCost: 4,
    description: "4 Flux — 3/2 Swift construct.",
    rulesText: "Swift. Breaks through outer lattice.",
    faction: "fluxbound",
    rarity: "rare",
    keywords: ["swift"],
    impact: 3,
    stability: 2,
  }),
  defineCard("hx_core_009", {
    name: "Iron Lattice",
    kind: "construct",
    fluxCost: 5,
    description: "5 Flux — 2/5 Bulwark construct.",
    rulesText: "Bulwark. Heavy defensive frame.",
    faction: "lattice",
    rarity: "rare",
    keywords: ["bulwark"],
    impact: 2,
    stability: 5,
  }),
  defineCard("hx_core_010", {
    name: "Anchor Pylon",
    kind: "construct",
    fluxCost: 3,
    description: "3 Flux — 0/6; on enter, draw if opponent Nexus ≤ 15.",
    rulesText: "When you play this, draw 1 if the enemy Nexus has 15 or less Integrity.",
    faction: "lattice",
    rarity: "uncommon",
    impact: 0,
    stability: 6,
    abilities: [
      onEnterField(
        conditional({ type: "opponent_nexus_at_most", amount: 15 }, [drawSelf(1)]),
      ),
    ],
  }),
  defineCard("hx_core_011", {
    name: "Flux Siphon",
    kind: "schematic",
    fluxCost: 2,
    description: "2 Flux — Draw 1 card.",
    rulesText: "Draw 1 card.",
    faction: "fluxbound",
    rarity: "common",
    abilities: [onPlay(drawSelf(1))],
  }),
  defineCard("hx_core_012", {
    name: "Overcharge",
    kind: "schematic",
    fluxCost: 1,
    description: "1 Flux — Deal 2 to enemy Nexus.",
    rulesText: "Deal 2 Impact to the enemy Nexus.",
    faction: "fluxbound",
    rarity: "common",
    abilities: [onPlay(dealNexus(2))],
  }),
  defineCard("hx_core_013", {
    name: "Patch Routine",
    kind: "schematic",
    fluxCost: 2,
    description: "2 Flux — Restore 2 Nexus Integrity.",
    rulesText: "Restore 2 Nexus Integrity.",
    faction: "synapse",
    rarity: "common",
    abilities: [onPlay(healSelf(2))],
  }),
  defineCard("hx_core_014", {
    name: "Cache Pull",
    kind: "schematic",
    fluxCost: 3,
    description: "3 Flux — Draw 2 cards.",
    rulesText: "Draw 2 cards.",
    faction: "synapse",
    rarity: "uncommon",
    abilities: [onPlay(drawSelf(2))],
  }),
  defineCard("hx_core_015", {
    name: "Data Spike",
    kind: "schematic",
    fluxCost: 2,
    description: "2 Flux — Destroy target enemy Construct.",
    rulesText: "Destroy target enemy Construct.",
    faction: "fluxbound",
    rarity: "uncommon",
    abilities: [onPlay(destroyEnemyConstruct())],
  }),
  defineCard("hx_core_016", {
    name: "Grid Tap",
    kind: "schematic",
    fluxCost: 1,
    description: "1 Flux — Gain 1 Flux.",
    rulesText: "Gain 1 Flux this cycle.",
    faction: "fluxbound",
    rarity: "common",
    abilities: [onPlay(gainFluxSelf(1))],
  }),
  defineCard("hx_core_017", {
    name: "Reset Protocol",
    kind: "schematic",
    fluxCost: 1,
    description: "1 Flux — Draw 1; if Nexus ≤ 10, draw 1 more.",
    rulesText: "Draw 1. If your Nexus has 10 or less Integrity, draw 1 more.",
    faction: "synapse",
    rarity: "uncommon",
    abilities: [
      onPlay(
        sequence(
          drawSelf(1),
          conditional({ type: "self_nexus_at_most", amount: 10 }, [drawSelf(1)]),
        ),
      ),
    ],
  }),
  defineCard("hx_core_018", {
    name: "Scramble Signal",
    kind: "schematic",
    fluxCost: 3,
    description: "3 Flux — Summon a Spark Fragment.",
    rulesText: "Summon a Spark Fragment onto your Field.",
    faction: "synapse",
    rarity: "rare",
    abilities: [onPlay(summonToken("hx_core_token_001", "field"))],
  }),
  defineCard("hx_core_019", {
    name: "Relay Node",
    kind: "installation",
    fluxCost: 3,
    description: "3 Flux — On enter, gain 1 Flux.",
    rulesText: "When this enters the Field, gain 1 Flux.",
    faction: "fluxbound",
    rarity: "uncommon",
    keywords: ["relay"],
    abilities: [onEnterField(gainFluxSelf(1))],
  }),
  defineCard("hx_core_020", {
    name: "Null Filter",
    kind: "installation",
    fluxCost: 2,
    description: "2 Flux — At cycle start, apply Marked to enemy Construct.",
    rulesText: "At the start of your Cycle, Mark target enemy Construct.",
    faction: "lattice",
    rarity: "rare",
    abilities: [
      onCycleStart(
        applyStatusToTarget("marked", {
          kind: "all_constructs",
          controller: "opponent",
        }),
      ),
    ],
  }),
  SPARK_FRAGMENT,
];

export function buildDefaultDeck(): string[] {
  return CORE_01_CARDS.filter((card) => card.collectible).flatMap((card) => [
    card.id,
    card.id,
  ]);
}