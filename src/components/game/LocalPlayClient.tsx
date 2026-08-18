"use client";

import { useHelixMatch } from "@/hooks/use-helix-match";
import { BattlefieldShell } from "@/components/game/battlefield/BattlefieldShell";

export function LocalPlayClient() {
  const match = useHelixMatch();

  return <BattlefieldShell match={match} />;
}
