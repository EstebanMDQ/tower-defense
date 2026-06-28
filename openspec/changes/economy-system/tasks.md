## 1. Configuration

- [ ] 1.1 Create `src/config/economy.ts` with starting money (200) and lives (20)

## 2. Economy system

- [ ] 2.1 Create `src/systems/Economy.ts` holding money and lives state
- [ ] 2.2 Implement `canAfford(cost)` and `spend(cost)` (rejects if insufficient,
      never goes negative)
- [ ] 2.3 Implement `earn(amount)` for rewards
- [ ] 2.4 Implement `loseLives(cost)` clamping at zero
- [ ] 2.5 Emit game-over signal when lives reach zero
- [ ] 2.6 Emit `money-changed` and `lives-changed` events

## 3. Integration

- [ ] 3.1 Instantiate Economy in `GameScene` and expose it to other systems

## 4. Verification

- [ ] 4.1 Unit tests: affordable/unaffordable spend, earn, loseLives clamps at 0
- [ ] 4.2 Unit test: game-over signal fires exactly when lives hit zero
