"use client";

import type { PendingChoice } from "@/engine/types/state";
import type { InstanceId } from "@/engine/types/ids";
import { cn } from "@/lib/utils";

interface TargetingOverlayProps {
  choice: PendingChoice | null;
  selectedTargets: InstanceId[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function TargetingOverlay({
  choice,
  selectedTargets,
  onConfirm,
  onCancel,
}: TargetingOverlayProps) {
  if (!choice) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-[calc(var(--card-height)+5rem)] z-30 flex justify-center px-4">
      <div className="flex min-h-11 max-w-lg flex-wrap items-center gap-3 rounded-2xl border border-amber-300/30 bg-[var(--helix-glass)] px-4 py-3 backdrop-blur-md">
        <p className="text-sm text-amber-50/90">
          Choose target for played effect. This cannot be cancelled.
        </p>
        <button
          type="button"
          disabled={selectedTargets.length === 0}
          onPointerDown={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          className={cn(
            "min-h-11 rounded-full px-4 py-2 text-sm font-semibold",
            selectedTargets.length > 0
              ? "bg-amber-400/20 text-amber-50 ring-1 ring-amber-300/40"
              : "cursor-not-allowed bg-white/5 text-white/35",
          )}
        >
          Confirm
        </button>
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            onCancel();
          }}
          className="min-h-11 rounded-full px-4 py-2 text-sm text-white/70"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
