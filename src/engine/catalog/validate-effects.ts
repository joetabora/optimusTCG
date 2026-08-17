import type { CardCatalog } from "./schema";
import type { CardDefinition } from "../types/card";
import { FACTION_IDS, KEYWORD_IDS, RARITIES } from "../types/card-meta";
import type { EffectDefinition } from "../types/effect";
import type { CatalogValidationError } from "./validate";

function validateEffect(
  effect: EffectDefinition,
  cardId: string,
  path: string,
): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];

  switch (effect.type) {
    case "sequence":
      effect.effects.forEach((child, index) => {
        errors.push(...validateEffect(child, cardId, `${path}.effects[${index}]`));
      });
      break;
    case "conditional":
      errors.push(
        ...effect.ifTrue.flatMap((child, index) =>
          validateEffect(child, cardId, `${path}.ifTrue[${index}]`),
        ),
      );
      if (effect.ifFalse) {
        errors.push(
          ...effect.ifFalse.flatMap((child, index) =>
            validateEffect(child, cardId, `${path}.ifFalse[${index}]`),
          ),
        );
      }
      break;
    case "deal_impact":
    case "destroy":
    case "modify_stat":
    case "apply_status":
    case "remove_status":
    case "move_zone":
    case "transform":
      if (!effect.target) {
        errors.push({ cardId, message: `${path}: target is required.` });
      }
      break;
    case "draw":
      if (effect.count < 0) {
        errors.push({ cardId, message: `${path}: draw count cannot be negative.` });
      }
      break;
    case "gain_flux":
    case "modify_integrity":
    case "heal_integrity":
      if ("amount" in effect && effect.amount < 0) {
        errors.push({ cardId, message: `${path}: amount cannot be negative.` });
      }
      break;
    case "summon":
    case "create_tokens":
      if (!effect.cardDefId.trim()) {
        errors.push({ cardId, message: `${path}: cardDefId is required.` });
      }
      break;
    default:
      errors.push({ cardId, message: `${path}: unknown effect type.` });
  }

  return errors;
}

export function validateCardMetadata(card: CardDefinition): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];

  if (!card.description.trim()) {
    errors.push({ cardId: card.id, message: "Description is required." });
  }
  if (!card.artRef.trim()) {
    errors.push({ cardId: card.id, message: "Art reference is required." });
  }
  if (!FACTION_IDS.includes(card.faction)) {
    errors.push({ cardId: card.id, message: `Invalid faction: ${card.faction}` });
  }
  if (!RARITIES.includes(card.rarity)) {
    errors.push({ cardId: card.id, message: `Invalid rarity: ${card.rarity}` });
  }
  for (const keyword of card.keywords) {
    if (!KEYWORD_IDS.includes(keyword)) {
      errors.push({ cardId: card.id, message: `Invalid keyword: ${keyword}` });
    }
  }

  return errors;
}

export function validateCardAbilities(
  card: CardDefinition,
  catalog?: CardCatalog,
): CatalogValidationError[] {
  const errors: CatalogValidationError[] = [];

  for (const ability of card.abilities) {
    if (!ability.id.trim()) {
      errors.push({ cardId: card.id, message: "Ability id is required." });
    }
    ability.effects.forEach((effect, index) => {
      errors.push(
        ...validateEffect(effect, card.id, `ability:${ability.id}[${index}]`),
      );
      if (
        catalog &&
        (effect.type === "summon" ||
          effect.type === "create_tokens" ||
          effect.type === "transform")
      ) {
        const defId =
          effect.type === "transform" ? effect.intoDefId : effect.cardDefId;
        if (!catalog.has(defId)) {
          errors.push({
            cardId: card.id,
            message: `Unknown referenced card id: ${defId}`,
          });
        }
      }
    });
  }

  return errors;
}
