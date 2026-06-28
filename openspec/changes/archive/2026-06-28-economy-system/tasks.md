## 1. Configuration

- [x] 1.1 Create `src/config/economy.ts` with starting money (200) and lives (20)

## 2. Economy system

- [x] 2.1 Create `src/systems/Economy.ts` holding money and lives state
- [x] 2.2 Implement `canAfford(cost)` and `spend(cost)` (rejects if insufficient,
      never goes negative)
- [x] 2.3 Implement `earn(amount)` for rewards
- [x] 2.4 Implement `loseLives(cost)` clamping at zero
- [x] 2.5 Emit game-over signal when lives reach zero
- [x] 2.6 Emit `money-changed` and `lives-changed` events

## 3. Integration

- [x] 3.1 Instantiate Economy in `GameScene` and expose it to other systems

## 4. Verification

- [x] 4.1 Unit tests: affordable/unaffordable spend, earn, loseLives clamps at 0
- [x] 4.2 Unit test: game-over signal fires exactly when lives hit zero
