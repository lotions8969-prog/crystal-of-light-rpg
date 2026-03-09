import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

/**
 * TitleScene
 * スターフィールド背景 + アニメカーソル付きメニュー
 */
export class TitleScene extends Phaser.Scene {
  private menuItems:     Phaser.GameObjects.Text[] = [];
  private cursor!:       Phaser.GameObjects.Text;
  private selectedIndex  = 0;
  private canInput       = false;

  constructor() {
    super({ key: 'Title' });
  }

  create(): void {
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.buildBackground();
    this.buildTitle();
    this.buildMenu();
    this.bindInput();

    this.time.delayedCall(1000, () => { this.canInput = true; });
  }

  // ── 背景 ─────────────────────────────────────────────────────
  private buildBackground(): void {
    const g = this.add.graphics();
    g.fillStyle(0x000011, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 星
    for (let i = 0; i < 90; i++) {
      const x  = Phaser.Math.Between(0, GAME_WIDTH);
      const y  = Phaser.Math.Between(0, GAME_HEIGHT);
      const br = Phaser.Math.FloatBetween(0.3, 1.0);
      const sz = Math.random() < 0.08 ? 2 : 1;
      g.fillStyle(0xffffff, br);
      g.fillRect(x, y, sz, sz);
    }

    // 地平線グロー
    const glow = this.add.graphics();
    glow.fillGradientStyle(0x001133, 0x001133, 0x0033aa, 0x0033aa, 0.6);
    glow.fillRect(0, GAME_HEIGHT - 60, GAME_WIDTH, 60);
  }

  // ── タイトルロゴ ─────────────────────────────────────────────
  private buildTitle(): void {
    this.add.text(GAME_WIDTH / 2, 44, 'CHRONO', {
      fontFamily: 'monospace',
      fontSize:   '26px',
      color:      '#00ccff',
      stroke:     '#003366',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 70, 'LEGACY', {
      fontFamily: 'monospace',
      fontSize:   '26px',
      color:      '#ffd700',
      stroke:     '#664400',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 98, '〜  時の旅人  〜', {
      fontFamily: 'monospace',
      fontSize:   '8px',
      color:      '#aaccff',
    }).setOrigin(0.5);

    // タイトル発光アニメ
    const glow = this.add.text(GAME_WIDTH / 2, 70, 'LEGACY', {
      fontFamily: 'monospace',
      fontSize:   '26px',
      color:      '#ffd70000',
      stroke:     '#ffd700',
      strokeThickness: 8,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets:  glow,
      alpha:    { from: 0.3, to: 0 },
      duration: 1800,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.inOut',
    });
  }

  // ── メニュー ─────────────────────────────────────────────────
  private buildMenu(): void {
    const labels  = ['New Game', 'Continue', 'Options'];
    const startY  = 136;
    const spacing = 20;

    labels.forEach((label, i) => {
      const t = this.add.text(GAME_WIDTH / 2 + 6, startY + i * spacing, label, {
        fontFamily: 'monospace',
        fontSize:   '10px',
        color:      '#ffffff',
      }).setOrigin(0.5);
      this.menuItems.push(t);
    });

    this.cursor = this.add.text(0, 0, '►', {
      fontFamily: 'monospace',
      fontSize:   '9px',
      color:      '#ffd700',
    }).setOrigin(0.5);

    this.updateCursor();

    this.tweens.add({
      targets:  this.cursor,
      x:        { from: this.cursor.x - 2, to: this.cursor.x + 2 },
      duration: 450,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.inOut',
    });

    // コピーライト
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 10, '© 2026 Chrono-Legacy', {
      fontFamily: 'monospace',
      fontSize:   '6px',
      color:      '#445566',
    }).setOrigin(0.5);
  }

  private updateCursor(): void {
    const item = this.menuItems[this.selectedIndex];
    this.cursor.setPosition(item.x - 44, item.y);
    this.menuItems.forEach((t, i) =>
      t.setColor(i === this.selectedIndex ? '#ffd700' : '#ccddee'));
  }

  // ── 入力 ─────────────────────────────────────────────────────
  private bindInput(): void {
    this.input.keyboard!.on('keydown-UP', () => {
      if (!this.canInput) return;
      this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
      this.updateCursor();
    });

    this.input.keyboard!.on('keydown-DOWN', () => {
      if (!this.canInput) return;
      this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
      this.updateCursor();
    });

    const startGame = () => {
      if (!this.canInput || this.selectedIndex !== 0) return;
      this.canInput = false;
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('World'));
    };

    this.input.keyboard!.on('keydown-ENTER', startGame);
    this.input.keyboard!.on('keydown-Z',     startGame);
  }
}
