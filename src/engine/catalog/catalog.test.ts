import { describe, expect, it } from "vitest";
import { catalog, buildDefaultDeck } from "./index";
import { validateCatalog, validateDeckList } from "./validate";
import { CORE_01_CARDS } from "./sets/core-01";
import { DEFAULT_VAULT_SIZE } from "./schema";

describe("card catalog", () => {
  it("loads a valid core set", () => {
    expect(validateCatalog(CORE_01_CARDS)).toEqual([]);
    expect(catalog.size).toBe(20);
  });

  it("builds a legal default deck", () => {
    const deck = buildDefaultDeck();
    expect(deck).toHaveLength(DEFAULT_VAULT_SIZE);
    expect(validateDeckList(deck, catalog)).toEqual([]);
  });
});
