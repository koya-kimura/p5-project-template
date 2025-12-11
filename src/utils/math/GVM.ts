
import { clamp, map } from "./mathUtils";
import { UniformRandom } from "./uniformRandom";
import { linear } from "./easing";

// GVM はグラフ生成やノイズ関数のユーティリティを提供する。

// leapNoise はシームレスにループする補間ノイズを生成する。
export const leapNoise = (
  x: number,
  loop: number,
  move: number,
  seed1: number = 0,
  seed2: number = 0,
): number => {
  const count = Math.floor(x / loop);
  const t = clamp(((x % loop) - (loop - move)) / move, 0, 1);

  const x1 = UniformRandom.rand(seed1, seed2, count);
  const x2 = UniformRandom.rand(seed1, seed2, count + 1);

  return map(t, 0, 1, x1, x2);
};

/**
 * leapNoiseのための補間係数（0.0〜1.0）を計算します。
 * ループ周期内の現在の位置に基づいて、次の値への遷移進行度を算出します。
 * 指定された遷移期間（move）の間だけ値が変化し、それ以外の期間は固定値（または変化完了状態）となります。
 * これにより、断続的な動きや、特定のタイミングでのみ変化するアニメーション制御が可能になります。
 *
 * @param x 現在の時間や進行度。
 * @param loop ループの周期。
 * @param move 遷移にかける時間。
 * @param easeFunc イージング関数。
 * @returns 補間係数（0.0〜1.0）。
 */
export const leapRamp = (x: number, loop: number, move: number, easeFunc: Function = linear) => {
  const count = Math.floor(x / loop);
  return count + easeFunc(clamp((x % loop - (loop - move)) / move, 0, 1));
};