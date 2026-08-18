"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseHelixMatchResult } from "@/hooks/use-helix-match";
import { formatGameEvent } from "@/lib/game/event-labels";
import { cn } from "@/lib/utils";

interface GameDebugPanelProps {
  match: UseHelixMatchResult;
}

function trimState(match: UseHelixMatchResult) {
  const { state } = match;
  return {
    pregame: state.pregame,
    phase: state.phase,
    activePlayerId: state.activePlayerId,
    winnerId: state.winnerId,
    pendingChoice: state.pendingChoice,
    engagements: state.engagements,
    players: {
      a: {
        flux: state.players.a.flux,
        nexusIntegrity: state.players.a.nexusIntegrity,
        uplink: state.players.a.uplink,
        field: state.players.a.field,
      },
      b: {
        flux: state.players.b.flux,
        nexusIntegrity: state.players.b.nexusIntegrity,
        uplink: state.players.b.uplink,
        field: state.players.b.field,
      },
    },
  };
}

export function GameDebugPanel({ match }: GameDebugPanelProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((previous) => !previous);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "`") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const trimmed = useMemo(() => trimState(match), [match]);
  const recentEvents = match.events.slice(-10);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          toggle();
        }}
        className="fixed bottom-4 left-4 z-[80] rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-mono text-white/70 backdrop-blur"
      >
        Debug
      </button>
      {open ? (
        <div className="fixed bottom-14 left-4 z-[80] max-h-[70dvh] w-[min(28rem,calc(100vw-2rem))] overflow-auto rounded-2xl border border-white/10 bg-black/85 p-4 text-xs text-white/80 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-semibold text-white">Game Debug</p>
            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                toggle();
              }}
              className="rounded-full px-2 py-1 text-white/60 hover:text-white"
            >
              Close
            </button>
          </div>

          <Section title="Mode">
            {match.mode ?? "none"} · human={match.humanPlayerId} · canControl=
            {String(match.canControl)} · aiThinking={String(match.isAiThinking)}
          </Section>

          <Section title="State">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(trimmed, null, 2)}
            </pre>
          </Section>

          <Section title="Legal Actions">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(match.legal, null, 2)}
            </pre>
          </Section>

          <Section title="Recent Events">
            <ul className="space-y-1">
              {recentEvents.map((event, index) => (
                <li key={`${event.type}-${index}`} className="text-white/70">
                  {formatGameEvent(event, match.catalog, match.state.instances)}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      ) : null}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mb-4 border-b border-white/10 pb-4 last:mb-0 last:border-0")}>
      <p className="mb-2 font-semibold text-cyan-200/90">{title}</p>
      {children}
    </div>
  );
}
