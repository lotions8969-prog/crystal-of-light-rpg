import Phaser from 'phaser';
import { Player, PlayerState } from '../entities/Player';
import { TILE_SIZE } from '../config/GameConfig';

/**
 * マップレイアウト (16 × 14 タイル)
 * 0 = 草床  /  1 = 石壁  /  2 = 水（非衝突・装飾）
 *
 * 【差し替えガイド】
 *   Phase 4 以降は Tiled で作成した JSON を
 *   this.make.tilemap({ key: 'map_01' }) で読み込む形式に移行する。
 */
const MAP_DATA: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,1,1,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,2,2,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,2,2,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export class WorldScene extends Phaser.Scene {
  private player!:    Player;
  private wallLayer!: Phaser.Tilemaps.TilemapLayer;
  private debugText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'World' });
  }

  create(): void {
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.buildTilemap();
    this.spawnPlayer();
    this.setupCamera();
    this.buildDebugHUD();
    this.bindDemoKeys();
  }

  // ── タイルマップ構築 ─────────────────────────────────────────
  /**
   * プログラム生成タイルマップ。
   * - タイル 1（石壁）に衝突判定を設定。
   * - タイル 2（水）は非衝突・装飾のみ。
   *
   * 差し替え時は以下のように書き換える:
   *   const map  = this.make.tilemap({ key: 'map_01' });
   *   const ts   = map.addTilesetImage('tileset');
   *   const ground = map.createLayer('Ground', ts, 0, 0)!;
   *   const walls  = map.createLayer('Walls',  ts, 0, 0)!;
   *   walls.setCollisionByProperty({ collides: true });
   */
  private buildTilemap(): void {
    const map = this.make.tilemap({
      data:       MAP_DATA,
      tileWidth:  TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    // addTilesetImage(name, key, tileWidth, tileHeight, margin, spacing)
    const tileset = map.addTilesetImage('tileset', undefined, TILE_SIZE, TILE_SIZE, 0, 0)!;

    const layer = map.createLayer(0, tileset, 0, 0)!;
    layer.setDepth(0);

    // 壁（インデックス 1）に衝突を設定
    layer.setCollision([1]);
    this.wallLayer = layer;
  }

  // ── プレイヤー配置 ───────────────────────────────────────────
  private spawnPlayer(): void {
    // タイル(2,1) の中央に配置
    const startX = TILE_SIZE * 2 + TILE_SIZE / 2;
    const startY = TILE_SIZE * 1 + TILE_SIZE / 2;

    this.player = new Player(this, startX, startY);
    this.physics.add.collider(this.player, this.wallLayer);
  }

  // ── カメラ ───────────────────────────────────────────────────
  private setupCamera(): void {
    const mapW = MAP_DATA[0].length * TILE_SIZE;
    const mapH = MAP_DATA.length    * TILE_SIZE;

    this.cameras.main
      .setBounds(0, 0, mapW, mapH)
      .startFollow(this.player, true, 0.12, 0.12); // lerp で滑らかに追従
  }

  // ── デバッグ HUD ─────────────────────────────────────────────
  private buildDebugHUD(): void {
    this.debugText = this.add.text(4, 4, '', {
      fontFamily:      'monospace',
      fontSize:        '7px',
      color:           '#00ff88',
      stroke:          '#000000',
      strokeThickness: 2,
      lineSpacing:     2,
    }).setScrollFactor(0).setDepth(100);

    // 操作ガイド
    this.add.text(4, TILE_SIZE * 14 * 3 - 30, [
      '[↑↓←→] 移動  [Shift] 走る',
      '[1] 驚き  [2] 勝利  [3] 悲しみ  [4] 戦闘態勢',
    ].join('\n'), {
      fontFamily: 'monospace',
      fontSize:   '6px',
      color:      '#aaaaaa',
    }).setScrollFactor(0).setDepth(100);
  }

  // ── デモキー (ステート演技シshocase) ─────────────────────────
  private bindDemoKeys(): void {
    const kb = this.input.keyboard!;
    kb.on('keydown-ONE',   () => this.player.setPlayerState(PlayerState.SURPRISE));
    kb.on('keydown-TWO',   () => this.player.setPlayerState(PlayerState.VICTORY));
    kb.on('keydown-THREE', () => this.player.setPlayerState(PlayerState.SAD));
    kb.on('keydown-FOUR',  () => this.player.setPlayerState(PlayerState.BATTLE_READY));
  }

  // ── 毎フレーム ───────────────────────────────────────────────
  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.refreshDebug();
  }

  private refreshDebug(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.debugText.setText([
      `State : ${this.player.getState()}`,
      `Dir   : ${this.player.direction}`,
      `Vel   : ${body.velocity.x.toFixed(1)}, ${body.velocity.y.toFixed(1)}`,
      `Pos   : ${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}`,
    ]);
  }
}
