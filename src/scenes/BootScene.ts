import Phaser from 'phaser';

/**
 * BootScene
 * 最低限のリソース確認・初期設定のみ行い、即 Preloader へ遷移する。
 * 将来: セーブデータロード、フォント確認などをここに追加。
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create(): void {
    this.scene.start('Preloader');
  }
}
