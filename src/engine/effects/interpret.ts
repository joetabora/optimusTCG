import type { EffectDefinition } from "../types/effect";
import type { GameEvent } from "../types/event";
import type { GameState } from "../types/state";
import type { PlayerId } from "../types/ids";

/** Effect interpreter — implemented in Phase 5. */
export function interpretEffects(
  state: GameState,
  effects: EffectDefinition[],
  sourcePlayerId: PlayerId,
): { state: GameState; events: GameEvent[] } {
  void state;
  void effects;
  void sourcePlayerId;
  throw new Error("Effect interpreter is not implemented yet.");
}
