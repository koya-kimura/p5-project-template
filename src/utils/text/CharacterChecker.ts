/**
 * 文字が漢字または小さい仮名（捨て仮名）であるかを判定するためのユーティリティ関数。
 */

/**
 * 日本語の「小さい文字」（拗音、促音、捨て仮名）のリスト。
 * ぁぃぅぇぉゃゅょっ (ひらがな)
 * ァィゥェォヵヶッャュョ (カタカナ)
 */
const SMALL_KANA_CHARS: string = "ぁぃぅぇぉゃゅょっァィゥェォヵヶッャュョ";

/**
 * 文字がC-CJK統合漢字の主要な範囲 (U+4E00〜U+9FFF) に含まれるかを判定します。
 * @param char 判定する単一の文字。
 * @returns 漢字の主要な範囲内であれば true。
 */
export const isKanji = (char: string): boolean => {
  if (char.length !== 1) {
    return false;
  }

  const code = char.charCodeAt(0);

  // CJK統合漢字の主要な範囲 (U+4E00 から U+9FFF)
  return code >= 0x4e00 && code <= 0x9fff;
};

/**
 * 文字が、日本語の「小さい文字」（拗音、促音などの捨て仮名）かどうかを判定します。
 * @param char 判定する単一の文字。
 * @returns 小さい文字であれば true。
 */
export const isSmallKana = (char: string): boolean => {
  if (char.length !== 1) {
    return false;
  }

  // 定義済みの小さい文字リストにcharが含まれるかチェックする
  return SMALL_KANA_CHARS.includes(char);
};

// --- 利用例 ---

// console.log(`'花' は漢字か: ${isKanji('花')}`); // true
// console.log(`'ほ' は漢字か: ${isKanji('ほ')}`); // false
// console.log(`'ゃ' は小さい仮名か: ${isSmallKana('ゃ')}`); // true
// console.log(`'や' は小さい仮名か: ${isSmallKana('や')}`); // false
