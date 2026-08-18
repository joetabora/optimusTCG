"use client";

import { motion } from "framer-motion";
import { abilityPulseVariants } from "./motion-presets";

export function AbilityPulse({ active }: { active: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-xl"
      animate={active ? "pulse" : "idle"}
      variants={abilityPulseVariants}
    />
  );
}
