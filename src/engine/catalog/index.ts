import { buildCatalog } from "./validate";
import { CORE_01_CARDS, buildDefaultDeck } from "./sets/core-01";
import type { CardCatalog } from "./schema";

export { buildDefaultDeck } from "./sets/core-01";
export { validateCatalog, validateDeckList, buildCatalog } from "./validate";
export type { CardCatalog } from "./schema";

export const catalog: CardCatalog = buildCatalog(CORE_01_CARDS);

export function getCardCatalog(): CardCatalog {
  return catalog;
}

export function createDefaultDecks() {
  const deck = buildDefaultDeck();
  return {
    a: [...deck],
    b: [...deck],
  } as const;
}
