/**
 * 汎用ステートマシン
 * キャラクターの「演技」(IDLE / WALK / RUN / TALK / BATTLE_READY / VICTORY / SURPRISE / SAD)
 * を管理するコアモジュール。Phase 2 以降もこのクラスを継承して拡張する。
 */

interface StateConfig {
  /** ステート開始時に一度だけ呼ばれる */
  onEnter?: () => void;
  /** フレームごとに呼ばれる (dt: ミリ秒) */
  onUpdate?: (dt: number) => void;
  /** ステート終了時に一度だけ呼ばれる */
  onExit?: () => void;
}

export class StateMachine {
  private states          = new Map<string, StateConfig>();
  private current: string | null = null;
  private previous: string | null = null;
  /** 再入防止フラグ */
  private changing        = false;

  /**
   * ステートを登録する。メソッドチェーン可。
   */
  addState(name: string, config: StateConfig): this {
    this.states.set(name, config);
    return this;
  }

  /**
   * ステートを切り替える。
   * - 同一ステートへの遷移は無視。
   * - onExit → 状態更新 → onEnter の順で呼ぶ。
   */
  setState(name: string): void {
    if (!this.states.has(name)) {
      console.warn(`[StateMachine] Unknown state: "${name}"`);
      return;
    }
    if (this.current === name || this.changing) return;

    this.changing = true;
    this.states.get(this.current ?? '')?.onExit?.();

    this.previous = this.current;
    this.current  = name;
    this.states.get(name)!.onEnter?.();
    this.changing = false;
  }

  /** フレーム更新。WorldScene.update() から呼ぶ。 */
  update(dt: number): void {
    if (this.current) {
      this.states.get(this.current)?.onUpdate?.(dt);
    }
  }

  getState(): string | null    { return this.current; }
  getPrevious(): string | null { return this.previous; }
  is(name: string): boolean    { return this.current === name; }
}
