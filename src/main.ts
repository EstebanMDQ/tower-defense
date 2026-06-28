import Phaser from "phaser";
import { DESIGN_WIDTH, TOTAL_HEIGHT } from "./config/grid";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { HUDScene } from "./scenes/HUDScene";
import { GameOverScene } from "./scenes/GameOverScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0d1b2a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DESIGN_WIDTH,
    height: TOTAL_HEIGHT,
  },
  scene: [BootScene, MenuScene, GameScene, HUDScene, GameOverScene],
};

new Phaser.Game(config);
