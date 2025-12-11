import type p5 from "p5";
import type { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";
import type { AudioMicManager } from "../audio/AudioMicManager";
import type { CaptureManager } from "../capture/CaptureManager";

/**
 * シーン実装が満たすべきインターフェイス。
 */
export interface VisualScene {
  init(p: p5): void;
  update(
    p: p5,
    midiManager: APCMiniMK2Manager,
    beat: number,
    audioManager?: AudioMicManager,
    captureManager?: CaptureManager,
  ): void;
  draw(
    p: p5,
    tex: p5.Graphics,
    midiManager: APCMiniMK2Manager,
    beat: number,
    audioManager?: AudioMicManager,
    captureManager?: CaptureManager,
  ): void;
  resize(p: p5): void;
}