// main.ts は p5 スケッチのエントリーポイントとして描画ループを構成する。
import p5 from "p5";

import { createAppRuntime } from "./core/appRuntime";

// sketch は p5 インスタンスモードで実行されるエントリー関数。
const sketch = (p: p5) => {
  const runtime = createAppRuntime({
    enableAudio: true,
    enableCapture: true,
  });

  // setup は一度だけ呼ばれ、レンダーターゲットとシェーダーを初期化する。
  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noCursor();

    await runtime.initialize(p);
  };

  // draw は毎フレームのループでシーン更新とポストエフェクトを適用する。
  p.draw = () => {
    runtime.drawFrame(p);
  };

  // windowResized はブラウザのリサイズに追従してバッファを更新する。
  p.windowResized = () => {
    runtime.handleResize(p);
  };

  // keyPressed はスペースキーでフルスクリーンを切り替えるショートカットを提供。
  p.keyPressed = () => {
    runtime.handleKeyPressed(p);
  };

  p.mousePressed = () => {
    runtime.handleMousePressed();
  };
};

// p5.js スケッチを起動する。
new p5(sketch);
