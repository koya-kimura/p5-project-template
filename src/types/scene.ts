import type p5 from "p5";

/**
 * TexManager で扱うシーンの共通インターフェース。
 * init と dispose は任意で、非同期初期化も許容する。
 */
export interface Scene {
  init?(p: p5): void | Promise<void>;
  update(p: p5): void;
  draw(p: p5, target: p5.Graphics): void;
  dispose?(): void;
}
