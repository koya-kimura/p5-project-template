import p5 from "p5";
import { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";

/**
 * EffectManager はポストエフェクト用のシェーダーを読み込み、描画パイプラインへ適用する。
 */
export class EffectManager {
  private shader: p5.Shader | undefined;

  constructor() {
    this.shader = undefined;
  }

  /**
   * シェーダーソースから `p5.Shader` を生成し、以降の描画で利用できるよう保持する。
   *
   * @param p p5 インスタンス。
   * @param vertSource 頂点シェーダーの GLSL ソース文字列。
   * @param fragSource フラグメントシェーダーの GLSL ソース文字列。
   */
  load(p: p5, vertSource: string, fragSource: string): void {
    this.shader = p.createShader(vertSource, fragSource);
  }

  /**
   * 保持しているシェーダーをアクティブ化し、Uniform を設定した上でフルスクリーンポリゴンを描画する。
   *
   * @param p p5 インスタンス。
   * @param _midiManager MIDI 状態（将来的な Uniform 連携向け）。
   * @param beat 現在のビート値。
   * @param sourceTexture シーンが描画されたレンダーテクスチャ。
   * @param _uiTexture UI オーバーレイ（未使用だが将来的に活用予定）。
   */
  apply(
    p: p5,
    _midiManager: APCMiniMK2Manager,
    beat: number,
    sourceTexture: p5.Graphics,
    _uiTexture: p5.Graphics,
  ): void {
    if (!this.shader) {
      return;
    }

    p.shader(this.shader);
    this.shader.setUniform("u_tex", sourceTexture);
    this.shader.setUniform("u_resolution", [p.width, p.height]);
    this.shader.setUniform("u_time", p.millis() / 1000.0);
    this.shader.setUniform("u_beat", beat);
    p.rect(0, 0, p.width, p.height);
  }
}
