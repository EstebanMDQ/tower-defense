import Phaser from "phaser";
import { DESIGN_WIDTH, DESIGN_HEIGHT, HUD_HEIGHT } from "../config/grid";
import { TOWERS, TOWER_TYPES, type TowerType } from "../config/towers";
import type { GameScene } from "./GameScene";

/** A simple rectangular button with an enabled/highlight state. */
class Button {
  private rect: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private handler: () => void;
  private enabled = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    handler: () => void,
  ) {
    this.handler = handler;
    this.rect = scene.add
      .rectangle(x, y, w, h, 0x1b2a3a)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x33506b)
      .setInteractive({ useHandCursor: true });
    this.label = scene.add
      .text(x + w / 2, y + h / 2, text, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
    this.rect.on("pointerdown", () => {
      if (this.enabled) this.handler();
    });
  }

  setText(text: string): void {
    this.label.setText(text);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.label.setAlpha(enabled ? 1 : 0.4);
    this.rect.setFillStyle(enabled ? 0x1b2a3a : 0x141d27);
  }

  setHighlight(on: boolean): void {
    this.rect.setStrokeStyle(on ? 2 : 1, on ? 0xffd166 : 0x33506b);
  }

  setVisible(visible: boolean): void {
    this.rect.setVisible(visible);
    this.label.setVisible(visible);
    if (this.rect.input) this.rect.input.enabled = visible;
  }
}

/**
 * Overlay UI in the bottom bar: money / lives / wave display (event-driven), a
 * tower build palette, a start-wave control, an upgrade panel for the selected
 * tower, and pause / speed controls. Reads and drives the GameScene.
 */
export class HUDScene extends Phaser.Scene {
  private gameScene!: GameScene;

  private moneyText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;

  private paletteButtons: { type: TowerType; button: Button }[] = [];
  private startButton!: Button;
  private upgradeButton!: Button;
  private sellButton!: Button;
  private pauseButton!: Button;
  private speedButton!: Button;

  constructor() {
    super("HUD");
  }

  create(): void {
    this.gameScene = this.scene.get("Game") as GameScene;
    const top = DESIGN_HEIGHT;

    this.add
      .rectangle(0, top, DESIGN_WIDTH, HUD_HEIGHT, 0x0a121b)
      .setOrigin(0, 0);

    const labelStyle = {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#ffffff",
    };
    this.moneyText = this.add.text(8, top + 8, "", {
      ...labelStyle,
      color: "#ffd166",
    });
    this.livesText = this.add.text(120, top + 8, "", {
      ...labelStyle,
      color: "#ef476f",
    });
    this.waveText = this.add.text(224, top + 8, "", labelStyle);

    // Pause / speed controls.
    this.pauseButton = new Button(this, 318, top + 4, 52, 24, "Pause", () => {
      this.gameScene.paused = !this.gameScene.paused;
    });
    this.speedButton = new Button(this, 376, top + 4, 48, 24, "1x", () => {
      this.gameScene.speedFactor = this.gameScene.speedFactor === 1 ? 2 : 1;
    });

    // Tower palette.
    const paletteY = top + 38;
    const bw = 138;
    const positions = [8, 150, 292];
    TOWER_TYPES.forEach((type, i) => {
      const spec = TOWERS[type];
      const button = new Button(
        this,
        positions[i],
        paletteY,
        bw,
        42,
        `${spec.name}\n$${spec.cost}`,
        () => {
          this.gameScene.selectedTowerType = type;
          this.gameScene.selectedTower = null;
        },
      );
      this.paletteButtons.push({ type, button });
    });

    // Contextual bottom row: a wave countdown, or the upgrade/sell pair.
    const bottomY = top + 88;
    this.startButton = new Button(
      this,
      8,
      bottomY,
      DESIGN_WIDTH - 16,
      40,
      "",
      () => this.gameScene.waveManager.startWave(),
    );
    this.upgradeButton = new Button(this, 8, bottomY, 202, 40, "Upgrade", () => {
      if (this.gameScene.selectedTower) {
        this.gameScene.towerManager.upgrade(this.gameScene.selectedTower);
      }
    });
    this.sellButton = new Button(this, 222, bottomY, 202, 40, "Sell", () => {
      if (this.gameScene.selectedTower) {
        this.gameScene.towerManager.sell(this.gameScene.selectedTower);
        this.gameScene.selectedTower = null;
      }
    });

    this.subscribe();
  }

  /** Event-driven money / lives / wave labels. */
  private subscribe(): void {
    const { economy, waveManager } = this.gameScene;
    this.moneyText.setText(`$${economy.getMoney()}`);
    this.livesText.setText(`HP ${economy.getLives()}`);
    this.waveText.setText(`Wave ${waveManager.getWave()}`);

    economy.onMoneyChanged((m) => this.moneyText.setText(`$${m}`));
    economy.onLivesChanged((l) => this.livesText.setText(`HP ${l}`));
    waveManager.onWaveChanged((w) => this.waveText.setText(`Wave ${w}`));
  }

  update(): void {
    const game = this.gameScene;

    // Palette: highlight selected, disable unaffordable.
    for (const { type, button } of this.paletteButtons) {
      button.setEnabled(game.economy.canAfford(TOWERS[type].cost));
      button.setHighlight(game.selectedTowerType === type);
    }

    // Contextual bottom row.
    const tower = game.selectedTower;
    if (tower) {
      this.startButton.setVisible(false);
      this.upgradeButton.setVisible(true);
      this.sellButton.setVisible(true);
      if (tower.canUpgrade()) {
        const cost = tower.upgradeCost();
        this.upgradeButton.setText(`Lv${tower.level} -> Upgrade $${cost}`);
        this.upgradeButton.setEnabled(game.economy.canAfford(cost));
      } else {
        this.upgradeButton.setText(`Lv${tower.level} (MAX)`);
        this.upgradeButton.setEnabled(false);
      }
      this.sellButton.setText(`Sell +$${tower.sellValue()}`);
      this.sellButton.setEnabled(true);
    } else if (game.waveManager.getPhase() === "build") {
      this.upgradeButton.setVisible(false);
      this.sellButton.setVisible(false);
      this.startButton.setVisible(true);
      const secs = Math.ceil(game.waveManager.getPrepRemaining());
      this.startButton.setText(`Next wave in ${secs}s  -  tap to start`);
    } else {
      this.startButton.setVisible(false);
      this.upgradeButton.setVisible(false);
      this.sellButton.setVisible(false);
    }

    this.pauseButton.setText(game.paused ? "Resume" : "Pause");
    this.speedButton.setText(`${game.speedFactor}x`);
  }
}
