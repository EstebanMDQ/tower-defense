## Context

The GDD defines starting money 200, starting lives 20, per-enemy rewards and
lives costs, and game over at zero lives. This change implements the resource
state only; the values it acts on (specific rewards, costs) are owned by the
enemy and tower changes and passed in.

## Goals / Non-Goals

**Goals:**
- One authoritative source of money and lives.
- Affordability checks so towers cannot be bought without funds.
- Event-based updates so the HUD stays in sync without polling.

**Non-Goals:**
- Defining tower costs / enemy rewards (those live in their own config).
- Selling/refunds (out of scope for v1).
- Persistence across sessions.

## Decisions

- **Single Economy system instance** owned by `GameScene`, passed to systems that
  need it (dependency injection rather than a global singleton) for testability.
- **Affordability is enforced at spend time:** `canAfford(cost)` and a `spend(cost)`
  that fails (returns false / no-op) if funds are insufficient, so callers never
  drive money negative.
- **Lives loss takes a cost parameter** (enemies have different lives costs, e.g.
  Tank = 3). Economy does not know enemy types; the caller passes the cost.
- **Game over is a signal, not a scene switch:** Economy emits a "depleted" event
  when lives reach zero; the game-states change decides what to do with it. Keeps
  Economy UI-agnostic.
- **Change events:** Economy emits `money-changed` and `lives-changed` events for
  the HUD to subscribe to.

## Risks / Trade-offs

- Event-based UI adds a small amount of wiring vs direct polling, but decouples
  the HUD from the economy internals - worth it.
- Passing lives-cost from the caller means the contract must be clear; documented
  in the enemies change.
