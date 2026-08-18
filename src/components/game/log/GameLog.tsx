"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CardCatalog } from "@/engine/catalog/schema";
import type { GameEvent } from "@/engine/types/event";
import { formatGameEvent } from "@/lib/game/event-labels";
import { panelSlideVariants } from "../animations/motion-presets";
import { cn } from "@/lib/utils";

interface GameLogProps {
  events: GameEvent[];
  catalog: CardCatalog;
  instances: Record<string, { defId: string }>;
}

export function GameLog({ events, catalog, instances }: GameLogProps) {
  const [open, setOpen] = useState(true);
  const lines = useMemo(
    () =>
      events
        .slice(-40)
        .map((event, index) => ({
          id: `${index}-${event.type}`,
          text: formatGameEvent(event, catalog, instances),
        }))
        .reverse(),
    [catalog, events, instances],
  );

  return (
    <div className="pointer-events-auto absolute right-3 top-3 z-30 w-[min(20rem,34vw)]">
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
        className="min-h-11 rounded-full border border-white/10 bg-[var(--helix-glass)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur-md"
      >
        Log {open ? "▾" : "▸"}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            variants={panelSlideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-2 max-h-[40vh] overflow-y-auto rounded-2xl border border-white/10 bg-[var(--helix-glass)] p-3 backdrop-blur-md"
          >
            {lines.length === 0 ? (
              <p className="text-sm text-white/40">No events yet.</p>
            ) : (
              <ul className="space-y-2">
                {lines.map((line) => (
                  <li
                    key={line.id}
                    className={cn(
                      "border-b border-white/5 pb-2 text-[0.78rem] leading-snug text-white/72 last:border-b-0 last:pb-0",
                    )}
                  >
                    {line.text}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
