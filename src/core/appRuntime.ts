import p5 from "p5";
import { TexManager } from "./texManager";
import { EffectManager } from "./effectManager";
import { UIManager } from "./uiManager";
import { BPMManager } from "../utils/rhythm/BPMManager";
import { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";
import { AudioMicManager } from "../audio/AudioMicManager";
import { CaptureManager } from "../capture/CaptureManager";
import type { AppConfig } from "./appConfig";
import { defaultAppConfig } from "./appConfig";
import { PlaceholderScene } from "../scenes/debugScreen";
import type { VisualScene } from "../scenes/types";
import mainVert from "../shaders/main.vert";
import postFrag from "../shaders/post.frag";

/**
 * ランタイムで共有するフォントやロゴなどのアセット。
 */
interface RuntimeAssets {
  font?: p5.Font;
  logo?: p5.Image;
}

/**
 * AppRuntime が保持するコンテキスト。設定値と各 Manager のインスタンスを束ねて提供する。
 */
export interface AppContext {
  readonly config: AppConfig;
  readonly texManager: TexManager;
  readonly effectManager: EffectManager;
  readonly uiManager: UIManager;
  readonly bpmManager: BPMManager;
  readonly midiManager: APCMiniMK2Manager;
  scene: VisualScene;
  audioManager?: AudioMicManager;
  captureManager?: CaptureManager;
  assets: RuntimeAssets;
}

/**
 * AppRuntime が提供する API 群。
 */
export interface AppRuntime {
  /** ランタイムの初期化。p5 の `setup` から呼び出すことを想定。 */
  initialize(p: p5): Promise<void>;
  /** 毎フレームの描画処理。p5 の `draw` から呼び出す。 */
  drawFrame(p: p5): void;
  /** キャンバスリサイズ時の処理。 */
  handleResize(p: p5): void;
  /** キー入力を受け付けた際の共通処理。 */
  handleKeyPressed(p: p5): void;
  /** マウス操作時の共通処理。 */
  handleMousePressed(): void;
  /** 各種リソースの解放。 */
  dispose(): void;
  /** 現在のコンテキスト参照を取得。 */
  getContext(): AppContext;
  /** シーン差し替え。初期化済みの場合は即座に `init` を呼び出す。 */
  setScene(scene: VisualScene, p?: p5): void;
}

/**
 * AppRuntime を生成するファクトリ。`AppConfig` を受け取り、
 * 構成に応じた Manager の初期化とライフサイクル API を提供する。
 *
 * @param config 有効化したい機能フラグ。
 * @returns AppRuntime インスタンス。
 */
export const createAppRuntime = (config?: Partial<AppConfig>): AppRuntime => {
  const resolvedConfig: AppConfig = { ...defaultAppConfig, ...config };

  const createScene = resolvedConfig.createScene ?? (() => new PlaceholderScene());
  const scene = createScene();
  const texManager = new TexManager(scene);
  const effectManager = new EffectManager();
  const uiManager = new UIManager();
  const bpmManager = new BPMManager();
  const midiManager = new APCMiniMK2Manager();
  const audioManager = resolvedConfig.enableAudio ? new AudioMicManager() : undefined;
  const captureManager = resolvedConfig.enableCapture ? new CaptureManager() : undefined;

  const context: AppContext = {
    config: resolvedConfig,
    texManager,
    effectManager,
    uiManager,
    bpmManager,
    midiManager,
    scene,
    audioManager,
    captureManager,
    assets: {},
  };

  let initialized = false;

  const loadAssets = async (p: p5): Promise<void> => {
    try {
      const [logo, font] = await Promise.all([
        p.loadImage("/image/logo/kimura.png"),
        p.loadFont("/font/Jost-Regular.ttf"),
      ]);
      context.assets.logo = logo;
      context.assets.font = font;
    } catch (error) {
      console.error("Asset loading failed", error);
    }
  };

  return {
    async initialize(p: p5): Promise<void> {
      texManager.init(p);
      uiManager.init(p);
      midiManager.init();

      effectManager.load(p, mainVert, postFrag);

      const tasks: Promise<void>[] = [loadAssets(p)];

      if (audioManager) {
        tasks.push(
          audioManager.init().catch((error) => {
            console.error("Microphone initialization failed", error);
          }),
        );
      }

      if (captureManager) {
        tasks.push(
          captureManager.init(p).catch((error) => {
            console.error("Capture initialization failed", error);
          }),
        );
      }

      await Promise.all(tasks);
      initialized = true;
    },

    drawFrame(p: p5): void {
      if (!initialized) {
        return;
      }

      p.background(0);

      const beat = bpmManager.getBeat();

      audioManager?.update();
      captureManager?.update(p);

      texManager.update(p, midiManager, beat, audioManager, captureManager);
      texManager.draw(p, midiManager, beat, audioManager, captureManager);

      const { font, logo } = context.assets;
      if (font && logo) {
        uiManager.draw(p, midiManager, { font, logo });
      } else {
        const uiTexture = uiManager.getTexture();
        uiTexture.push();
        uiTexture.clear();
        uiTexture.pop();
      }

      effectManager.apply(p, midiManager, beat, texManager.getTexture(), uiManager.getTexture());
    },

    handleResize(p: p5): void {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      texManager.resize(p);
      uiManager.resize(p);
      captureManager?.resize(p);
    },

    handleKeyPressed(p: p5): void {
      if (p.keyCode === 32) {
        p.fullscreen(true);
      }
      audioManager?.resume().catch(() => undefined);
    },

    handleMousePressed(): void {
      audioManager?.resume().catch(() => undefined);
    },

    dispose(): void {
      captureManager?.dispose();
      audioManager?.dispose();
    },

    getContext(): AppContext {
      return context;
    },

    setScene(newScene: VisualScene, p?: p5): void {
      context.scene = newScene;
      texManager.setScene(newScene, p);
    },
  };
};
