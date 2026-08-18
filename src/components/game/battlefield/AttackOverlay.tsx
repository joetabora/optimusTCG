"use client";

import type { EngagementAssignment } from "@/engine/types/effect";
import { motion } from "framer-motion";

interface AttackOverlayProps {
  engagements: EngagementAssignment[];
}

export function AttackOverlay({ engagements }: AttackOverlayProps) {
  if (engagements.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {engagements.map((engagement, index) => (
        <motion.div
          key={`${engagement.attackerId}-${String(engagement.target)}-${index}`}
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: 0.85, scaleX: 1 }}
          className="absolute left-1/2 top-1/2 h-0.5 w-40 -translate-x-1/2 -translate-y-1/2 origin-left bg-gradient-to-r from-amber-300 via-red-400 to-transparent shadow-[0_0_16px_rgba(251,191,36,0.45)]"
          style={{
            rotate: index % 2 === 0 ? "-18deg" : "18deg",
          }}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-amber-100/80 backdrop-blur-sm">
        {engagements.length} pending engagement{engagements.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
