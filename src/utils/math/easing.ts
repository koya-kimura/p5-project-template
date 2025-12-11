// Easing はアニメーション向けの汎用イージング関数群を集約する。

/**
 * 汎用的なイージング関数を提供するユーティリティ。
 * すべての関数は 0から1 の入力 (x) を受け取り、0から1 の出力 (アニメーションの進行度) を返します。
 */

// linear は線形補間を行う。
export const linear = (x: number): number => {
  return x;
};

// easeInSine はサインカーブを用いて滑らかに加速する。
export const easeInSine = (x: number): number => {
  return 1 - Math.cos((x * Math.PI) / 2);
};

// easeOutSine はサインカーブを用いて滑らかに減速する。
export const easeOutSine = (x: number): number => {
  return Math.sin((x * Math.PI) / 2);
};

// easeInOutSine はサインベースの緩急を前半後半に分配する。
export const easeInOutSine = (x: number): number => {
  return -(Math.cos(Math.PI * x) - 1) / 2;
};

// easeInQuad は二次関数での加速を行う。
export const easeInQuad = (x: number): number => {
  return x * x;
};

// easeOutQuad は二次関数で減速させる。
export const easeOutQuad = (x: number): number => {
  return 1 - (1 - x) * (1 - x);
};

// easeInOutQuad は二次カーブの前半加速・後半減速を提供する。
export const easeInOutQuad = (x: number): number => {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

// easeInCubic は三次関数で勢いを付けていく。
export const easeInCubic = (x: number): number => {
  return x * x * x;
};

// easeOutCubic は三次関数で滑らかに停止する。
export const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

// easeInOutCubic は三次カーブを前後半に適用する。
export const easeInOutCubic = (x: number): number => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// easeInQuart は四次関数で急激に加速する。
export const easeInQuart = (x: number): number => {
  return x * x * x * x;
};

// easeOutQuart は四次関数で余韻を残して停止する。
export const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

// easeInOutQuart は四次カーブの強い緩急を提供する。
export const easeInOutQuart = (x: number): number => {
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
};

// easeInQuint は五次関数でさらに鋭い加速を作る。
export const easeInQuint = (x: number): number => {
  return x * x * x * x * x;
};

// easeOutQuint は五次関数で鋭く減速する。
export const easeOutQuint = (x: number): number => {
  return 1 - Math.pow(1 - x, 5);
};

// easeInOutQuint は五次カーブの極端な緩急を前後半に適用する。
export const easeInOutQuint = (x: number): number => {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
};

// easeInExpo は指数関数で瞬発力のある加速を生む。
export const easeInExpo = (x: number): number => {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
};

// easeOutExpo は指数関数で素早い減速を行う。
export const easeOutExpo = (x: number): number => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

// easeInOutExpo は指数カーブの両端に急激な変化を入れる。
export const easeInOutExpo = (x: number): number => {
  return x === 0
    ? 0
    : x === 1
      ? 1
      : x < 0.5
        ? Math.pow(2, 20 * x - 10) / 2
        : (2 - Math.pow(2, -20 * x + 10)) / 2;
};

// easeInCirc は円弧を模して滑らかに始まる。
export const easeInCirc = (x: number): number => {
  return 1 - Math.sqrt(1 - Math.pow(x, 2));
};

// easeOutCirc は円弧を模して滑らかに終わる。
export const easeOutCirc = (x: number): number => {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
};

// easeInOutCirc は円弧の前半・後半を接続した軌道を描く。
export const easeInOutCirc = (x: number): number => {
  return x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
};

// easeOutBack はオーバーシュートを伴う勢いのある減速を生む。
export const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// easeInOutBack はオーバーシュートを前後半に分配する。
export const easeInOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
};
