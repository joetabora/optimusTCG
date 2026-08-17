import type { EngagementAssignment } from "../types/effect";
import type { GameEvent } from "../types/event";
import type { GameState } from "../types/state";

/** Engagement resolution — implemented in Phase 6. */
export function resolveEngagements(
  state: GameState,
  assignments: EngagementAssignment[],
): { state: GameState; events: GameEvent[] } {
  void assignments;
  return { state, events: [] };
}
