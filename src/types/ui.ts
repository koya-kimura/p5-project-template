import type p5 from "p5";

/**
 * UI 描画に必要なアセットの集合。フォントは必須、ロゴは任意で差し替え可能。
 */
export interface UIAssets {
  font: p5.Font;
  logo?: p5.Image;
}
