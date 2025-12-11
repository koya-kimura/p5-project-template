import p5 from "p5";
import { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";
import type { UIAssets } from "../types";

type UIDrawFunction = (p: p5, tex: p5.Graphics, assets: UIAssets, beat: number) => void;

const uiNone: UIDrawFunction = (
  _p: p5,
  tex: p5.Graphics,
  _assets: UIAssets,
  _beat: number,
): void => {
  tex.push();
  tex.pop();
};

const uiDraw01: UIDrawFunction = (
  p: p5,
  tex: p5.Graphics,
  assets: UIAssets,
  _beat: number,
): void => {
  tex.push();
  tex.textFont(assets.font);
  tex.textSize(32);
  tex.fill(255);
  tex.textAlign(p.CENTER, p.CENTER);
  tex.text("UI Draw Placeholder", tex.width / 2, tex.height / 2);
  tex.pop();
};

const UI_DRAWERS: readonly UIDrawFunction[] = [uiNone, uiDraw01];

/**
 * UIManager は UI オーバーレイ用の `p5.Graphics` を管理し、
 * MIDI 入力に基づいて描画パターンを切り替える。
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
   * @param p p5 インスタンス。
   * @param midiManager APC Mini MK2 の入力状態。
   * @param assets UI 描画に必要なフォントやロゴ。
   */
  draw(p: p5, midiManager: APCMiniMK2Manager, assets: UIAssets): void {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }

    this.activePatternIndex = this.normalizePatternIndex(
      midiManager.midiInput["uiSelect"] as number | undefined,
    );

    texture.push();
    texture.clear();
    const drawer = UI_DRAWERS[this.activePatternIndex] ?? UI_DRAWERS[0];
    drawer(p, texture, assets, p.millis() / 500);

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
