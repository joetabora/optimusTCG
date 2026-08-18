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
import type { CardCatalog } from "@/engine/catalog/schema";
import { requireCardDefinition } from "@/engine/catalog/resolve";
import type { GameAction } from "@/engine/types/action";
import type { AbilityId, InstanceId, PlayerId } from "@/engine/types/ids";
import type { GameState, PendingChoice } from "@/engine/types/state";
import type { GroupedLegalActions } from "@/lib/game/legal-actions";
import {
  explainPlayCardError,
} from "@/lib/game/action-feedback";
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
  pendingPlayCardId: InstanceId | null;
  selectedHandCardId: InstanceId | null;
  selectedAttackerId: InstanceId | null;
  selectedTargetId: InstanceId | "nexus" | null;
  selectedActivation: { instanceId: InstanceId; abilityId: AbilityId } | null;
  pendingTargets: InstanceId[];
  canControl: boolean;
  openInspect: (instanceId: InstanceId) => void;
  closeInspect: () => void;
  selectHandCard: (instanceId: InstanceId) => void;
  confirmPendingPlay: () => void;
  playPendingOnField: () => void;
  selectFieldCard: (instanceId: InstanceId) => void;
  confirmActivation: () => void;
  selectAttackTarget: (target: InstanceId | "nexus") => void;
  selectPendingTarget: (targetId: InstanceId) => void;
  confirmPendingTarget: () => GameAction | null;
  cancelInteraction: () => void;
  isHandCardPlayable: (instanceId: InstanceId) => boolean;
  handCardDisabledReason: (instanceId: InstanceId) => string | null;
  isPendingConstructPlay: () => boolean;
  isFieldCardActivatable: (instanceId: InstanceId, abilityId: AbilityId) => boolean;
  isAttackerSelected: (instanceId: InstanceId) => boolean;
  isValidAttackTarget: (target: InstanceId | "nexus") => boolean;
  isPendingTarget: (instanceId: InstanceId) => boolean;
  isPendingTargetLegal: (instanceId: InstanceId) => boolean;
}

const InteractionContext = createContext<InteractionContextValue | null>(null);

interface InteractionProviderProps {
  children: ReactNode;
  controllingPlayerId: PlayerId;
  canControl: boolean;
  legal: GroupedLegalActions;
  choice: PendingChoice | null;
  state: GameState;
  catalog: CardCatalog;
  dispatch: (action: GameAction) => unknown;
  onError?: (message: string) => void;
}

function cardKind(
  state: GameState,
  catalog: CardCatalog,
  instanceId: InstanceId,
): string | null {
  const instance = state.instances[instanceId];
  if (!instance) {
    return null;
  }
  return requireCardDefinition(catalog, instance.defId).kind;
}

