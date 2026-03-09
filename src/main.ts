import Phaser from 'phaser';
import { BootScene }      from './scenes/BootScene';
import { PreloaderScene } from './scenes/PreloaderScene';
import { TitleScene }     from './scenes/TitleScene';
import { WorldScene }     from './scenes/WorldScene';
import { GAME_WIDTH, GAME_HEIGHT, SCALE } from './config/GameConfig';

const config: Phaser.Types.Core.GameConfig = {
  type:            Phaser.AUTO,
  width:           GAME_WIDTH,
  height:          GAME_HEIGHT,
  zoom:            SCALE,
  backgroundColor: '#000000',

  // PixelPerfect: Nearest Neighbor スケーリング
  pixelArt:    true,
  antialias:   false,
  antialiasGL: false,

  physics: {
    default: 'arcade',
    arcade:  {
      gravity: { x: 0, y: 0 },
      debug:   false,
    },
  },

  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [BootScene, PreloaderScene, TitleScene, WorldScene],
};

new Phaser.Game(config);
