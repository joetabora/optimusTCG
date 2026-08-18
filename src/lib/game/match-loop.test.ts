import { describe, expect, it } from "vitest";
import {
  applyAction,
  createDefaultMatch,
  getCardCatalog,
  isTerminal,
} from "@/engine";
import { completePregame } from "@/engine/test-helpers/complete-pregame";
import { runAiTurn } from "@/lib/ai/simple-opponent";

const catalog = getCardCatalog();

describe("match loop integration", () => {
  it("starts a game and completes pregame", () => {
    const state = completePregame(createDefaultMatch(21, "loop"));
    expect(state.pregame).toBe("complete");
    expect(state.phase).toBe("operations");
  });

  it("plays a card when flux is sufficient", () => {
    const state = completePregame(createDefaultMatch(22, "play"));
    const playable = state.players.a.uplink.find((instanceId) => {
      const def = catalog.get(state.instances[instanceId].defId);
      return def && def.fluxCost <= state.players.a.flux;
    });
    expect(playable).toBeDefined();
    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: playable! },
      { catalog },
    );
    expect(result.error).toBeUndefined();
  });

  it("rejects play with insufficient flux", () => {
    const state = completePregame(createDefaultMatch(23, "flux"));
    state.players.a.flux = 0;
    const expensive = state.players.a.uplink.find(
      (id) => catalog.get(state.instances[id].defId)?.fluxCost === 5,
    );
    if (!expensive) {
      return;
    }
    const result = applyAction(
      state,
      { type: "play_card", playerId: "a", instanceId: expensive },
      { catalog },
    );
    expect(result.error).toBe("Insufficient Flux.");
  });

  it("runs human and AI turns", () => {
    let state = completePregame(createDefaultMatch(24, "turns"));
    state = applyAction(state, { type: "end_turn", playerId: "a" }, { catalog }).state;
    const ai = runAiTurn(state, "b", catalog);
    expect(ai.state.activePlayerId).toBe("a");
  });

  it("supports concede victory", () => {
    const state = completePregame(createDefaultMatch(25, "win"));
    const result = applyAction(state, { type: "concede", playerId: "b" }, { catalog });
    expect(result.state.winnerId).toBe("a");
    expect(isTerminal(result.state)).toBe(true);
  });
});
