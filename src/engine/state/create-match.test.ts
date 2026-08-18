import { describe, expect, it } from "vitest";
import { buildDefaultDeck } from "../catalog/sets/core-01";
import {
  DEFAULT_STARTING_INTEGRITY,
  DEFAULT_STARTING_UPLINK_SIZE,
  DEFAULT_VAULT_SIZE,
} from "../catalog/schema";
import { validateDeckList } from "../catalog/validate";
import { createDefaultMatch, createMatch } from "./create-match";
import { getCardCatalog } from "../catalog";
import { completePregame } from "../test-helpers/complete-pregame";

describe("createMatch", () => {
  it("creates a match in pregame mulligan by default", () => {
    const state = createDefaultMatch(42, "test-match");

    expect(state.schemaVersion).toBe(1);
    expect(state.matchId).toBe("test-match");
    expect(state.seed).toBe(42);
    expect(state.cycle).toBe(1);
    expect(state.pregame).toBe("mulligan_a");
    expect(state.winnerId).toBeNull();
    expect(state.winReason).toBeNull();
    expect(state.commandIndex).toBe(0);
    expect(state.engagements).toEqual([]);
  });

  it("creates a match in operations after pregame is completed", () => {
    const state = completePregame(createDefaultMatch());

    expect(state.phase).toBe("operations");
    expect(state.activePlayerId).toBe("a");
    expect(state.pregame).toBe("complete");
  });

  it("initializes player a flux after opening turn setup", () => {
    const state = completePregame(createDefaultMatch());

    expect(state.players.a.fluxMax).toBe(1);
    expect(state.players.a.flux).toBe(1);
    expect(state.players.b.fluxMax).toBe(0);
    expect(state.players.b.flux).toBe(0);
    expect(state.players.a.nexusIntegrity).toBe(DEFAULT_STARTING_INTEGRITY);
    expect(state.players.b.nexusIntegrity).toBe(DEFAULT_STARTING_INTEGRITY);
  });

  it("deals opening uplink and first-cycle draw for active player", () => {
    const state = completePregame(createDefaultMatch(99, "deal-test"));

    expect(state.players.a.uplink).toHaveLength(DEFAULT_STARTING_UPLINK_SIZE + 1);
    expect(state.players.b.uplink).toHaveLength(DEFAULT_STARTING_UPLINK_SIZE);
    expect(state.players.a.vault).toHaveLength(
      DEFAULT_VAULT_SIZE - DEFAULT_STARTING_UPLINK_SIZE - 1,
    );
    expect(state.players.b.vault).toHaveLength(
      DEFAULT_VAULT_SIZE - DEFAULT_STARTING_UPLINK_SIZE,
    );

    for (const instanceId of state.players.a.uplink) {
      expect(state.instances[instanceId].zone).toBe("uplink");
      expect(state.instances[instanceId].ownerId).toBe("a");
    }
  });

  it("produces deterministic vault order for the same seed", () => {
    const first = createDefaultMatch(123, "seed-test");
    const second = createDefaultMatch(123, "seed-test");

    expect(first.players.a.vault).toEqual(second.players.a.vault);
    expect(first.players.b.vault).toEqual(second.players.b.vault);
  });

  it("produces different vault order for different seeds", () => {
    const first = createDefaultMatch(123, "seed-test");
    const second = createDefaultMatch(456, "seed-test");

    expect(first.players.a.vault).not.toEqual(second.players.a.vault);
  });

  it("rejects invalid deck sizes", () => {
    const catalog = getCardCatalog();
    const deck = buildDefaultDeck().slice(0, 10);

    expect(validateDeckList(deck, catalog).length).toBeGreaterThan(0);
    expect(() =>
      createMatch({
        matchId: "bad-deck",
        seed: 1,
        decks: { a: deck, b: buildDefaultDeck() },
        skipMulligan: true,
      }),
    ).toThrow(/Invalid deck/);
  });

  it("creates unique instances for each player", () => {
    const state = createDefaultMatch();
    const instanceIds = new Set(Object.keys(state.instances));

    expect(instanceIds.size).toBe(DEFAULT_VAULT_SIZE * 2);
  });
});
