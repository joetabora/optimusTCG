import { resumeEffectContinuation } from "../effects/interpret";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";

export function resolveChoice(
  state: GameState,
  playerId: PlayerId,
  choiceId: string,
  selected: InstanceId[],
): { state: GameState; events: GameEvent[] } | { error: string } {
  const pending = state.pendingChoice;
  if (!pending) {
    return { error: "No pending choice." };
  }

  if (pending.playerId !== playerId) {
    return { error: "Not your choice to resolve." };
  }

  if (pending.id !== choiceId) {
    return { error: "Unknown choice id." };
  }

  if (pending.legalTargets !== "nexus") {
    for (const targetId of selected) {
      if (!pending.legalTargets.includes(targetId)) {
        return { error: "Invalid target selection." };
      }
    }
  }

  const resumed = resumeEffectContinuation(state, selected);
  return { state: resumed.state, events: resumed.events };
}
