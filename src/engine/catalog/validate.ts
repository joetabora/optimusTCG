import type { CardDefinition } from "../types/card";
import type { CardDefId } from "../types/ids";
import {
  DEFAULT_VAULT_SIZE,
  MAX_COPIES_PER_CARD,
  type CardCatalog,
} from "./schema";

export interface CatalogValidationError {
  cardId?: CardDefId;
  message: string;
}

export function validateCardDefinition(card: CardDefinition): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];

  if (!card.id.trim()) {
    errors.push({ cardId: card.id, message: "Card id is required." });
  }

  if (!card.name.trim()) {
    errors.push({ cardId: card.id, message: "Card name is required." });
  }

  if (card.fluxCost < 0) {
    errors.push({ cardId: card.id, message: "Flux cost cannot be negative." });
  }

  if (card.kind === "construct") {
    if (card.impact === undefined || card.stability === undefined) {
      errors.push({
        cardId: card.id,
        message: "Constructs require impact and stability.",
      });
    }
  }

  for (const ability of card.abilities) {
    if (!ability.id.trim()) {
      errors.push({
        cardId: card.id,
        message: "Ability id is required.",
      });
    }
  }

  return errors;
}

export function validateCatalog(cards: CardDefinition[]): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];
  const seenIds = new Set<CardDefId>();

  for (const card of cards) {
    if (seenIds.has(card.id)) {
      errors.push({ cardId: card.id, message: "Duplicate card id in catalog." });
    }
    seenIds.add(card.id);
    errors.push(...validateCardDefinition(card));
  }

  return errors;
}

export function validateDeckList(
  deck: CardDefId[],
  catalog: CardCatalog,
): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];
  const counts = new Map<CardDefId, number>();

  if (deck.length !== DEFAULT_VAULT_SIZE) {
    errors.push({
      message: `Deck must contain exactly ${DEFAULT_VAULT_SIZE} cards.`,
    });
  }

  for (const cardId of deck) {
    if (!catalog.has(cardId)) {
      errors.push({ cardId, message: "Unknown card id in deck." });
      continue;
    }

    const nextCount = (counts.get(cardId) ?? 0) + 1;
    counts.set(cardId, nextCount);

    if (nextCount > MAX_COPIES_PER_CARD) {
      errors.push({
        cardId,
        message: `Deck exceeds ${MAX_COPIES_PER_CARD} copies of this card.`,
      });
    }
  }

  return errors;
}

export function buildCatalog(cards: CardDefinition[]): CardCatalog {
  const errors = validateCatalog(cards);
  if (errors.length > 0) {
    const summary = errors.map((error) => error.message).join("; ");
    throw new Error(`Invalid card catalog: ${summary}`);
  }

  return new Map(cards.map((card) => [card.id, card]));
}
