"use client";

import { opponentOf } from "@/lib/game/card-presenter";
import { getPregamePlayer } from "@/engine";
import type { UseHelixMatchResult } from "@/hooks/use-helix-match";
import { InteractionProvider, useInteraction } from "../interaction/InteractionProvider";
import { FieldZone } from "./FieldZone";
import { HandZone } from "./HandZone";
import { NexusPanel } from "./NexusPanel";
import { FluxDisplay } from "./FluxDisplay";
import { TurnIndicator } from "./TurnIndicator";
import { EndCycleButton } from "./EndCycleButton";
import { ZonePile } from "./ZonePile";
import { AttackOverlay } from "./AttackOverlay";
import { GameLog } from "../log/GameLog";
import { CardInspectOverlay } from "../overlay/CardInspectOverlay";
import { TargetingOverlay } from "../overlay/TargetingOverlay";
import { MatchResultOverlay } from "../overlay/MatchResultOverlay";
import { PregameOverlay } from "../overlay/PregameOverlay";
import {
  ActivateConfirmBar,
  PlayConfirmBar,
} from "../overlay/PlayConfirmBar";
import { GameDebugPanel } from "../debug/GameDebugPanel";
import {
  AnimationOverlay,
} from "../animations/AnimationEffects";

function BattlefieldContent({
  match,
}: {
  match: UseHelixMatchResult;
}) {
  const interaction = useInteraction();
  const perspectivePlayerId = match.perspectivePlayerId;
  const opponentId = opponentOf(perspectivePlayerId);
  const perspectivePlayer = match.state.players[perspectivePlayerId];
  const opponent = match.state.players[opponentId];
  const pregamePlayer = getPregamePlayer(match.state);

  return (
    <div className="battlefield-root battlefield-grid-bg relative flex h-dvh flex-col overflow-hidden">
      <GameLog
        events={match.events}
        catalog={match.catalog}
        instances={match.state.instances}
      />

      {match.mode === "vsAi" && match.isAiThinking ? (
        <div className="pointer-events-none absolute right-4 top-4 z-40 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-white/70">
          AI thinking…
        </div>
      ) : null}

      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-4">
        <NexusPanel
          playerId={opponentId}
          integrity={opponent.nexusIntegrity}
          label={match.mode === "vsAi" ? "AI" : "Opponent"}
          side="opponent"
          targetable={
            interaction.mode === "declareAttack" &&
            interaction.isValidAttackTarget("nexus")
          }
          selected={interaction.selectedTargetId === "nexus"}
          onSelect={() => interaction.selectAttackTarget("nexus")}
        />
        <TurnIndicator
          cycle={match.turn.cycle}
          phase={match.turn.phase}
          activePlayerId={match.activePlayerId}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <HandZone
          playerId={opponentId}
          state={match.state}
          catalog={match.catalog}
          faceDown={match.mode === "vsAi"}
        />
        <FieldZone
          playerId={opponentId}
          state={match.state}
          catalog={match.catalog}
          opponentView
        />

        <div className="relative min-h-[5rem] flex-1">
          <AttackOverlay engagements={match.state.engagements} />
          <AnimationOverlay effects={match.effects} />
        </div>

        <FieldZone
          playerId={perspectivePlayerId}
          state={match.state}
          catalog={match.catalog}
          isDeployZone
        />
        <HandZone
          playerId={perspectivePlayerId}
          state={match.state}
          catalog={match.catalog}
        />
      </div>

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-3 px-4 pb-4">
        <NexusPanel
          playerId={perspectivePlayerId}
          integrity={perspectivePlayer.nexusIntegrity}
          label="You"
          side="player"
        />
        <div className="flex flex-wrap items-center gap-3">
          <FluxDisplay
            flux={perspectivePlayer.flux}
            fluxMax={perspectivePlayer.fluxMax}
          />
          <ZonePile
            vaultCount={perspectivePlayer.vault.length}
            scrapCount={perspectivePlayer.scrap.length}
          />
          <EndCycleButton
            disabled={!match.canControl || !match.legal.canEndTurn}
            onEndCycle={() =>
              match.dispatch({
                type: "end_turn",
                playerId: match.controllingPlayerId,
              })
            }
          />
        </div>
      </div>

      {match.lastError ? (
        <div className="pointer-events-none absolute bottom-[calc(var(--card-height)+6rem)] left-1/2 z-40 -translate-x-1/2 rounded-full bg-red-950/80 px-4 py-2 text-sm text-red-100">
          {match.lastError}
        </div>
      ) : null}

      <PregameOverlay
        pregame={match.pregame}
        playerId={pregamePlayer ?? match.controllingPlayerId}
        canControl={match.canControl}
        mulliganUsed={
          pregamePlayer
            ? match.state.mulliganUsed[pregamePlayer]
            : false
        }
        waitingForOpponent={
          match.mode === "vsAi" &&
          match.pregame !== "complete" &&
          !match.canControl
        }
        onKeepHand={() =>
          match.dispatch({
            type: "keep_hand",
            playerId: match.controllingPlayerId,
          })
        }
        onMulligan={() =>
          match.dispatch({
            type: "mulligan",
            playerId: match.controllingPlayerId,
          })
        }
      />

      <PlayConfirmBar />
      <ActivateConfirmBar />

      <TargetingOverlay
        choice={match.choice}
        selectedTargets={interaction.pendingTargets}
        onConfirm={() => interaction.confirmPendingTarget()}
        onCancel={() => interaction.cancelInteraction()}
      />

      <CardInspectOverlay
        instanceId={interaction.inspectInstanceId}
        state={match.state}
        catalog={match.catalog}
        onClose={interaction.closeInspect}
      />

      <MatchResultOverlay
        winnerId={match.state.winnerId}
        winReason={match.state.winReason}
        onRematch={() => match.rematch()}
      />

      <GameDebugPanel match={match} />
    </div>
  );
}

export function BattlefieldShell({ match }: { match: UseHelixMatchResult }) {
  return (
    <InteractionProvider
      controllingPlayerId={match.controllingPlayerId}
      canControl={match.canControl}
      legal={match.legal}
      choice={match.choice}
      state={match.state}
      catalog={match.catalog}
      dispatch={match.dispatch}
      onError={match.reportError}
    >
      <BattlefieldContent match={match} />
    </InteractionProvider>
  );
}
