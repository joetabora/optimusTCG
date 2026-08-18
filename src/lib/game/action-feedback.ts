import { validateAction, type GameAction } from "@/engine";
import type { ActionContext } from "@/engine/actions/apply";
import type { GameState } from "@/engine/types/state";
import type { PlayerId } from "@/engine/types/ids";

export function explainActionError(
  state: GameState,
  action: GameAction,
  context?: ActionContext,
): string | null {
  return validateAction(state, action, context);
}

export function explainPlayCardError(
  state: GameState,
  playerId: PlayerId,
  instanceId: string,
  context?: ActionContext,
): string | null {
  return validateAction(
    state,
    { type: "play_card", playerId, instanceId },
    context,
  );
}

export function explainAttackError(
  state: GameState,
  playerId: PlayerId,
  attackerId: string,
  target: string | "nexus",
  context?: ActionContext,
): string | null {
  return validateAction(
    state,
    {
      type: "attack",
      playerId,
      attackerId,
      target: target === "nexus" ? "nexus" : target,
    },
    context,
  );
}
