import {
  buildScenarioDeck,
  scenarioBasicCatalog,
} from "../catalog/sets/scenario-basic";
import { createMatch } from "../state/create-match";
import type { GameState } from "../types/state";

export function createScenarioMatch(seed = 7, matchId = "scenario-1"): GameState {
  const deck = buildScenarioDeck();

  return createMatch({
    matchId,
    seed,
    catalog: scenarioBasicCatalog,
    deckSize: deck.length,
    decks: {
      a: [...deck],
      b: [...deck],
    },
    skipShuffle: true,
    skipMulligan: true,
  });
}

export { scenarioBasicCatalog, buildScenarioDeck };
