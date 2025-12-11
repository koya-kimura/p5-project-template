import p5 from "p5";
import type { VisualRenderContext } from "../types/render"; // 描画コンテキストの型定義
import type { UIDrawFunction } from "../ui/uiDrawers"; // UI描画関数の型定義
import { uiNone, uiDebug } from "../ui/uiDrawers"; // UI描画関数の実装

// UI描画関数の配列。MIDI入力に基づいて選択される。
const UI_DRAWERS: readonly UIDrawFunction[] = [uiDebug];

/**
 * UIManager は UI オーバーレイ用の `p5.Graphics` を管理する。
 */
export class UIManager {
  private renderTexture: p5.Graphics | undefined;
  private activePatternIndex: number;

  constructor() {
    this.renderTexture = undefined;
    this.activePatternIndex = 0;
  }

  /**
   * UI 描画用の `p5.Graphics` を生成する。
   *
   * @param p p5 インスタンス。
   */
  init(p: p5): void {
    this.renderTexture = p.createGraphics(p.width, p.height);
  }

  /**
   * UI 描画結果を保持している `p5.Graphics` を返す。
   *
   * @returns UI オーバーレイのテクスチャ。
   * @throws Error 初期化前に呼び出された場合。
   */
  getTexture(): p5.Graphics {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }
    return texture;
  }

  /**
   * ウィンドウリサイズに合わせてテクスチャのサイズを更新する。
   *
   * @param p p5 インスタンス。
   */
  resize(p: p5): void {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }
    texture.resizeCanvas(p.width, p.height);
  }

  update(_p: p5): void {}

  /**
   * UI 描画を行い、MIDI の状態に応じたパターンを選択する。
   *
   * @param context 描画コンテキスト。
   */
  draw(context: VisualRenderContext): void {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }

    this.activePatternIndex = this.normalizePatternIndex(
      context.midiManager.midiInput["uiSelect"] as number | undefined,
    );

    texture.push();
    texture.clear();
    const uiContext: VisualRenderContext = {
      ...context,
      tex: texture,
    };
    const drawer = UI_DRAWERS[this.activePatternIndex] ?? UI_DRAWERS[0];
    drawer(uiContext);

    texture.pop();
  }

  /**
   * パターンインデックスを範囲内に収める。
   *
   * @param value MIDI から渡されたインデックス値。
   * @returns 有効なインデックス。
   */
  private normalizePatternIndex(value: number | undefined): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return 0;
    }
    const clamped = Math.max(0, Math.floor(value));
    return Math.min(UI_DRAWERS.length - 1, clamped);
  }
}
