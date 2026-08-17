import { describe, expect, it } from "vitest";
import { buildDefaultDeck, getCardCatalog } from "../catalog";
import { DEFAULT_STARTING_INTEGRITY, DEFAULT_STARTING_UPLINK_SIZE, DEFAULT_VAULT_SIZE } from "../catalog/schema";
import { validateDeckList } from "../catalog/validate";
import { createDefaultMatch, createMatch } from "./create-match";

describe("createMatch", () => {
  it("creates a match at cycle 1 ignition with player a active", () => {
    const state = createDefaultMatch(42, "test-match");

    expect(state.schemaVersion).toBe(1);
    expect(state.matchId).toBe("test-match");
    expect(state.seed).toBe(42);
    expect(state.cycle).toBe(1);
    expect(state.phase).toBe("ignition");
    expect(state.activePlayerId).toBe("a");
    expect(state.winnerId).toBeNull();
    expect(state.winReason).toBeNull();
    expect(state.commandIndex).toBe(0);
  });

  it("initializes player nexus integrity and flux", () => {
    const state = createDefaultMatch();

    for (const playerId of ["a", "b"] as const) {
      const player = state.players[playerId];
      expect(player.nexusIntegrity).toBe(DEFAULT_STARTING_INTEGRITY);
      expect(player.flux).toBe(0);
      expect(player.fluxMax).toBe(0);
    }
  });

  it("shuffles vaults and deals opening uplink hands", () => {
    const state = createDefaultMatch(99, "deal-test");

    for (const playerId of ["a", "b"] as const) {
      const player = state.players[playerId];
      expect(player.uplink).toHaveLength(DEFAULT_STARTING_UPLINK_SIZE);
      expect(player.vault).toHaveLength(DEFAULT_VAULT_SIZE - DEFAULT_STARTING_UPLINK_SIZE);

      for (const instanceId of player.uplink) {
        expect(state.instances[instanceId].zone).toBe("uplink");
        expect(state.instances[instanceId].ownerId).toBe(playerId);
      }
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
      }),
    ).toThrow(/Invalid deck/);
  });

  it("creates unique instances for each player", () => {
    const state = createDefaultMatch();
    const instanceIds = new Set(Object.keys(state.instances));

    expect(instanceIds.size).toBe(DEFAULT_VAULT_SIZE * 2);
  });
});
