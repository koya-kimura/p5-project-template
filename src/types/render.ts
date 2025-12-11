import p5 from "p5";
import type { APCMiniMK2Manager } from "../midi/apcmini_mk2/apcMiniMk2Manager";
import type { AudioMicManager } from "../utils/audio/audioMicManager";
import type { CaptureManager } from "../utils/capture/captureManager";

/**
 * ビジュアル描画コンテキスト。描画に必要な共通の情報をまとめたインターフェース。
 */
export interface VisualRenderContext {
  p: p5;
  tex: p5.Graphics;
  midiManager: APCMiniMK2Manager;
  beat: number;
  audioManager?: AudioMicManager;
  captureManager?: CaptureManager;
  font?: p5.Font;
}