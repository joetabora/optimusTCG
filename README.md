# HELIX (optimusTCG)

Original web-first competitive trading card game built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS, shadcn/ui
- **Engine:** Pure TypeScript in `src/engine` (no React imports)
- **Persistence (later):** Supabase Auth + PostgreSQL

## Project structure

```
src/
  app/           # Routes only
  components/    # UI (game board is presentational)
  engine/        # Rules, state, catalog — pure TS
  lib/           # Adapters (local session, Supabase)
```

## Engine public API

```ts
createMatch(config)
createDefaultMatch(seed?, matchId?)
applyCommand(state, command)      // Phase 3
getLegalCommands(state, playerId) // Phase 3
isTerminal(state)
```

## Scripts

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run test     # Vitest (engine unit tests)
npm run lint     # ESLint
```

## Implementation phases

1. Scaffold (done)
2. Engine types + `createMatch` (done)
3. Command loop without effects
4. Local sandbox UI
5. Effect interpreter
6. Engagement resolution
7. Auth + profiles
8. Deck persistence
9. Match replay
10. Authoritative multiplayer

## Game identity (HELIX)

| Role | Term |
|------|------|
| Life | Nexus Integrity |
| Resource | Flux |
| Creature | Construct |
| Spell | Schematic |
| Permanent | Installation |
| Deck | Vault |
| Hand | Uplink |
| Board | Field |
| Turn | Cycle |

Win by reducing the opponent's Nexus Integrity to 0 or on concede.
