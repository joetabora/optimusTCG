"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cardHoverVariants, motionTransitionFast } from "./motion-presets";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  instanceId: string;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  layoutAnimated?: boolean;
}

export function AnimatedCard({
  instanceId,
  interactive = true,
  selected = false,
  disabled = false,
  layoutAnimated = true,
  className,
  children,
  ...props
}: AnimatedCardProps) {
  const visualState = disabled ? "disabled" : selected ? "selected" : "idle";

  return (
    <motion.div
      layout={layoutAnimated}
      layoutId={layoutAnimated ? instanceId : undefined}
      initial={false}
      animate={visualState}
      whileHover={interactive && !disabled && !selected ? "hover" : undefined}
      variants={cardHoverVariants}
      transition={motionTransitionFast}
      className={cn("relative touch-manipulation", className)}
      style={{ transformPerspective: 900 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
