"use client";

import { opponentOf } from "@/lib/game/card-presenter";
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
import {
  AnimationOverlay,
} from "../animations/AnimationEffects";

function BattlefieldContent({
  match,
}: {
  match: UseHelixMatchResult;
}) {
  const interaction = useInteraction();
  const activePlayerId = match.activePlayerId;
  const opponentId = opponentOf(activePlayerId);
  const activePlayer = match.state.players[activePlayerId];
  const opponent = match.state.players[opponentId];

  return (
    <div className="battlefield-root battlefield-grid-bg relative flex h-dvh flex-col overflow-hidden">
      <GameLog
        events={match.events}
        catalog={match.catalog}
        instances={match.state.instances}
      />

      <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-4">
        <NexusPanel
          playerId={opponentId}
          integrity={opponent.nexusIntegrity}
          label="Opponent"
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
          activePlayerId={activePlayerId}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <HandZone
          playerId={opponentId}
          state={match.state}
          catalog={match.catalog}
          faceDown
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
          playerId={activePlayerId}
          state={match.state}
          catalog={match.catalog}
        />
        <HandZone
          playerId={activePlayerId}
          state={match.state}
          catalog={match.catalog}
        />
      </div>

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-3 px-4 pb-4">
        <NexusPanel
          playerId={activePlayerId}
          integrity={activePlayer.nexusIntegrity}
          label="You"
          side="player"
        />
        <div className="flex flex-wrap items-center gap-3">
          <FluxDisplay flux={activePlayer.flux} fluxMax={activePlayer.fluxMax} />
          <ZonePile
            vaultCount={activePlayer.vault.length}
            scrapCount={activePlayer.scrap.length}
          />
          <EndCycleButton
            disabled={!match.legal.canEndTurn}
            onEndCycle={() =>
              match.dispatch({ type: "end_turn", playerId: activePlayerId })
            }
          />
        </div>
      </div>

      {match.lastError ? (
        <div className="pointer-events-none absolute bottom-[calc(var(--card-height)+6rem)] left-1/2 z-40 -translate-x-1/2 rounded-full bg-red-950/80 px-4 py-2 text-sm text-red-100">
          {match.lastError}
        </div>
      ) : null}

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
    </div>
  );
}

export function BattlefieldShell({ match }: { match: UseHelixMatchResult }) {
  return (
    <InteractionProvider
      activePlayerId={match.activePlayerId}
      legal={match.legal}
      choice={match.choice}
      dispatch={match.dispatch}
    >
      <BattlefieldContent match={match} />
    </InteractionProvider>
  );
}
