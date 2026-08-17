import type { CardCatalog } from "../catalog/schema";
import { requireCardDefinition } from "../catalog/resolve";
import type { GameEvent } from "../types/event";
import type { InstanceId, PlayerId } from "../types/ids";
import type { GameState } from "../types/state";
import { cloneState, opponentOf } from "../state/clone";
import { checkAndDestroyDamagedConstructs } from "./death";
import {
  dealImpactToConstruct,
  dealImpactToNexus,
  getAttackerImpact,
} from "./damage";
import { checkWinCondition, maybeEmitMatchEnded } from "./win";

export function declareAttack(
  state: GameState,
  playerId: PlayerId,
  attackerId: InstanceId,
  target: InstanceId | "nexus",
): { state: GameState; events: GameEvent[] } | { error: string } {
  const nextState = cloneState(state);
  const attacker = nextState.instances[attackerId];

  if (!attacker || attacker.zone !== "field") {
    return { error: "Attacker must be on the Field." };
  }

  if (attacker.exhausted) {
    return { error: "Attacker is exhausted." };
  }

  if (attacker.controllerId !== playerId) {
    return { error: "You do not control this Construct." };
  }

  if (
    nextState.engagements.some(
      (engagement) => engagement.attackerId === attackerId,
    )
  ) {
    return { error: "Construct is already assigned to attack." };
  }

  nextState.engagements.push({ attackerId, target });
  attacker.exhausted = true;

  return {
    state: nextState,
    events: [
      {
        type: "attack_declared",
        attackerId,
        target,
        playerId,
      },
    ],
  };
}

export function resolveEngagements(
  state: GameState,
  catalog: CardCatalog,
): { state: GameState; events: GameEvent[] } {
  let nextState = cloneState(state);
  const events: GameEvent[] = [];
  const engagements = [...nextState.engagements];

  for (const engagement of engagements) {
    const attacker = nextState.instances[engagement.attackerId];
    if (!attacker || attacker.zone !== "field") {
      continue;
    }

    const impact = getAttackerImpact(nextState, engagement.attackerId, catalog);
    if (impact <= 0) {
      continue;
    }

    if (engagement.target === "nexus") {
      const opponentId = opponentOf(attacker.controllerId);
      const nexusHit = dealImpactToNexus(
        nextState,
        opponentId,
        impact,
        engagement.attackerId,
      );
      nextState = nexusHit.state;
      events.push(...nexusHit.events);
      continue;
    }

    const target = nextState.instances[engagement.target];
    if (!target || target.zone !== "field") {
      continue;
    }

    const targetDefinition = requireCardDefinition(catalog, target.defId);
    if (targetDefinition.kind !== "construct") {
      continue;
    }

    const forward = dealImpactToConstruct(
      nextState,
      engagement.target,
      impact,
      engagement.attackerId,
    );
    nextState = forward.state;
    events.push(...forward.events);

    const counter = dealImpactToConstruct(
      nextState,
      engagement.attackerId,
      target.impact,
      engagement.target,
    );
    nextState = counter.state;
    events.push(...counter.events);
  }

  nextState.engagements = [];

  const destroyed = checkAndDestroyDamagedConstructs(nextState, catalog);
  nextState = destroyed.state;
  events.push(...destroyed.events);

  nextState = checkWinCondition(nextState);
  events.push(...maybeEmitMatchEnded(nextState));

  return { state: nextState, events };
}
