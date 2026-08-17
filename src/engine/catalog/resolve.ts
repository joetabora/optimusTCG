import type { CardCatalog } from "../catalog/schema";
import { getCardCatalog } from "../catalog";
import type { CardDefinition } from "../types/card";
import type { CardDefId } from "../types/ids";

export function resolveCatalog(catalog?: CardCatalog): CardCatalog {
  return catalog ?? getCardCatalog();
}

export function getCardDefinition(
  catalog: CardCatalog,
  defId: CardDefId,
): CardDefinition | undefined {
  return catalog.get(defId);
}

export function requireCardDefinition(
  catalog: CardCatalog,
  defId: CardDefId,
): CardDefinition {
  const definition = catalog.get(defId);
  if (!definition) {
    throw new Error(`Unknown card id: ${defId}`);
  }
  return definition;
}
