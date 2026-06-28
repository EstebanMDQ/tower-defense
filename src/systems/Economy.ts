import { ECONOMY } from "../config/economy";

type Listener<T> = (payload: T) => void;

/**
 * Authoritative money and lives state for a run. Framework-agnostic (no Phaser
 * dependency) so it is unit-testable in isolation. Other systems spend, earn, and
 * lose against it; the HUD subscribes to its change events.
 */
export class Economy {
  private money: number;
  private lives: number;
  private over = false;

  private moneyListeners: Listener<number>[] = [];
  private livesListeners: Listener<number>[] = [];
  private gameOverListeners: Listener<void>[] = [];

  constructor(
    startingMoney: number = ECONOMY.startingMoney,
    startingLives: number = ECONOMY.startingLives,
  ) {
    this.money = startingMoney;
    this.lives = startingLives;
  }

  getMoney(): number {
    return this.money;
  }

  getLives(): number {
    return this.lives;
  }

  isGameOver(): boolean {
    return this.over;
  }

  canAfford(cost: number): boolean {
    return this.money >= cost;
  }

  /** Spend money; returns false (no-op) if the cost is negative or unaffordable. */
  spend(cost: number): boolean {
    if (cost < 0 || !this.canAfford(cost)) return false;
    this.money -= cost;
    this.emitMoney();
    return true;
  }

  /** Grant a money reward (positive amounts only). */
  earn(amount: number): void {
    if (amount <= 0) return;
    this.money += amount;
    this.emitMoney();
  }

  /** Apply a lives cost, clamping at zero and signaling game over when depleted. */
  loseLives(cost: number): void {
    if (cost <= 0 || this.over) return;
    this.lives = Math.max(0, this.lives - cost);
    this.emitLives();
    if (this.lives === 0) {
      this.over = true;
      this.gameOverListeners.forEach((l) => l());
    }
  }

  onMoneyChanged(listener: Listener<number>): void {
    this.moneyListeners.push(listener);
  }

  onLivesChanged(listener: Listener<number>): void {
    this.livesListeners.push(listener);
  }

  onGameOver(listener: Listener<void>): void {
    this.gameOverListeners.push(listener);
  }

  private emitMoney(): void {
    this.moneyListeners.forEach((l) => l(this.money));
  }

  private emitLives(): void {
    this.livesListeners.forEach((l) => l(this.lives));
  }
}
