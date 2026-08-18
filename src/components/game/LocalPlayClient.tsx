"use client";

import { useHelixMatch } from "@/hooks/use-helix-match";
import { BattlefieldShell } from "@/components/game/battlefield/BattlefieldShell";
import { MatchSetupOverlay } from "@/components/game/overlay/MatchSetupOverlay";

export function LocalPlayClient() {
  const match = useHelixMatch();

  if (!match.matchStarted) {
    return <MatchSetupOverlay onStart={(mode) => match.startMatch({ mode })} />;
  }

  return <BattlefieldShell match={match} />;
}
