/**
 * MIDI設定ファイル
 * APC Mini MK2のボタン・セルの設定を定義します。
 */
import type { ButtonConfig, FaderButtonMode } from "../../types";
import { LED_PALETTE } from "./ledPalette";

// ========================================
// ボタン設定
// ========================================

/**
 * グリッドボタンの設定
 * 必要に応じてページ・行・列を指定してボタンを登録してください。
 */
export const MIDI_BUTTON_CONFIGS: ButtonConfig[] = [
];

// ========================================
// フェーダーボタンモード設定
// ========================================

/**
 * フェーダーボタンのモード
 * - "mute": フェーダーボタンON時、フェーダー値を0にミュート
 * - "random": フェーダーボタンON時、フェーダー値をBPM同期でランダムに0/1切り替え
 */
export const FADER_BUTTON_MODE: FaderButtonMode = "random";

// ========================================
// デフォルト値設定
// MIDI接続なしで使用する場合の初期値
// ========================================

/**
 * フェーダーのデフォルト値（9本分: 0-7 + マスター）
 * 値は0.0～1.0の範囲
 */
export const DEFAULT_FADER_VALUES: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];

/**
 * フェーダーボタンのデフォルトトグル状態（9本分）
 * true = ON（ミュートまたはランダム有効）
 */
export const DEFAULT_FADER_BUTTON_TOGGLE_STATE: boolean[] = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];

/**
 * サイドボタン（ページ選択）のデフォルトインデックス
 * 0-7の範囲（ページ0～7）
 */
export const DEFAULT_PAGE_INDEX: number = 0;
