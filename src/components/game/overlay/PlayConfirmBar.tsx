"use client";

import { useInteraction } from "../interaction/InteractionProvider";
import { cn } from "@/lib/utils";

export function PlayConfirmBar() {
  const interaction = useInteraction();

  if (interaction.mode !== "playCard" || !interaction.pendingPlayCardId) {
    return null;
  }

  if (interaction.isPendingConstructPlay()) {
    return (
      <div className="pointer-events-auto absolute inset-x-0 bottom-[calc(var(--card-height)+5rem)] z-30 flex justify-center px-4">
        <div className="flex min-h-11 max-w-lg flex-wrap items-center gap-3 rounded-2xl border border-cyan-300/30 bg-[var(--helix-glass)] px-4 py-3 backdrop-blur-md">
          <p className="text-sm text-cyan-50/90">
            Deploy to your field or drag the card onto the field zone.
          </p>
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              interaction.playPendingOnField();
            }}
            className="min-h-11 rounded-full bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-50 ring-1 ring-cyan-300/40"
          >
            Deploy
          </button>
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              interaction.cancelInteraction();
            }}
            className="min-h-11 rounded-full px-4 py-2 text-sm text-white/70"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-[calc(var(--card-height)+5rem)] z-30 flex justify-center px-4">
      <div className="flex min-h-11 max-w-lg flex-wrap items-center gap-3 rounded-2xl border border-cyan-300/30 bg-[var(--helix-glass)] px-4 py-3 backdrop-blur-md">
        <p className="text-sm text-cyan-50/90">
          Confirm play or click the card again.
        </p>
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            interaction.confirmPendingPlay();
          }}
          className="min-h-11 rounded-full bg-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-50 ring-1 ring-cyan-300/40"
        >
          Play
        </button>
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            interaction.cancelInteraction();
          }}
          className={cn("min-h-11 rounded-full px-4 py-2 text-sm text-white/70")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ActivateConfirmBar() {
  const interaction = useInteraction();

  if (interaction.mode !== "activate" || !interaction.selectedActivation) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-[calc(var(--card-height)+5rem)] z-30 flex justify-center px-4">
      <div className="flex min-h-11 max-w-lg flex-wrap items-center gap-3 rounded-2xl border border-violet-300/30 bg-[var(--helix-glass)] px-4 py-3 backdrop-blur-md">
        <p className="text-sm text-violet-50/90">Confirm ability activation.</p>
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            interaction.confirmActivation();
          }}
          className="min-h-11 rounded-full bg-violet-400/20 px-4 py-2 text-sm font-semibold text-violet-50 ring-1 ring-violet-300/40"
        >
          Activate
        </button>
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            interaction.cancelInteraction();
          }}
          className="min-h-11 rounded-full px-4 py-2 text-sm text-white/70"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
