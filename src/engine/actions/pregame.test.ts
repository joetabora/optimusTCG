import { describe, expect, it } from "vitest";
import { applyAction } from "./apply";
import { mulliganHand } from "./pregame";
import { getCardCatalog } from "../catalog";
import { createDefaultMatch, createMatch } from "../state/create-match";
import { buildDefaultDeck } from "../catalog/sets/core-01";
import {
  DEFAULT_STARTING_UPLINK_SIZE,
} from "../catalog/schema";

const catalog = getCardCatalog();

function completePregame(state: ReturnType<typeof createDefaultMatch>) {
  let current = state;
  let result = applyAction(current, { type: "keep_hand", playerId: "a" }, { catalog });
  expect(result.error).toBeUndefined();
  current = result.state;
  result = applyAction(current, { type: "keep_hand", playerId: "b" }, { catalog });
  expect(result.error).toBeUndefined();
  return result.state;
}

describe("pregame mulligan", () => {
  it("starts in mulligan_a before opening turn", () => {
    const state = createDefaultMatch(42, "pregame-test");

    expect(state.pregame).toBe("mulligan_a");
    expect(state.phase).toBe("ignition");
    expect(state.players.a.uplink).toHaveLength(DEFAULT_STARTING_UPLINK_SIZE);
  });

  it("advances from a to b to complete with keep_hand", () => {
    let state = createDefaultMatch(42, "pregame-keep");
    state = applyAction(state, { type: "keep_hand", playerId: "a" }, { catalog }).state;
    expect(state.pregame).toBe("mulligan_b");

    state = applyAction(state, { type: "keep_hand", playerId: "b" }, { catalog }).state;
    expect(state.pregame).toBe("complete");
    expect(state.phase).toBe("operations");
    expect(state.players.a.flux).toBe(1);
  });

  it("mulligan redraws hand once per player", () => {
    let state = createDefaultMatch(99, "pregame-mulligan");
    const handBefore = [...state.players.a.uplink];

    const mulligan = mulliganHand(state, "a", catalog);
    expect("error" in mulligan).toBe(false);
    if ("error" in mulligan) {
      return;
    }

    expect(mulligan.events.some((event) => event.type === "hand_mulliganed")).toBe(true);
    expect(mulligan.state.mulliganUsed.a).toBe(true);
    expect(mulligan.state.pregame).toBe("mulligan_b");
    expect(mulligan.state.players.a.uplink).toHaveLength(DEFAULT_STARTING_UPLINK_SIZE);

    expect(mulligan.state.mulliganUsed.a).toBe(true);

    const repeatOnA = applyAction(
      mulligan.state,
      { type: "mulligan", playerId: "a" },
      { catalog },
    );
    expect(repeatOnA.error).toBe("Not your mulligan step.");

    state = applyAction(mulligan.state, { type: "keep_hand", playerId: "b" }, { catalog }).state;
    expect(state.pregame).toBe("complete");
    expect(state.phase).toBe("operations");

    void handBefore;
  });

  it("skipMulligan jumps straight to operations", () => {
    const state = createMatch({
      matchId: "skip",
      seed: 1,
      decks: { a: buildDefaultDeck(), b: buildDefaultDeck() },
      skipMulligan: true,
      skipShuffle: true,
    });

    expect(state.pregame).toBe("complete");
    expect(state.phase).toBe("operations");
    expect(state.players.a.uplink).toHaveLength(DEFAULT_STARTING_UPLINK_SIZE + 1);
  });
});

export { completePregame };
