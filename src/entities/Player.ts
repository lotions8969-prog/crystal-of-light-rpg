import Phaser from 'phaser';
import { StateMachine } from './StateMachine';

// ─── 定数 ────────────────────────────────────────────────────────
const WALK_SPEED   = 80;
const RUN_SPEED    = 140;
const ACCELERATION = 700;
const DRAG         = 900;

// ─── 型 ──────────────────────────────────────────────────────────
export type Direction = 'up' | 'down' | 'left' | 'right';

export enum PlayerState {
  IDLE         = 'idle',
  WALK         = 'walk',
  RUN          = 'run',
  TALK         = 'talk',
  BATTLE_READY = 'battle_ready',
  VICTORY      = 'victory',
  SURPRISE     = 'surprise',
  SAD          = 'sad',
}

// ─── Player ──────────────────────────────────────────────────────
/**
 * プレイヤーキャラクター。
 * - 加速・慣性付き 8 方向移動
 * - StateMachine による演技管理
 * - Phase 2 でシームレス・バトルへ繋げるための公開 API を備える
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly sm: StateMachine;

  private cursors!:  Phaser.Types.Input.Keyboard.CursorKeys;
  private shiftKey!: Phaser.Input.Keyboard.Key;

  /** 現在の向き。アニメーション・Phase2 での位置依存攻撃に使用 */
  direction: Direction = 'down';

  /** true のとき移動入力を無効化（会話・演出中） */
  private inputLocked = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);

    // 物理ボディをスプライトより小さめに設定（足元衝突）
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 8);
    body.setOffset(3, 8);
    body.setCollideWorldBounds(true);

    // 入力
    this.cursors  = scene.input.keyboard!.createCursorKeys();
    this.shiftKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // ステートマシン構築
    this.sm = new StateMachine();
    this.buildStateMachine();
    this.sm.setState(PlayerState.IDLE);

    // プレースホルダーアニメーション登録
    this.registerPlaceholderAnims(scene);
  }

  // ── ステートマシン構築 ────────────────────────────────────────
  private buildStateMachine(): void {
    this.sm
      // ── IDLE ──
      .addState(PlayerState.IDLE, {
        onEnter:  () => this.playDirAnim('idle'),
        onUpdate: () => this.handleMovement(),
      })
      // ── WALK ──
      .addState(PlayerState.WALK, {
        onEnter:  () => this.playDirAnim('walk'),
        onUpdate: () => {
          this.handleMovement();
          const body = this.body as Phaser.Physics.Arcade.Body;
          if (body.velocity.lengthSq() < 4) this.sm.setState(PlayerState.IDLE);
        },
      })
      // ── RUN ──
      .addState(PlayerState.RUN, {
        onEnter:  () => this.playDirAnim('run'),
        onUpdate: () => {
          if (!this.shiftKey.isDown) { this.sm.setState(PlayerState.WALK); return; }
          this.handleMovement();
          const body = this.body as Phaser.Physics.Arcade.Body;
          if (body.velocity.lengthSq() < 4) this.sm.setState(PlayerState.IDLE);
        },
      })
      // ── TALK ──
      .addState(PlayerState.TALK, {
        onEnter: () => {
          this.inputLocked = true;
          this.stopBody();
          this.playDirAnim('idle');
        },
        onUpdate: () => {},
        onExit:   () => { this.inputLocked = false; },
      })
      // ── BATTLE_READY ──
      .addState(PlayerState.BATTLE_READY, {
        onEnter: () => {
          this.inputLocked = true;
          this.stopBody();
          this.playDirAnim('battle');
        },
        onUpdate: () => {},
        onExit:   () => { this.inputLocked = false; },
      })
      // ── VICTORY ──
      .addState(PlayerState.VICTORY, {
        onEnter: () => {
          this.inputLocked = true;
          this.stopBody();
          this.playDirAnim('victory');
          // 勝利エフェクト：上下バウンス
          this.scene.tweens.add({
            targets:  this,
            y:        this.y - 6,
            duration: 200,
            yoyo:     true,
            repeat:   3,
          });
          this.showEmote('★', 0xffd700);
          this.scene.time.delayedCall(2500, () => this.sm.setState(PlayerState.IDLE));
        },
        onUpdate: () => {},
        onExit:   () => { this.inputLocked = false; },
      })
      // ── SURPRISE ──
      .addState(PlayerState.SURPRISE, {
        onEnter: () => {
          this.inputLocked = true;
          this.stopBody();
          this.playDirAnim('idle');
          this.showEmote('!', 0xff4444);
          // 小刻み振動
          this.scene.tweens.add({
            targets:  this,
            x:        { from: this.x - 2, to: this.x + 2 },
            duration: 60,
            yoyo:     true,
            repeat:   5,
          });
          this.scene.time.delayedCall(1200, () => this.sm.setState(PlayerState.IDLE));
        },
        onUpdate: () => {},
        onExit:   () => { this.inputLocked = false; },
      })
      // ── SAD ──
      .addState(PlayerState.SAD, {
        onEnter: () => {
          this.inputLocked = true;
          this.stopBody();
          this.playDirAnim('idle');
          this.showEmote('…', 0x88aaff);
          // 頭を垂れる演出
          this.scene.tweens.add({
            targets:    this,
            angle:      { from: 0, to: 5 },
            duration:   400,
            yoyo:       true,
            repeat:     2,
            ease:       'Sine.inOut',
            onComplete: () => { this.setAngle(0); },
          });
        },
        onUpdate: () => {},
        onExit:   () => { this.inputLocked = false; },
      });
  }

  // ── 移動処理 (加速・慣性) ─────────────────────────────────────
  private handleMovement(): void {
    if (this.inputLocked) return;

    const body   = this.body as Phaser.Physics.Arcade.Body;
    const isRun  = this.shiftKey.isDown;
    const speed  = isRun ? RUN_SPEED : WALK_SPEED;
    let dx = 0, dy = 0;

    if      (this.cursors.left.isDown)  { dx = -1; this.direction = 'left'; }
    else if (this.cursors.right.isDown) { dx =  1; this.direction = 'right'; }
    if      (this.cursors.up.isDown)    { dy = -1; this.direction = 'up'; }
    else if (this.cursors.down.isDown)  { dy =  1; this.direction = 'down'; }

    // 斜め移動の速度を正規化
    if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

    if (dx !== 0 || dy !== 0) {
      body.setAcceleration(dx * ACCELERATION, dy * ACCELERATION);
      body.setMaxVelocity(speed, speed);
      body.setDrag(0, 0);
      this.setFlipX(this.direction === 'left');

      const next = isRun ? PlayerState.RUN : PlayerState.WALK;
      if (!this.sm.is(next)) this.sm.setState(next);
    } else {
      // 入力なし → 慣性で減速
      body.setAcceleration(0, 0);
      body.setDrag(DRAG, DRAG);
    }
  }

  private stopBody(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAcceleration(0, 0);
  }

  // ── アニメーション ────────────────────────────────────────────
  /**
   * 方向付きアニメを優先して再生。
   * 将来スプライトシートを入れたとき player_walk_right 等に自動対応。
   */
  private playDirAnim(action: string): void {
    const dirKey = `player_${action}_${this.direction}`;
    const genKey = `player_${action}`;
    if      (this.anims.exists(dirKey)) this.play(dirKey, true);
    else if (this.anims.exists(genKey)) this.play(genKey, true);
    // プレースホルダー時はアニメなし（静止テクスチャ）
  }

  /**
   * プレースホルダー用アニメーション（将来スプライトシートに差し替え可）。
   * スプライトシート準備後は src/assets/anims/*.json を読み込む形式に移行。
   */
  private registerPlaceholderAnims(scene: Phaser.Scene): void {
    // 現時点では単一テクスチャのため、アニメーション定義は空
    // Phase 3 で sprites/player.png + player_anims.json を追加して差し替える
    void scene;
  }

  // ── エモートバブル ────────────────────────────────────────────
  private showEmote(text: string, _color: number): void {
    const t = this.scene.add.text(this.x, this.y - 18, text, {
      fontFamily:      'monospace',
      fontSize:        '10px',
      color:           '#ffffff',
      stroke:          '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets:  t,
      y:        this.y - 28,
      alpha:    { from: 1, to: 0 },
      duration: 900,
      onComplete: () => t.destroy(),
    });
  }

  // ── 公開 API ─────────────────────────────────────────────────
  update(dt: number): void        { this.sm.update(dt); }
  getState(): string | null       { return this.sm.getState(); }
  setPlayerState(s: PlayerState): void { this.sm.setState(s); }
}
