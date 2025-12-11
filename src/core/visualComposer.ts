import p5 from "p5";
import type { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";
import type { AudioMicManager } from "../audio/AudioMicManager";
import type { CaptureManager } from "../capture/CaptureManager";
import { DebugScreen } from "../visuals/debugScreen";

export interface VisualRenderContext {
  p: p5;
  tex: p5.Graphics;
  midiManager: APCMiniMK2Manager;
  beat: number;
  audioManager?: AudioMicManager;
  captureManager?: CaptureManager;
  font?: p5.Font;
}

/**
 * VisualComposer はレンダーターゲットとアクティブなビジュアル1つを管理する。
 */
export class VisualComposer {
  private renderTexture: p5.Graphics | undefined;
  private debugScreen: DebugScreen;

  constructor() {
    this.renderTexture = undefined;
    this.debugScreen = new DebugScreen();
  }

  init(p: p5): void {
    this.renderTexture = p.createGraphics(p.width, p.height);
  }

  getTexture(): p5.Graphics {
    if (!this.renderTexture) {
      throw new Error("Render texture not initialized");
    }
    return this.renderTexture;
  }

  private ensureTexture(): p5.Graphics {
    if (!this.renderTexture) {
      throw new Error("Render texture not initialized");
    }
    return this.renderTexture;
  }

  update(
    _p: p5,
    _midiManager: APCMiniMK2Manager,
    _beat: number,
    _audioManager?: AudioMicManager,
    _captureManager?: CaptureManager,
    _font?: p5.Font,
  ): void {
  }

  draw(
    p: p5,
    midiManager: APCMiniMK2Manager,
    beat: number,
    audioManager?: AudioMicManager,
    captureManager?: CaptureManager,
    font?: p5.Font,
  ): void {
    const tex = this.ensureTexture();
    const context: VisualRenderContext = {
      p,
      tex,
      midiManager,
      beat,
      audioManager,
      captureManager,
      font,
    };

    tex.clear();
    tex.push();
    this.debugScreen.draw(context);
    tex.pop();
  }

  resize(p: p5): void {
    const texture = this.ensureTexture();
    texture.resizeCanvas(p.width, p.height);
  }

  dispose(): void {
    this.renderTexture?.remove();
    this.renderTexture = undefined;
  }
}
