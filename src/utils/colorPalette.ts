/**
 * カラーパレット定義
 * mainColor: メインカラー（ベース）
 * subColor: サブカラー（補色系）
 * accentColor: アクセントカラー（目立つ色）
 */

export interface ColorPalette {
  mainColor: string;
  subColor: string;
  accentColor: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  // 1. 赤メイン × 青サブ × 黄アクセント（トリコロール）
  { mainColor: "#0f162fff", subColor: "#10fa1bff", accentColor: "#e2debcff" },

  // 2. オレンジメイン × 紫サブ × シアンアクセント
  { mainColor: "#eb2929ff", subColor: "#2626daff", accentColor: "#f3f320ff" },

  // 3. ピンクメイン × 緑サブ × 黄アクセント
  { mainColor: "#ff2970ff", subColor: "#13c31cff", accentColor: "#13abcaff" },

  // 4. 青メイン × オレンジサブ × ライムアクセント
  { mainColor: "#1060ebff", subColor: "#fde424ff", accentColor: "#f70becff" },

  // 5. 紫メイン × 黄緑サブ × オレンジアクセントs
  { mainColor: "#9C27B0", subColor: "#8BC34A", accentColor: "#FF9800" },

  // 6. ティールメイン × 赤サブ × 黄アクセント
  { mainColor: "#00897B", subColor: "#D32F2F", accentColor: "#FFD600" },

  // 7. インディゴメイン × ピンクサブ × シアンアクセント
  { mainColor: "#3949AB", subColor: "#F06292", accentColor: "#00E5FF" },
];

/**
 * インデックスでパレットを取得
 */
export const getPalette = (index: number): ColorPalette => {
  return COLOR_PALETTES[index % COLOR_PALETTES.length];
};
