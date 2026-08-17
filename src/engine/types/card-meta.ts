export type FactionId = "synapse" | "lattice" | "fluxbound" | "neutral";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type KeywordId =
  | "swift"
  | "bulwark"
  | "overclock"
  | "salvage"
  | "probe"
  | "relay";

export const FACTION_IDS: FactionId[] = [
  "synapse",
  "lattice",
  "fluxbound",
  "neutral",
];

export const RARITIES: Rarity[] = ["common", "uncommon", "rare", "legendary"];

export const KEYWORD_IDS: KeywordId[] = [
  "swift",
  "bulwark",
  "overclock",
  "salvage",
  "probe",
  "relay",
];
