"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GameAction } from "@/engine/types/action";
import type { AbilityId, InstanceId, PlayerId } from "@/engine/types/ids";
import type { PendingChoice } from "@/engine/types/state";
import type { GroupedLegalActions } from "@/lib/game/legal-actions";
import {
  canAttackTarget,
  getAttackTargetsForAttacker,
  getLegalAttackers,
  isActivatable,
  isPlayable,
} from "@/lib/game/legal-actions";

export type InteractionMode =
  | "idle"
  | "inspect"
  | "playCard"
  | "activate"
  | "targeting"
  | "declareAttack";

interface InteractionContextValue {
  mode: InteractionMode;
  inspectInstanceId: InstanceId | null;
  selectedHandCardId: InstanceId | null;
  selectedAttackerId: InstanceId | null;
  selectedTargetId: InstanceId | "nexus" | null;
  selectedActivation: { instanceId: InstanceId; abilityId: AbilityId } | null;
  pendingTargets: InstanceId[];
  canControl: boolean;
  openInspect: (instanceId: InstanceId) => void;
  closeInspect: () => void;
  selectHandCard: (instanceId: InstanceId) => void;
  selectFieldCard: (instanceId: InstanceId) => void;
  selectAttackTarget: (target: InstanceId | "nexus") => void;
  selectPendingTarget: (targetId: InstanceId) => void;
  confirmPendingTarget: () => GameAction | null;
  cancelInteraction: () => void;
  isHandCardPlayable: (instanceId: InstanceId) => boolean;
  isFieldCardActivatable: (instanceId: InstanceId, abilityId: AbilityId) => boolean;
  isAttackerSelected: (instanceId: InstanceId) => boolean;
  isValidAttackTarget: (target: InstanceId | "nexus") => boolean;
  isPendingTarget: (instanceId: InstanceId) => boolean;
}

const InteractionContext = createContext<InteractionContextValue | null>(null);

interface InteractionProviderProps {
  children: ReactNode;
  activePlayerId: PlayerId;
  legal: GroupedLegalActions;
  choice: PendingChoice | null;
  dispatch: (action: GameAction) => unknown;
}

