import type { VisualScene } from "../scenes/types";

/**
 * ランタイム起動時に有効化する機能フラグをまとめた設定。
 */
export interface AppConfig {
  enableAudio: boolean;
  enableCapture: boolean;
  createScene?: () => VisualScene;
}

/**
 * デフォルト設定。Audio/Capture をともに有効化する。
 */
export const defaultAppConfig: AppConfig = {
  enableAudio: true,
  enableCapture: true,
};