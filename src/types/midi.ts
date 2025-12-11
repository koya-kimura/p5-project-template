/**
 * MIDI 関連で共有する型定義。
 * APC Mini MK2 以外のデバイスにも転用できるよう最小限の構造にまとめる。
 */

/**
 * MIDI グリッドやボタンの入力タイプ。
 */
export type InputType = "radio" | "toggle" | "oneshot" | "momentary" | "random" | "sequence";

/**
 * APC Mini MK2 のセル位置（ページ・行・列）を表現する。
 */
export interface CellPosition {
  page?: number; // デフォルト: 0
  row: number; // 0=上, 7=下
  col: number; // 0=左, 7=右
}

/**
 * MIDI ボタン登録時に使用する共通設定。
 */
export interface ButtonConfig {
  key: string;
  type: InputType;
  cells: CellPosition[];
  activeColor?: number;
  inactiveColor?: number;
  defaultValue?: number | boolean;
  randomTarget?: string;
  excludeCurrent?: boolean;
  speed?: number;
  initialPattern?: boolean[];
  onColor?: number;
  offColor?: number;
}

/**
 * MIDI 入力値。radio は number、それ以外は boolean を想定。
 */
export type MidiInputValue = number | boolean;

/**
 * フェーダーボタンのモード種別。
 */
export type FaderButtonMode = "mute" | "random";
