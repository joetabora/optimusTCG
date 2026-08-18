"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  applyAction,
  createDefaultMatch,
  getCardCatalog,
  getLegalActions,
  getTurnState,
  isTerminal,
  type ApplyResult,
  type GameAction,
  type GameEvent,
  type GameState,
  type PlayerId,
} from "@/engine";
import { groupLegalActions } from "@/lib/game/legal-actions";
import {
  scheduleFloatingEffects,
  type FloatingEffect,
} from "@/hooks/use-animation-queue";
import { prefersReducedMotion } from "@/components/game/animations/motion-presets";

export interface UseHelixMatchResult {
  state: GameState;
  events: GameEvent[];
  effects: FloatingEffect[];
  dispatch: (action: GameAction) => ApplyResult;
  legal: ReturnType<typeof groupLegalActions>;
  turn: ReturnType<typeof getTurnState>;
  choice: GameState["pendingChoice"];
  terminal: boolean;
  catalog: ReturnType<typeof getCardCatalog>;
  activePlayerId: PlayerId;
  rematch: (seed?: number) => void;
  lastError: string | null;
}

export function useHelixMatch(initialSeed = 42): UseHelixMatchResult {
  const catalog = useMemo(() => getCardCatalog(), []);
  const [state, setState] = useState<GameState>(() => createDefaultMatch(initialSeed));
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [effects, setEffects] = useState<FloatingEffect[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const batchCounterRef = useRef(0);

  const dispatch = useCallback(
    (action: GameAction): ApplyResult => {
      const result = applyAction(state, action, { catalog });
      if (result.error) {
        setLastError(result.error);
        return result;
      }
      setLastError(null);
      setState(result.state);
      if (result.events.length > 0) {
        setEvents((previous) => [...previous, ...result.events]);
        if (!prefersReducedMotion()) {
          batchCounterRef.current += 1;
          scheduleFloatingEffects(
            result.events,
            setEffects,
            batchCounterRef.current,
          );
        }
      }
      return result;
    },
    [catalog, state],
  );

  const rematch = useCallback((seed = Math.floor(Math.random() * 100_000)) => {
    batchCounterRef.current = 0;
    setState(createDefaultMatch(seed));
    setEvents([]);
    setEffects([]);
    setLastError(null);
  }, []);

  const activePlayerId = state.activePlayerId;
  const rawLegal = getLegalActions(state, activePlayerId, { catalog });
  const legal = groupLegalActions(rawLegal, activePlayerId);
  const turn = getTurnState(state);
  const choice =
    state.pendingChoice?.playerId === activePlayerId
      ? state.pendingChoice
      : null;

  return {
    state,
    events,
    effects,
    dispatch,
    legal,
    turn,
    choice,
    terminal: isTerminal(state),
    catalog,
    activePlayerId,
    rematch,
    lastError,
  };
}
