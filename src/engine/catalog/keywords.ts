import type { KeywordId } from "../types/card-meta";
import type { AbilityDefinition } from "../types/effect";
import { buffThisStability } from "./builders";

export interface KeywordDefinition {
  id: KeywordId;
  name: string;
  description: string;
  passiveAbility?: AbilityDefinition;
}

export const KEYWORD_REGISTRY: Record<KeywordId, KeywordDefinition> = {
  swift: {
    id: "swift",
    name: "Swift",
    description: "This Construct can attack the cycle it enters the Field.",
  },
  bulwark: {
    id: "bulwark",
    name: "Bulwark",
    description: "Gain +0/+1 Stability while on the Field.",
    passiveAbility: {
      id: "bulwark_passive",
      trigger: "on_enter_field",
      effects: [buffThisStability(1)],
    },
  },
  overclock: {
    id: "overclock",
    name: "Overclock",
    description: "Marked for bonus Flux effects.",
  },
  salvage: {
    id: "salvage",
    name: "Salvage",
    description: "When destroyed, draw 1 card.",
  },
  probe: {
    id: "probe",
    name: "Probe",
    description: "Scout unit with lightweight footprint.",
  },
  relay: {
    id: "relay",
    name: "Relay",
    description: "Supports allied Installations.",
  },
};

export function getKeywordDefinition(id: KeywordId): KeywordDefinition {
  return KEYWORD_REGISTRY[id];
}
