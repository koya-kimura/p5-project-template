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
  {
    key: "colorSelect",
    type: "radio",
    cells: [
      { page: 0, row: 6, col: 4 },
      { page: 0, row: 6, col: 5 },
      { page: 0, row: 6, col: 6 },
      { page: 0, row: 6, col: 7 },
      { page: 0, row: 7, col: 4 },
      { page: 0, row: 7, col: 5 },
      { page: 0, row: 7, col: 6 },
    ],
    activeColor: LED_PALETTE.RED,
    inactiveColor: LED_PALETTE.CYAN,
    defaultValue: 0,
  },

  {
    key: "colorSelectRandom",
    type: "random",
    cells: [{ page: 0, row: 7, col: 7 }],
    randomTarget: "colorSelect", // 対象のradioボタンのkey
    excludeCurrent: true, // 現在値を除外（デフォルト: true）
    speed: 1, // ランダム切り替えのスピード倍率（1=1beat毎、4=4倍速）
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.PURPLE,
  },

  {
    key: "sceneSelect",
    type: "radio",
    cells: [
      { page: 0, row: 0, col: 0 },
      { page: 0, row: 1, col: 0 },
      { page: 0, row: 2, col: 0 },
      { page: 0, row: 3, col: 0 },
      { page: 0, row: 0, col: 1 },
      { page: 0, row: 1, col: 1 },
      { page: 0, row: 2, col: 1 },
      { page: 0, row: 3, col: 1 },
      { page: 0, row: 0, col: 2 },
      { page: 0, row: 1, col: 2 },
      { page: 0, row: 2, col: 2 },
      { page: 0, row: 3, col: 2 },
      { page: 0, row: 0, col: 3 },
      { page: 0, row: 1, col: 3 },
      { page: 0, row: 2, col: 3 },
      { page: 0, row: 3, col: 3 },
      { page: 0, row: 0, col: 4 },
      { page: 0, row: 1, col: 4 },
      { page: 0, row: 2, col: 4 },
      { page: 0, row: 3, col: 4 },
      { page: 0, row: 0, col: 5 },
      { page: 0, row: 1, col: 5 },
      { page: 0, row: 2, col: 5 },
      { page: 0, row: 3, col: 5 },
      { page: 0, row: 0, col: 6 },
      { page: 0, row: 1, col: 6 },
      { page: 0, row: 2, col: 6 },
      { page: 0, row: 3, col: 6 },
      { page: 0, row: 0, col: 7 },
    ],
    activeColor: LED_PALETTE.BLUE,
    inactiveColor: LED_PALETTE.PINK,
    defaultValue: 0,
  },

  {
    key: "sceneSelectRandom",
    type: "random",
    cells: [{ page: 0, row: 3, col: 7 }],
    randomTarget: "sceneSelect", // 対象のradioボタンのkey
    excludeCurrent: true, // 現在値を除外（デフォルト: true）
    speed: 1, // ランダム切り替えのスピード倍率（1=1beat毎、4=4倍速）
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.PURPLE,
  },

  {
    key: "patternSelect",
    type: "radio",
    cells: [
      { page: 0, row: 4, col: 4 },
      { page: 0, row: 4, col: 5 },
      { page: 0, row: 4, col: 6 },
      { page: 0, row: 4, col: 7 },
      { page: 0, row: 5, col: 4 },
      { page: 0, row: 5, col: 5 },
      { page: 0, row: 5, col: 6 },
    ],
    activeColor: LED_PALETTE.RED,
    inactiveColor: LED_PALETTE.CYAN,
    defaultValue: 0,
  },

  {
    key: "patternSelectRandom",
    type: "random",
    cells: [{ page: 0, row: 5, col: 7 }],
    randomTarget: "patternSelect", // 対象のradioボタンのkey
    excludeCurrent: true, // 現在値を除外（デフォルト: true）
    speed: 1, // ランダム切り替えのスピード倍率（1=1beat毎、4=4倍速）
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.PURPLE,
  },

  {
    key: "uiSelect",
    type: "radio",
    cells: [
      { page: 0, row: 4, col: 0 },
      { page: 0, row: 4, col: 1 },
      { page: 0, row: 4, col: 2 },
      { page: 0, row: 4, col: 3 },
      { page: 0, row: 5, col: 0 },
      { page: 0, row: 5, col: 1 },
      { page: 0, row: 5, col: 2 },
      { page: 0, row: 5, col: 3 },
    ],
    activeColor: LED_PALETTE.RED,
    inactiveColor: LED_PALETTE.CYAN,
    defaultValue: 0,
  },

  {
    key: "doubleSpeedToggle",
    type: "toggle",
    cells: [{ page: 0, row: 6, col: 0 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.PINK,
    defaultValue: false,
  },

  {
    key: "quadSpeedMomentary",
    type: "momentary",
    cells: [{ page: 0, row: 6, col: 1 }],
    activeColor: LED_PALETTE.CYAN,
    inactiveColor: LED_PALETTE.PINK,
  },

  {
    key: "backShadowToggle",
    type: "toggle",
    cells: [{ page: 0, row: 7, col: 0 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.YELLOW,
    defaultValue: false,
  },

  {
    key: "vibeToggle",
    type: "toggle",
    cells: [{ page: 0, row: 6, col: 2 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.YELLOW,
    defaultValue: false,
  },

  {
    key: "oneColorToggle",
    type: "toggle",
    cells: [{ page: 0, row: 6, col: 3 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.YELLOW,
    defaultValue: false,
  },

  {
    key: "limitSelect",
    type: "radio",
    cells: [
      { page: 0, row: 7, col: 1 },
      { page: 0, row: 7, col: 2 },
      { page: 0, row: 7, col: 3 },
    ],
    activeColor: LED_PALETTE.BLUE,
    inactiveColor: LED_PALETTE.GREEN,
    defaultValue: 0,
  },

  {
    key: "keyVisualToggle",
    type: "toggle",
    cells: [{ page: 7, row: 0, col: 0 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.YELLOW,
    defaultValue: false,
  },
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
 * サイドボタン（ページ選択）のデフォルトインデックス
 * 0-7の範囲（ページ0～7）
 */
export const DEFAULT_PAGE_INDEX: number = 0;

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
