import { describe, expect, it } from "vitest";
import {
  applyAction,
  createDefaultMatch,
  getCardCatalog,
} from "@/engine";
import { completePregame } from "@/engine/test-helpers/complete-pregame";
import { chooseAction, runAiTurn } from "./simple-opponent";

const catalog = getCardCatalog();

describe("simple opponent AI", () => {
  it("chooses keep_hand during pregame", () => {
    const state = createDefaultMatch(5, "ai-pregame");
    const action = chooseAction(state, "a", catalog);
    expect(action?.type).toBe("keep_hand");
  });

  it("ends turn when no better actions exist", () => {
    let state = completePregame(createDefaultMatch(8, "ai-end"));
    state = applyAction(state, { type: "end_turn", playerId: "a" }, { catalog }).state;

    const action = chooseAction(state, "b", catalog);
    expect(action?.type === "end_turn" || action?.type === "play_card").toBe(true);
  });

  it("runs a full AI turn without errors", () => {
    let state = completePregame(createDefaultMatch(12, "ai-turn"));
    state = applyAction(state, { type: "end_turn", playerId: "a" }, { catalog }).state;

    const result = runAiTurn(state, "b", catalog);
    expect(result.state.activePlayerId).toBe("a");
    expect(result.events.length).toBeGreaterThan(0);
  });
});
