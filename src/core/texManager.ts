import p5 from "p5";
import type { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";
import { PlaceholderScene } from "../scenes/placeholderScene";

// TexManager はレンダーターゲットとシーン描画をまとめるハブ。
export class TexManager {
  private renderTexture: p5.Graphics | undefined;
  private readonly mainScene: PlaceholderScene;

  constructor() {
    this.renderTexture = undefined;
    this.mainScene = new PlaceholderScene();
  }

  // init はキャンバスサイズに合わせた描画用 Graphics を初期化し、シーンへ通知する。
  init(p: p5): void {
    this.renderTexture = p.createGraphics(p.width, p.height);
    this.mainScene.init(p);
  }

  // getTexture は初期化済みの描画バッファを返し、未初期化時はエラーとする。
  getTexture(): p5.Graphics {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }
    return texture;
  }

  // resize は現在の Graphics を最新のウィンドウサイズに追従させ、シーンへも伝える。
  resize(p: p5): void {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }
    texture.resizeCanvas(p.width, p.height);
    this.mainScene.resize(p);
  }

  update(p: p5, midiManager: APCMiniMK2Manager, beat: number): void {
    this.mainScene.update(p, midiManager, beat);
  }

  draw(p: p5, midiManager: APCMiniMK2Manager, beat: number): void {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }
    this.mainScene.draw(p, texture, midiManager, beat);
  }
}
