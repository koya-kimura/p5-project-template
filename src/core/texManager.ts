import p5 from "p5";
import type { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";
import type { AudioMicManager } from "../audio/AudioMicManager";
import type { VisualScene } from "../scenes/types";
import type { CaptureManager } from "../capture/CaptureManager";

/**
 * TexManager はレンダーターゲット（オフスクリーンの p5.Graphics）を生成し、
 * シーン描画とポストエフェクトの橋渡しを担う。
 */
export class TexManager {
  private renderTexture: p5.Graphics | undefined;
  private mainScene: VisualScene;

  constructor(initialScene: VisualScene) {
    this.renderTexture = undefined;
    this.mainScene = initialScene;
  }

  /**
   * レンダリング用のオフスクリーンバッファを生成し、シーンへ初期化イベントを伝える。
   *
   * @param p p5 インスタンス。
   */
  init(p: p5): void {
    this.renderTexture = p.createGraphics(p.width, p.height);
    this.mainScene.init(p);
  }

  /**
   * 初期化済みの描画バッファを返す。
   *
   * @returns シーン描画結果が格納された `p5.Graphics`。
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
   * 現在のレンダーバッファを最新のキャンバスサイズへリサイズし、シーンへも通知する。
   *
   * @param p p5 インスタンス。
   */
  resize(p: p5): void {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }
    texture.resizeCanvas(p.width, p.height);
    this.mainScene.resize(p);
  }

  /**
   * 現在のシーンを差し替える。必要であればその場で初期化する。
   *
   * @param scene 新しいシーン。
   * @param p すでに初期化済みの場合は p5 インスタンスを渡すと即座に init を呼び出す。
   */
  setScene(scene: VisualScene, p?: p5): void {
    this.mainScene = scene;
    if (p && this.renderTexture) {
      scene.init(p);
    }
  }

  /**
   * シーンの更新処理を委譲する。Audio/Capture が無効な場合は `undefined` を渡す。
   *
   * @param p p5 インスタンス。
   * @param midiManager APC Mini MK2 の入力状態。
   * @param beat BPMManager が算出したビート値。
   * @param audioManager オプションのマイク入力マネージャ。
   * @param captureManager オプションのカメラキャプチャマネージャ。
   */
  update(
    p: p5,
    midiManager: APCMiniMK2Manager,
    beat: number,
    audioManager?: AudioMicManager,
    captureManager?: CaptureManager,
  ): void {
    this.mainScene.update(p, midiManager, beat, audioManager, captureManager);
  }

  /**
   * レンダーテクスチャへシーンを描画する。
   *
   * @param p p5 インスタンス。
   * @param midiManager APC Mini MK2 の入力状態。
   * @param beat BPMManager が算出したビート値。
   * @param audioManager オプションのマイク入力マネージャ。
   * @param captureManager オプションのカメラキャプチャマネージャ。
   */
  draw(
    p: p5,
    midiManager: APCMiniMK2Manager,
    beat: number,
    audioManager?: AudioMicManager,
    captureManager?: CaptureManager,
  ): void {
    const texture = this.renderTexture;
    if (!texture) {
      throw new Error("Texture not initialized");
    }
    this.mainScene.draw(p, texture, midiManager, beat, audioManager, captureManager);
  }
}
