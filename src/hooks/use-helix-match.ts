"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyAction,
  createDefaultMatch,
  getCardCatalog,
  getLegalActions,
  getPregamePlayer,
  getTurnState,
  isTerminal,
  type ApplyResult,
  type GameAction,
  type GameEvent,
  type GameState,
  type PlayerId,
} from "@/engine";
import { runAiTurn } from "@/lib/ai/simple-opponent";
import { groupLegalActions } from "@/lib/game/legal-actions";
import { opponentOf } from "@/lib/game/card-presenter";
import {
  scheduleFloatingEffects,
  type FloatingEffect,
} from "@/hooks/use-animation-queue";
import { prefersReducedMotion } from "@/components/game/animations/motion-presets";

export type MatchMode = "vsAi" | "hotSeat";

export interface MatchOptions {
  mode: MatchMode;
  seed?: number;
  humanPlayerId?: PlayerId;
}

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
  mode: MatchMode | null;
  humanPlayerId: PlayerId;
  controllingPlayerId: PlayerId;
  perspectivePlayerId: PlayerId;
  canControl: boolean;
  isHumanTurn: boolean;
  isAiThinking: boolean;
  pregame: GameState["pregame"];
  matchStarted: boolean;
  startMatch: (options: MatchOptions) => void;
  rematch: (options?: MatchOptions) => void;
  lastError: string | null;
  reportError: (message: string) => void;
}

const AI_TURN_DELAY_MS = 400;

function randomSeed(): number {
  return Math.floor(Math.random() * 100_000);
}

export function useHelixMatch(): UseHelixMatchResult {
  const catalog = useMemo(() => getCardCatalog(), []);
  const [options, setOptions] = useState<MatchOptions | null>(null);
  const [matchStarted, setMatchStarted] = useState(false);
  const [state, setState] = useState<GameState>(() => createDefaultMatch(42));
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [effects, setEffects] = useState<FloatingEffect[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const batchCounterRef = useRef(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const mode = options?.mode ?? null;
  const humanPlayerId = options?.humanPlayerId ?? "a";
  const aiPlayerId: PlayerId = opponentOf(humanPlayerId);

  const commitResult = useCallback((result: ApplyResult) => {
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
  }, []);

  const dispatch = useCallback(
    (action: GameAction): ApplyResult => {
      const result = applyAction(stateRef.current, action, { catalog });
      return commitResult(result);
    },
    [catalog, commitResult],
  );

  const resetMatchState = useCallback((seed: number) => {
    batchCounterRef.current = 0;
    setState(createDefaultMatch(seed));
    setEvents([]);
    setEffects([]);
    setLastError(null);
  }, []);

  const startMatch = useCallback(
    (nextOptions: MatchOptions) => {
      setOptions(nextOptions);
      resetMatchState(nextOptions.seed ?? randomSeed());
      setMatchStarted(true);
    },
    [resetMatchState],
  );

  const rematch = useCallback(
    (nextOptions?: MatchOptions) => {
      const resolved = nextOptions ?? options;
      if (!resolved) {
        return;
      }
      setOptions(resolved);
      resetMatchState(resolved.seed ?? randomSeed());
      setMatchStarted(true);
    },
    [options, resetMatchState],
  );

  useEffect(() => {
    if (!matchStarted || mode !== "vsAi" || isTerminal(state)) {
      return;
    }

    const pregamePlayer = getPregamePlayer(state);
    const aiHasChoice =
      state.pendingChoice?.playerId === aiPlayerId;
    const aiActiveTurn =
      state.pregame === "complete" &&
      state.activePlayerId === aiPlayerId &&
      !state.pendingChoice;
    const aiPregame = pregamePlayer === aiPlayerId;

    if (!aiHasChoice && !aiActiveTurn && !aiPregame) {
      return;
    }

    const timer = window.setTimeout(() => {
      const current = stateRef.current;
      const result = runAiTurn(current, aiPlayerId, catalog);
      commitResult({ state: result.state, events: result.events });
    }, AI_TURN_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [aiPlayerId, catalog, commitResult, matchStarted, mode, state]);

  const activePlayerId = state.activePlayerId;
  const pregame = state.pregame;
  const pregamePlayer = getPregamePlayer(state);

  const perspectivePlayerId: PlayerId =
    mode === "vsAi" ? humanPlayerId : activePlayerId;

  const controllingPlayerId: PlayerId =
    mode === "vsAi"
      ? humanPlayerId
      : pregame !== "complete"
        ? (pregamePlayer ?? activePlayerId)
        : activePlayerId;

  const canControl =
    mode === "vsAi"
      ? state.pendingChoice
        ? state.pendingChoice.playerId === humanPlayerId
        : pregame !== "complete"
          ? pregamePlayer === humanPlayerId
          : state.activePlayerId === humanPlayerId &&
            state.phase === "operations"
      : state.pendingChoice
        ? state.pendingChoice.playerId === controllingPlayerId
        : pregame !== "complete"
          ? pregamePlayer === controllingPlayerId
          : state.activePlayerId === controllingPlayerId &&
            state.phase === "operations";

  const isHumanTurn =
    mode === "vsAi"
      ? pregame !== "complete"
        ? pregamePlayer === humanPlayerId
        : state.activePlayerId === humanPlayerId
      : state.activePlayerId === controllingPlayerId;

  const isAiThinking =
    mode === "vsAi" &&
    matchStarted &&
    !isTerminal(state) &&
    (pregamePlayer === aiPlayerId ||
      state.pendingChoice?.playerId === aiPlayerId ||
      (state.pregame === "complete" &&
        state.activePlayerId === aiPlayerId &&
        !state.pendingChoice));

  const rawLegal = getLegalActions(state, controllingPlayerId, { catalog });
  const legal = groupLegalActions(rawLegal, controllingPlayerId);
  const turn = getTurnState(state);
  const choice =
    state.pendingChoice?.playerId === controllingPlayerId
      ? state.pendingChoice
      : null;

  const reportError = useCallback((message: string) => {
    setLastError(message);
  }, []);

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
    mode,
    humanPlayerId,
    controllingPlayerId,
    perspectivePlayerId,
    canControl,
    isHumanTurn,
    isAiThinking,
    pregame,
    matchStarted,
    startMatch,
    rematch,
    lastError,
    reportError,
  };
}
