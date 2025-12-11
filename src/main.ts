// main.ts は p5 スケッチのエントリーポイントとして描画ループを構成する。
import p5 from "p5";

import { TexManager } from "./core/texManager";
import { EffectManager } from "./core/effectManager";
import { UIManager } from "./core/uiManager";
import { BPMManager } from "./utils/rhythm/BPMManager";
import { APCMiniMK2Manager } from "./midi/apcmini_mk2/APCMiniMK2Manager";

// シェーダーを import（vite-plugin-glsl により文字列として読み込まれる）
import mainVert from "./shaders/main.vert";
import postFrag from "./shaders/post.frag";

const texManager = new TexManager();
const effectManager = new EffectManager();
const bpmManager = new BPMManager();
const midiManager = new APCMiniMK2Manager();
const uiManager = new UIManager();

let logo: p5.Image | undefined;
let font: p5.Font | undefined;

// sketch は p5 インスタンスモードで実行されるエントリー関数。
const sketch = (p: p5) => {
  // setup は一度だけ呼ばれ、レンダーターゲットとシェーダーを初期化する。
  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noCursor();

    texManager.init(p);
    uiManager.init(p);
    midiManager.init();

    // シェーダーを直接文字列から生成（ホットリロード対応）
    effectManager.load(p, mainVert, postFrag);

    logo = await p.loadImage("/image/logo/kimura.png");
    font = await p.loadFont("/font/Jost-Regular.ttf");
  };

  // draw は毎フレームのループでシーン更新とポストエフェクトを適用する。
  p.draw = () => {
    p.background(0);

    const beat = bpmManager.getBeat();

    texManager.update(p, midiManager, beat);
    texManager.draw(p, midiManager, beat);

    if (font && logo) {
      uiManager.draw(p, midiManager, { font, logo });
    } else {
      const uiTexture = uiManager.getTexture();
      uiTexture.push();
      uiTexture.clear();
      uiTexture.pop();
    }

    effectManager.apply(p, midiManager, beat, texManager.getTexture(), uiManager.getTexture());
  };

  // windowResized はブラウザのリサイズに追従してバッファを更新する。
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    texManager.resize(p);
  };

  // keyPressed はスペースキーでフルスクリーンを切り替えるショートカットを提供。
  p.keyPressed = () => {
    if (p.keyCode === 32) {
      p.fullscreen(true);
    }
  };
};

// p5.js スケッチを起動する。
new p5(sketch);
