"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CardCatalog } from "@/engine/catalog/schema";
import type { InstanceId } from "@/engine/types/ids";
import type { GameState } from "@/engine/types/state";
import { resolveCardDisplay } from "@/lib/game/card-presenter";
import { GameCard } from "../card/GameCard";
import { overlayFadeVariants } from "../animations/motion-presets";

interface CardInspectOverlayProps {
  instanceId: InstanceId | null;
  state: GameState;
  catalog: CardCatalog;
  onClose: () => void;
}

export function CardInspectOverlay({
  instanceId,
  state,
  catalog,
  onClose,
}: CardInspectOverlayProps) {
  const card = instanceId
    ? resolveCardDisplay(catalog, state.instances, instanceId)
    : null;

  return (
    <AnimatePresence>
      {card ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          variants={overlayFadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onPointerDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="pointer-events-auto max-w-md rounded-3xl border border-white/10 bg-[var(--helix-surface-elevated)] p-5 shadow-2xl"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <GameCard card={card} orientation="inspect" interactive={false} />
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <p>{card.description}</p>
              <p className="text-white/60">{card.rulesText}</p>
              {card.flavorText ? (
                <p className="italic text-white/45">{card.flavorText}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="mt-4 min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85"
              onPointerDown={(event) => {
                event.preventDefault();
                onClose();
              }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
