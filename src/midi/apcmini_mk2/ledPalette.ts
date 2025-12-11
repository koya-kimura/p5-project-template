/**
 * LEDカラーパレット定義
 * APC Mini MK2のLED色を定義します。
 */

/** LEDカラーパレット */
export const LED_PALETTE = {
  OFF: 0,
  ON: 3,
  DIM: 1,

  // 基本色
  RED: 5,
  ORANGE: 60,
  YELLOW: 13,
  GREEN: 21,
  CYAN: 32,
  BLUE: 37,
  PURPLE: 53,
  PINK: 56,
} as const;

/** ページごとのLED色（LED_PALETTEを参照） */
export const PAGE_LED_PALETTE = [
  LED_PALETTE.RED, // page 0
  LED_PALETTE.ORANGE, // page 1
  LED_PALETTE.PINK, // page 2
  LED_PALETTE.PURPLE, // page 3
  LED_PALETTE.BLUE, // page 4
  LED_PALETTE.CYAN, // page 5
  LED_PALETTE.GREEN, // page 6
  LED_PALETTE.YELLOW, // page 7
] as const;
