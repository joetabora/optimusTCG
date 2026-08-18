"use client";

import { motion } from "framer-motion";
import { damageFlashVariants } from "./motion-presets";

export function DamageFlash({ active }: { active: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-xl"
      animate={active ? "flash" : "idle"}
      variants={damageFlashVariants}
      style={{ background: "rgba(239, 68, 68, 0.18)" }}
    />
  );
}
