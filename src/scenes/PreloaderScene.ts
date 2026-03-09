import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../config/GameConfig';

/**
 * PreloaderScene
 * 外部アセット読み込み + プログラム生成テクスチャの作成。
 *
 * 【差し替えガイド】
 *   - Player sprite  : this.load.spritesheet('player', 'assets/sprites/player.png', {...})
 *   - Tileset image  : this.load.image('tileset', 'assets/tilemaps/tileset.png')
 *   - Tiled JSON map : this.load.tilemapTiledJSON('map_01', 'assets/tilemaps/map_01.json')
 */
export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  preload(): void {
    this.showProgressBar();
    // 将来の外部アセット読み込み場所
    // this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 16 });
    // this.load.tilemapTiledJSON('map_01', 'assets/tilemaps/map_01.json');
  }

  create(): void {
    this.generatePlayerTexture();
    this.generateTilesetTexture();
    this.generateUITextures();
    this.scene.start('Title');
  }

  // ── プログレスバー ────────────────────────────────────────────
  private showProgressBar(): void {
    const cx = GAME_WIDTH  / 2;
    const cy = GAME_HEIGHT / 2;

    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e, 1);
    box.fillRect(cx - 80, cy - 10, 160, 20);

    const bar = this.add.graphics();
    const label = this.add.text(cx, cy - 26, 'Loading...', {
      fontFamily: 'monospace', fontSize: '9px', color: '#aaddff',
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0x00ccff, 1);
      bar.fillRect(cx - 78, cy - 8, 156 * v, 16);
    });

    this.load.on('complete', () => {
      bar.destroy(); box.destroy(); label.destroy();
    });
  }

  // ── テクスチャ生成 ────────────────────────────────────────────
  /**
   * プレイヤー 16×16 プレースホルダー
   * 将来: this.load.spritesheet('player', ...) に差し替え
   */
  private generatePlayerTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // 体（青）
    g.fillStyle(0x3498db, 1);
    g.fillRect(3, 8, 10, 8);
    // 頭（肌色）
    g.fillStyle(0xfde3a7, 1);
    g.fillRect(4, 1, 8, 7);
    // 目
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(5, 3, 2, 2);
    g.fillRect(9, 3, 2, 2);
    // 髪（茶）
    g.fillStyle(0x8b4513, 1);
    g.fillRect(4, 1, 8, 2);
    g.fillRect(3, 2, 1, 3);
    g.fillRect(12, 2, 1, 3);
    // ハイライト
    g.fillStyle(0xffffff, 0.4);
    g.fillRect(5, 2, 2, 1);

    g.generateTexture('player', 16, 16);
    g.destroy();
  }

  /**
   * タイルセット（3タイル×16px: 0=草床 / 1=石壁 / 2=水）
   * 将来: this.load.image('tileset', 'assets/tilemaps/tileset.png') に差し替え
   */
  private generateTilesetTexture(): void {
    const g  = this.make.graphics({ x: 0, y: 0 }, false);
    const ts = TILE_SIZE;

    /* ── Tile 0: 草床 ── */
    g.fillStyle(0x2d8c52, 1);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0x27ae60, 1);
    g.fillRect(0, 0, 1, ts);
    g.fillRect(0, 0, ts, 1);
    // 細かい草模様
    g.fillStyle(0x58d68d, 0.6);
    g.fillRect(2, 4, 2, 1);
    g.fillRect(9, 7, 1, 2);
    g.fillRect(12, 2, 2, 1);
    g.fillRect(5, 12, 1, 2);

    /* ── Tile 1: 石壁 ── */
    g.fillStyle(0x5d6d7e, 1);
    g.fillRect(ts, 0, ts, ts);
    // レンガ目地
    g.fillStyle(0x4a5568, 1);
    g.fillRect(ts,     7,  ts, 1);
    g.fillRect(ts,     14, ts, 1);
    g.fillRect(ts + 7, 0,  1,  7);
    g.fillRect(ts + 3, 8,  1,  6);
    g.fillRect(ts + 11, 8, 1,  6);
    // ハイライト
    g.fillStyle(0x85929e, 1);
    g.fillRect(ts,     0,  ts, 1);
    g.fillRect(ts,     0,  1,  ts);
    // 影
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(ts + ts - 1, 0, 1, ts);
    g.fillRect(ts, ts - 1, ts, 1);

    /* ── Tile 2: 水 ── */
    g.fillStyle(0x1a6ea8, 1);
    g.fillRect(ts * 2, 0, ts, ts);
    g.fillStyle(0x2980b9, 0.7);
    g.fillRect(ts * 2 + 2,  3, 5, 2);
    g.fillRect(ts * 2 + 9,  8, 4, 2);
    g.fillRect(ts * 2 + 1, 12, 6, 2);
    // 光の反射
    g.fillStyle(0x7fb3d3, 0.5);
    g.fillRect(ts * 2 + 4,  5, 2, 1);
    g.fillRect(ts * 2 + 11, 4, 1, 1);

    g.generateTexture('tileset', ts * 3, ts);
    g.destroy();
  }

  /**
   * UI テクスチャ（ウィンドウ・カーソル）
   * 将来: Nineslice 対応の PNG 画像に差し替え
   */
  private generateUITextures(): void {
    // ウィンドウ背景（半透明青グラデ）
    const wg = this.make.graphics({ x: 0, y: 0 }, false);
    wg.fillStyle(0x0d1b4b, 0.88);
    wg.fillRoundedRect(0, 0, 200, 100, 6);
    wg.lineStyle(2, 0x4488cc, 1);
    wg.strokeRoundedRect(0, 0, 200, 100, 6);
    wg.lineStyle(1, 0x224488, 1);
    wg.strokeRoundedRect(2, 2, 196, 96, 4);
    wg.generateTexture('window_bg', 200, 100);
    wg.destroy();

    // カーソル（黄色三角）
    const cg = this.make.graphics({ x: 0, y: 0 }, false);
    cg.fillStyle(0xffd700, 1);
    cg.fillTriangle(0, 0, 0, 10, 8, 5);
    cg.generateTexture('cursor', 10, 12);
    cg.destroy();
  }
}
