import type { CardCatalog } from "../catalog/schema";
import type { InstanceId, PlayerId } from "../types/ids";

export interface EffectContext {
  catalog: CardCatalog;
  sourcePlayerId: PlayerId;
  sourceInstanceId?: InstanceId;
  chosenTargets: InstanceId[];
}

export function createEffectContext(
  catalog: CardCatalog,
  sourcePlayerId: PlayerId,
  sourceInstanceId?: InstanceId,
  chosenTargets: InstanceId[] = [],
): EffectContext {
  return {
    catalog,
    sourcePlayerId,
    sourceInstanceId,
    chosenTargets,
  };
}
