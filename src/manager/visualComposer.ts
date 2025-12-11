import p5 from "p5";
import type { APCMiniMK2Manager } from "../midi/apcmini_mk2/apcMiniMk2Manager"; // MIDIコントローラー管理クラス
import type { AudioMicManager } from "../utils/audio/audioMicManager"; // オーディオ入力管理クラス
import type { CaptureManager } from "../utils/capture/captureManager"; // カメラキャプチャ管理クラス

import { sampleScene } from "../visuals/sampleScene";

/**
 * VisualComposer はレンダーターゲットとアクティブなビジュアル1つを管理する。
 */
export class VisualComposer {
  private renderTexture: p5.Graphics | undefined; // ビジュアル描画用のオフスクリーンキャンバス

  private sampleScene: sampleScene;

  constructor() {
    this.renderTexture = undefined;
    this.sampleScene = new sampleScene();
  }

  /**
   * ビジュアル描画用の `p5.Graphics` を生成する。
   *
   * @param p p5 インスタンス。
   */
  init(p: p5): void {
    this.renderTexture = p.createGraphics(p.width, p.height);
  }

  /**
   * ビジュアル描画結果を保持している `p5.Graphics` を返す。
   *
   * @returns ビジュアルテクスチャ。
   * @throws Error 初期化前に呼び出された場合。
   */
  getTexture(): p5.Graphics {
    if (!this.renderTexture) {
      throw new Error("Render texture not initialized");
    }
    return this.renderTexture;
  }

  /**
   * テクスチャが初期化されていることを保証する。
   *
   * @returns テクスチャ。
   * @throws Error 初期化されていない場合。
   */
  private ensureTexture(): p5.Graphics {
    if (!this.renderTexture) {
      throw new Error("Render texture not initialized");
    }
    return this.renderTexture;
  }

  /**
   * ビジュアルの更新処理。
   *
   * @param _p p5 インスタンス。
   * @param _midiManager MIDI 状態。
   * @param _beat 現在のビート。
   * @param _audioManager オーディオマネージャー。
   * @param _captureManager キャプチャマネージャー。
   * @param _font フォント。
   */
  update(
    _p: p5,
    _midiManager: APCMiniMK2Manager,
    _beat: number,
    _audioManager?: AudioMicManager,
    _captureManager?: CaptureManager,
    _font?: p5.Font,
  ): void { }

  /**
   * ビジュアルを描画する。
   *
   * @param _p p5 インスタンス。
   * @param _midiManager MIDI 状態。
   * @param _beat 現在のビート。
   * @param _audioManager オーディオマネージャー。
   * @param _captureManager キャプチャマネージャー。
   * @param _font フォント。
   */
  draw(
    _p: p5,
    _midiManager: APCMiniMK2Manager,
    _beat: number,
    _audioManager?: AudioMicManager,
    _captureManager?: CaptureManager,
    _font?: p5.Font,
  ): void {
    const tex = this.ensureTexture();
    const ctx = {
      p: _p,
      tex,
      midiManager: _midiManager,
      beat: _beat,
      audioManager: _audioManager,
      captureManager: _captureManager,
      font: _font,
    };

    // サンプル描画（赤い円）
    tex.push();
    tex.background(0);
    this.sampleScene.draw(ctx);
    tex.pop();
  }

  /**
   * ウィンドウリサイズに合わせてテクスチャのサイズを更新する。
   *
   * @param p p5 インスタンス。
   */
  resize(p: p5): void {
    const texture = this.ensureTexture();
    texture.resizeCanvas(p.width, p.height);
  }

  /**
   * リソースを解放する。
   */
  dispose(): void {
    this.renderTexture?.remove();
    this.renderTexture = undefined;
  }
}