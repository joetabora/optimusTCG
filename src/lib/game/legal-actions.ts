import type { GameAction } from "@/engine/types/action";
import type { AbilityId, InstanceId, PlayerId } from "@/engine/types/ids";

export interface GroupedLegalActions {
  playableCards: InstanceId[];
  activations: Array<{
    instanceId: InstanceId;
    abilityId: AbilityId;
  }>;
  attacks: Array<{
    attackerId: InstanceId;
    target: InstanceId | "nexus";
  }>;
  canPass: boolean;
  canEndTurn: boolean;
  canConcede: boolean;
  resolveChoice: GameAction | null;
}

export function groupLegalActions(
  actions: GameAction[],
  playerId: PlayerId,
): GroupedLegalActions {
  const playableCards: InstanceId[] = [];
  const activations: GroupedLegalActions["activations"] = [];
  const attacks: GroupedLegalActions["attacks"] = [];
  let canPass = false;
  let canEndTurn = false;
  let canConcede = false;
  let resolveChoice: GameAction | null = null;

  for (const action of actions) {
    if (action.playerId !== playerId) {
      continue;
    }

    switch (action.type) {
      case "play_card":
        playableCards.push(action.instanceId);
        break;
      case "activate_ability":
        activations.push({
          instanceId: action.instanceId,
          abilityId: action.abilityId,
        });
        break;
      case "attack":
        attacks.push({
          attackerId: action.attackerId,
          target: action.target,
        });
        break;
      case "pass":
        canPass = true;
        break;
      case "end_turn":
        canEndTurn = true;
        break;
      case "concede":
        canConcede = true;
        break;
      case "resolve_choice":
        resolveChoice = action;
        break;
      default:
        break;
    }
  }

  return {
    playableCards,
    activations,
    attacks,
    canPass,
    canEndTurn,
    canConcede,
    resolveChoice,
  };
}

export function isPlayable(instanceId: InstanceId, grouped: GroupedLegalActions) {
  return grouped.playableCards.includes(instanceId);
}

export function isActivatable(
  instanceId: InstanceId,
  abilityId: AbilityId,
  grouped: GroupedLegalActions,
) {
  return grouped.activations.some(
    (entry) =>
      entry.instanceId === instanceId && entry.abilityId === abilityId,
  );
}

export function getAttackTargetsForAttacker(
  attackerId: InstanceId,
  grouped: GroupedLegalActions,
): Array<InstanceId | "nexus"> {
  return grouped.attacks
    .filter((entry) => entry.attackerId === attackerId)
    .map((entry) => entry.target);
}

export function canAttackTarget(
  attackerId: InstanceId,
  target: InstanceId | "nexus",
  grouped: GroupedLegalActions,
) {
  return grouped.attacks.some(
    (entry) => entry.attackerId === attackerId && entry.target === target,
  );
}

export function getLegalAttackers(grouped: GroupedLegalActions): InstanceId[] {
  return [...new Set(grouped.attacks.map((entry) => entry.attackerId))];
}
