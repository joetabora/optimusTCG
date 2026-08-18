"use client";

import { cn } from "@/lib/utils";

interface EndCycleButtonProps {
  disabled?: boolean;
  onEndCycle: () => void;
}

export function EndCycleButton({ disabled = false, onEndCycle }: EndCycleButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={(event) => {
        event.preventDefault();
        if (!disabled) {
          onEndCycle();
        }
      }}
      className={cn(
        "min-h-11 min-w-[8.5rem] rounded-full border px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] transition",
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
          : "border-cyan-300/40 bg-[linear-gradient(180deg,rgba(34,211,238,0.25),rgba(8,145,178,0.15))] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.18)] hover:brightness-110",
      )}
    >
      End Cycle
    </button>
  );
}
