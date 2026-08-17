import { describe, expect, it } from "vitest";
import { buildCatalog } from "./validate";
import { validateCardMetadata, validateCardAbilities } from "./validate-effects";
import { CORE_01_CARDS } from "./sets/core-01";
import type { CardDefinition } from "../types/card";
import { onPlay } from "./builders";

describe("catalog effect validation", () => {
  it("accepts a valid core catalog", () => {
    expect(() => buildCatalog(CORE_01_CARDS)).not.toThrow();
  });

  it("requires metadata fields", () => {
    const badCard = {
      ...CORE_01_CARDS[0],
      description: "",
    } as CardDefinition;
    expect(validateCardMetadata(badCard).length).toBeGreaterThan(0);
  });

  it("rejects unknown effect type in nested sequence", () => {
    const badCard: CardDefinition = {
      ...CORE_01_CARDS[0],
      abilities: [
        {
          id: "bad",
          trigger: "on_play",
          effects: [
            {
              type: "sequence",
              effects: [{ type: "unknown_effect" } as never],
            },
          ],
        },
      ],
    };
    expect(validateCardAbilities(badCard).length).toBeGreaterThan(0);
  });

  it("validates referenced token ids in summon effects", () => {
    const catalog = buildCatalog(CORE_01_CARDS);
    const errors = validateCardAbilities(CORE_01_CARDS[17], catalog);
    expect(errors).toEqual([]);
  });

  it("rejects cards with unknown summon references", () => {
    const badCard: CardDefinition = {
      ...CORE_01_CARDS[0],
      abilities: [onPlay({ type: "summon", cardDefId: "missing", controller: "self", zone: "field" })],
    };
    const catalog = buildCatalog(CORE_01_CARDS);
    expect(validateCardAbilities(badCard, catalog).length).toBeGreaterThan(0);
  });
});