export function InteractionProvider({
  children,
  controllingPlayerId,
  canControl,
  legal,
  choice,
  state,
  catalog,
  dispatch,
  onError,
}: InteractionProviderProps) {
  const [internalMode, setInternalMode] = useState<InteractionMode>("idle");
  const mode: InteractionMode = choice ? "targeting" : internalMode;
  const [inspectInstanceId, setInspectInstanceId] = useState<InstanceId | null>(
    null,
  );
  const [pendingPlayCardId, setPendingPlayCardId] =
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
    setPendingPlayCardId(null);
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

  const reportError = useCallback(
    (message: string) => {
      onError?.(message);
    },
    [onError],
  );

  const selectHandCard = useCallback(
    (instanceId: InstanceId) => {
      if (!canControl) {
        reportError("Not your turn.");
        return;
      }
      if (!isPlayable(instanceId, legal)) {
        const reason = explainPlayCardError(
          state,
          controllingPlayerId,
          instanceId,
          { catalog },
        );
        if (reason) {
          reportError(reason);
        }
        return;
      }

      if (pendingPlayCardId === instanceId) {
        const kind = cardKind(state, catalog, instanceId);
        if (kind !== "construct") {
          dispatch({
            type: "play_card",
            playerId: controllingPlayerId,
            instanceId,
          });
          resetSelection();
        }
        return;
      }

      setPendingPlayCardId(instanceId);
      setSelectedAttackerId(null);
      setSelectedActivation(null);
      setInternalMode("playCard");
    },
    [
      canControl,
      catalog,
      controllingPlayerId,
      dispatch,
      legal,
      pendingPlayCardId,
      reportError,
      resetSelection,
      state,
    ],
  );

  const confirmPendingPlay = useCallback(() => {
    if (!canControl || !pendingPlayCardId) {
      return;
    }
    const kind = cardKind(state, catalog, pendingPlayCardId);
    if (kind === "construct") {
      reportError("Deploy this construct to your field.");
      return;
    }
    dispatch({
      type: "play_card",
      playerId: controllingPlayerId,
      instanceId: pendingPlayCardId,
    });
    resetSelection();
  }, [
    canControl,
    catalog,
    controllingPlayerId,
    dispatch,
    pendingPlayCardId,
    reportError,
    resetSelection,
    state,
  ]);

  const playPendingOnField = useCallback(() => {
    if (!canControl || !pendingPlayCardId) {
      return;
    }
    dispatch({
      type: "play_card",
      playerId: controllingPlayerId,
      instanceId: pendingPlayCardId,
    });
    resetSelection();
  }, [canControl, controllingPlayerId, dispatch, pendingPlayCardId, resetSelection]);

  const selectFieldCard = useCallback(
    (instanceId: InstanceId) => {
      if (!canControl) {
        return;
      }

      if (internalMode === "playCard" && pendingPlayCardId) {
        const kind = cardKind(state, catalog, pendingPlayCardId);
        if (kind === "construct" || kind === "installation") {
          playPendingOnField();
        }
        return;
      }

      const activation = legal.activations.find(
        (entry) => entry.instanceId === instanceId,
      );
      if (activation) {
        if (
          selectedActivation?.instanceId === instanceId &&
          selectedActivation.abilityId === activation.abilityId
        ) {
          dispatch({
            type: "activate_ability",
            playerId: controllingPlayerId,
            instanceId: activation.instanceId,
            abilityId: activation.abilityId,
          });
          resetSelection();
          return;
        }
        setSelectedActivation(activation);
        setPendingPlayCardId(null);
        setInternalMode("activate");
        return;
      }

      if (getLegalAttackers(legal).includes(instanceId)) {
        setSelectedAttackerId(instanceId);
        setPendingPlayCardId(null);
        setSelectedActivation(null);
        setInternalMode("declareAttack");
        return;
      }
    },
    [
      canControl,
      catalog,
      controllingPlayerId,
      dispatch,
      internalMode,
      legal,
      pendingPlayCardId,
      playPendingOnField,
      resetSelection,
      selectedActivation,
      state,
    ],
  );

  const confirmActivation = useCallback(() => {
    if (!canControl || !selectedActivation) {
      return;
    }
    dispatch({
      type: "activate_ability",
      playerId: controllingPlayerId,
      instanceId: selectedActivation.instanceId,
      abilityId: selectedActivation.abilityId,
    });
    resetSelection();
  }, [canControl, controllingPlayerId, dispatch, resetSelection, selectedActivation]);

  const selectAttackTarget = useCallback(
    (target: InstanceId | "nexus") => {
      if (!canControl || !selectedAttackerId) {
        return;
      }
      if (!canAttackTarget(selectedAttackerId, target, legal)) {
        return;
      }
      setSelectedTargetId(target);
      dispatch({
        type: "attack",
        playerId: controllingPlayerId,
        attackerId: selectedAttackerId,
        target,
      });
      resetSelection();
    },
    [canControl, controllingPlayerId, dispatch, legal, resetSelection, selectedAttackerId],
  );

  const legalChoiceTargets = useMemo(() => {
    if (!choice || choice.legalTargets === "nexus") {
      return new Set<InstanceId>();
    }
    return new Set(choice.legalTargets);
  }, [choice]);

  const selectPendingTarget = useCallback(
    (targetId: InstanceId) => {
      if (!choice) {
        return;
      }
      if (
        choice.legalTargets !== "nexus" &&
        !choice.legalTargets.includes(targetId)
      ) {
        return;
      }
      setPendingTargets([targetId]);
    },
    [choice],
  );

  const confirmPendingTarget = useCallback((): GameAction | null => {
    if (!choice || pendingTargets.length === 0) {
      return null;
    }
    const action: GameAction = {
      type: "resolve_choice",
      playerId: controllingPlayerId,
      choiceId: choice.id,
      selected: pendingTargets,
    };
    dispatch(action);
    resetSelection();
    return action;
  }, [choice, controllingPlayerId, dispatch, pendingTargets, resetSelection]);

  const handCardDisabledReason = useCallback(
    (instanceId: InstanceId): string | null => {
      if (!canControl) {
        return "Not your turn.";
      }
      if (isPlayable(instanceId, legal)) {
        return null;
      }
      return explainPlayCardError(state, controllingPlayerId, instanceId, {
        catalog,
      });
    },
    [canControl, catalog, controllingPlayerId, legal, state],
  );

  const value = useMemo<InteractionContextValue>(
    () => ({
      mode,
      inspectInstanceId,
      pendingPlayCardId,
      selectedHandCardId: pendingPlayCardId,
      selectedAttackerId,
      selectedTargetId,
      selectedActivation,
      pendingTargets,
      canControl,
      openInspect,
      closeInspect,
      selectHandCard,
      confirmPendingPlay,
      playPendingOnField,
      selectFieldCard,
      confirmActivation,
      selectAttackTarget,
      selectPendingTarget,
      confirmPendingTarget,
      cancelInteraction: resetSelection,
      isHandCardPlayable: (instanceId) => isPlayable(instanceId, legal),
      handCardDisabledReason,
      isPendingConstructPlay: () => {
        if (!pendingPlayCardId) {
          return false;
        }
        const kind = cardKind(state, catalog, pendingPlayCardId);
        return kind === "construct" || kind === "installation";
      },
      isFieldCardActivatable: (instanceId, abilityId) =>
        isActivatable(instanceId, abilityId, legal),
      isAttackerSelected: (instanceId) => selectedAttackerId === instanceId,
      isValidAttackTarget: (target) =>
        selectedAttackerId
          ? canAttackTarget(selectedAttackerId, target, legal)
          : false,
      isPendingTarget: (instanceId) => pendingTargets.includes(instanceId),
      isPendingTargetLegal: (instanceId) => legalChoiceTargets.has(instanceId),
    }),
    [
      canControl,
      catalog,
      closeInspect,
      confirmActivation,
      confirmPendingPlay,
      confirmPendingTarget,
      handCardDisabledReason,
      legal,
      legalChoiceTargets,
      mode,
      openInspect,
      pendingPlayCardId,
      pendingTargets,
      playPendingOnField,
      resetSelection,
      selectAttackTarget,
      selectFieldCard,
      selectHandCard,
      selectPendingTarget,
      selectedActivation,
      selectedAttackerId,
      selectedTargetId,
      state,
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