export function InteractionProvider({
  children,
  activePlayerId,
  legal,
  choice,
  dispatch,
}: InteractionProviderProps) {
  const canControl = true;
  const [internalMode, setInternalMode] = useState<InteractionMode>("idle");
  const mode: InteractionMode = choice ? "targeting" : internalMode;
  const [inspectInstanceId, setInspectInstanceId] = useState<InstanceId | null>(
    null,
  );
  const [selectedHandCardId, setSelectedHandCardId] =
    useState<InstanceId | null>(null);
  const [selectedAttackerId, setSelectedAttackerId] =
    useState<InstanceId | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<
    InstanceId | "nexus" | null
  >(null);
  const [selectedActivation, setSelectedActivation] = useState<{
    instanceId: InstanceId;
    abilityId: AbilityId;
  } | null>(null);
  const [pendingTargets, setPendingTargets] = useState<InstanceId[]>([]);

  const resetSelection = useCallback(() => {
    setSelectedHandCardId(null);
    setSelectedAttackerId(null);
    setSelectedTargetId(null);
    setSelectedActivation(null);
    setPendingTargets([]);
    setInternalMode("idle");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (inspectInstanceId) {
          setInspectInstanceId(null);
          return;
        }
        resetSelection();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectInstanceId, resetSelection]);

  const openInspect = useCallback((instanceId: InstanceId) => {
    setInspectInstanceId(instanceId);
    setInternalMode("inspect");
  }, []);

  const closeInspect = useCallback(() => {
    setInspectInstanceId(null);
    setInternalMode("idle");
  }, []);

  const selectHandCard = useCallback(
    (instanceId: InstanceId) => {
      if (!canControl || !isPlayable(instanceId, legal)) {
        return;
      }
      setSelectedHandCardId(instanceId);
      setSelectedAttackerId(null);
      setSelectedActivation(null);
      setInternalMode("playCard");
      dispatch({
        type: "play_card",
        playerId: activePlayerId,
        instanceId,
      });
      resetSelection();
    },
    [activePlayerId, canControl, dispatch, legal, resetSelection],
  );

  const selectFieldCard = useCallback(
    (instanceId: InstanceId) => {
      if (!canControl) {
        return;
      }

      const activation = legal.activations.find(
        (entry) => entry.instanceId === instanceId,
      );
      if (activation) {
        setSelectedActivation(activation);
        setInternalMode("activate");
        dispatch({
          type: "activate_ability",
          playerId: activePlayerId,
          instanceId: activation.instanceId,
          abilityId: activation.abilityId,
        });
        resetSelection();
        return;
      }

      if (getLegalAttackers(legal).includes(instanceId)) {
        setSelectedAttackerId(instanceId);
        setSelectedHandCardId(null);
        setInternalMode("declareAttack");
        return;
      }
    },
    [activePlayerId, canControl, dispatch, legal, resetSelection],
  );

  const selectAttackTarget = useCallback(
    (target: InstanceId | "nexus") => {
      if (!canControl || !selectedAttackerId) {
        return;
      }
      if (!canAttackTarget(selectedAttackerId, target, legal)) {
        return;
      }
      dispatch({
        type: "attack",
        playerId: activePlayerId,
        attackerId: selectedAttackerId,
        target,
      });
      resetSelection();
    },
    [activePlayerId, canControl, dispatch, legal, resetSelection, selectedAttackerId],
  );

  const selectPendingTarget = useCallback((targetId: InstanceId) => {
    setPendingTargets([targetId]);
  }, []);

  const confirmPendingTarget = useCallback((): GameAction | null => {
    if (!choice || pendingTargets.length === 0) {
      return null;
    }
    const action: GameAction = {
      type: "resolve_choice",
      playerId: activePlayerId,
      choiceId: choice.id,
      selected: pendingTargets,
    };
    dispatch(action);
    resetSelection();
    return action;
  }, [activePlayerId, choice, dispatch, pendingTargets, resetSelection]);

  const value = useMemo<InteractionContextValue>(
    () => ({
      mode,
      inspectInstanceId,
      selectedHandCardId,
      selectedAttackerId,
      selectedTargetId,
      selectedActivation,
      pendingTargets,
      canControl,
      openInspect,
      closeInspect,
      selectHandCard,
      selectFieldCard,
      selectAttackTarget,
      selectPendingTarget,
      confirmPendingTarget,
      cancelInteraction: resetSelection,
      isHandCardPlayable: (instanceId) => isPlayable(instanceId, legal),
      isFieldCardActivatable: (instanceId, abilityId) =>
        isActivatable(instanceId, abilityId, legal),
      isAttackerSelected: (instanceId) => selectedAttackerId === instanceId,
      isValidAttackTarget: (target) =>
        selectedAttackerId
          ? canAttackTarget(selectedAttackerId, target, legal)
          : false,
      isPendingTarget: (instanceId) => pendingTargets.includes(instanceId),
    }),
    [
      canControl,
      closeInspect,
      confirmPendingTarget,
      legal,
      mode,
      openInspect,
      pendingTargets,
      resetSelection,
      selectAttackTarget,
      selectFieldCard,
      selectHandCard,
      selectPendingTarget,
      selectedActivation,
      selectedAttackerId,
      selectedHandCardId,
      selectedTargetId,
      inspectInstanceId,
    ],
  );

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteraction() {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error("useInteraction must be used within InteractionProvider");
  }
  return context;
}

export function getAttackTargetsForSelectedAttacker(
  selectedAttackerId: InstanceId | null,
  legal: GroupedLegalActions,
) {
  if (!selectedAttackerId) {
    return [];
  }
  return getAttackTargetsForAttacker(selectedAttackerId, legal);
}
