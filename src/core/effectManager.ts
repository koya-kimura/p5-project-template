// EffectManager はポストエフェクト用のシェーダーを読み込み適用する責務を持つ。
import p5 from "p5";
import { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";

export class EffectManager {
  private shader: p5.Shader | null;

  // constructor は空のシェーダー参照を初期化する。
  constructor() {
    this.shader = null;
  }

  // load はシェーダーソース文字列から p5.Shader を生成して保持する。
  // vite-plugin-glsl により import されたシェーダー文字列を直接受け取る。
  load(p: p5, vertSource: string, fragSource: string): void {
    this.shader = p.createShader(vertSource, fragSource);
  }

  // apply は保持しているシェーダーをアクティブにし、各種 Uniform を設定して描画する。
  apply(
    p: p5,
    midiManager: APCMiniMK2Manager,
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
