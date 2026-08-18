"use client";

import { CardFrame } from "./CardFrame";
import { AnimatedCard } from "../animations/AnimatedCard";
import type { CardDisplayModel } from "@/lib/game/card-presenter";
import { cn } from "@/lib/utils";

interface GameCardProps {
  card: CardDisplayModel;
  orientation?: "hand" | "field" | "inspect";
  faceDown?: boolean;
  selected?: boolean;
  targetable?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  draggable?: boolean;
  onSelect?: () => void;
  onInspect?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function GameCard({
  card,
  orientation = "field",
  faceDown = false,
  selected = false,
  targetable = false,
  interactive = true,
  disabled = false,
  draggable = false,
  onSelect,
  onInspect,
  className,
  style,
}: GameCardProps) {
  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.detail === 2) {
      onInspect?.();
      return;
    }
    if (!interactive || disabled) {
      return;
    }
    event.preventDefault();
    onSelect?.();
  };

  const content = (
    <CardFrame
      card={card}
      faceDown={faceDown}
      orientation={orientation}
      exhausted={card.exhausted}
      selected={selected}
      targetable={targetable}
    />
  );

  if (orientation === "inspect") {
    return <div className={className}>{content}</div>;
  }

  return (
    <AnimatedCard
      instanceId={card.instanceId}
      interactive={interactive && !faceDown}
      selected={selected}
      disabled={disabled}
      draggable={draggable}
      drag={draggable}
      dragSnapToOrigin
      dragElastic={0.12}
      whileDrag={{ scale: 1.04, zIndex: 50 }}
      className={cn("cursor-pointer select-none", className)}
      style={style}
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={interactive ? 0 : -1}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
    >
      {content}
    </AnimatedCard>
  );
}
