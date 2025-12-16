import p5 from "p5";
import { VisualComposer } from "../manager/visualComposer"; // ビジュアル描画を管理するマネージャー
import { EffectManager } from "../manager/effectManager"; // シェーダーエフェクトを適用するマネージャー
import { UIManager } from "../manager/uiManager"; // UIオーバーレイを描画するマネージャー
import { BPMManager } from "../utils/rhythm/bpmManager"; // BPMとビートを管理するユーティリティ
import { APCMiniMK2Manager } from "../midi/apcmini_mk2/apcMiniMk2Manager"; // MIDIコントローラー（APC Mini MK2）の管理
import { AudioMicManager } from "../utils/audio/audioMicManager"; // オーディオ入力（マイク）を管理
import { CaptureManager } from "../utils/capture/captureManager"; // カメラキャプチャを管理
import type { AppConfig } from "./appConfig"; // 設定インターフェース
import { defaultAppConfig } from "./appConfig"; // デフォルト設定
import type { VisualRenderContext } from "../types/render"; // 描画コンテキスト
import mainVert from "../shaders/main.vert"; // 頂点シェーダーソース
import postFrag from "../shaders/post.frag"; // フラグメントシェーダーソース

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
  readonly visualComposer: VisualComposer;
  readonly effectManager: EffectManager;
  readonly uiManager: UIManager;
  readonly bpmManager: BPMManager;
  readonly midiManager: APCMiniMK2Manager;
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
}

/**
 * AppRuntime を生成するファクトリ。`AppConfig` を受け取り、
 * 構成に応じた Manager の初期化とライフサイクル API を提供する。
 *
 * @param config 有効化したい機能フラグ。
 * @returns AppRuntime インスタンス。
 */
export const createAppRuntime = (config?: Partial<AppConfig>): AppRuntime => {
  // 設定をデフォルトとマージ
  const resolvedConfig: AppConfig = { ...defaultAppConfig, ...config };

  // 各マネージャーのインスタンス生成
  const visualComposer = new VisualComposer();
  const effectManager = new EffectManager();
  const uiManager = new UIManager();
  const bpmManager = new BPMManager();
  const midiManager = new APCMiniMK2Manager();
  // オプション機能は設定に応じて生成
  const audioManager = resolvedConfig.enableAudio ? new AudioMicManager() : undefined;
  const captureManager = resolvedConfig.enableCapture ? new CaptureManager() : undefined;

  // コンテキストオブジェクトを作成（各マネージャーと設定を束ねる）
  const context: AppContext = {
    config: resolvedConfig,
    visualComposer,
    effectManager,
    uiManager,
    bpmManager,
    midiManager,
    audioManager,
    captureManager,
    assets: {},
  };

  let initialized = false;

  const loadAssets = async (p: p5): Promise<void> => {
    try {
      // ロゴ画像とフォントを並行して読み込み
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
      try {
        // 各マネージャーの初期化
        visualComposer.init(p);
        uiManager.init(p);
        midiManager.init();

        // シェーダーの読み込み
        effectManager.load(p, mainVert, postFrag);

        // アセット読み込みタスク
        const tasks: Promise<void>[] = [loadAssets(p)];

        // オプション機能の初期化（エラー時は警告を表示して続行）
        if (audioManager) {
          tasks.push(
            audioManager.init().catch((error) => {
              console.error("Microphone initialization failed", error);
              alert("Microphone access failed. Audio features will be disabled.");
            }),
          );
        }

        if (captureManager) {
          tasks.push(
            captureManager.init(p).catch((error) => {
              console.error("Capture initialization failed", error);
              alert("Camera access failed. Capture features will be disabled.");
            }),
          );
        }

        // 全ての初期化タスクを待機
        await Promise.all(tasks);
        initialized = true;
      } catch (error) {
        console.error("Runtime initialization failed", error);
        alert("Application initialization failed. Please refresh the page.");
        throw error;
      }
    },

    drawFrame(p: p5): void {
      if (!initialized) {
        return; // 初期化完了前に描画しない
      }

      const beat = bpmManager.getBeat();
      const visualFont = context.assets.font;

      // 各マネージャーの更新
      bpmManager.update();
      audioManager?.update();
      captureManager?.update(p);
      midiManager.update(beat);

      // ビジュアルの更新と描画
      visualComposer.update(p, midiManager, beat, audioManager, captureManager, visualFont);
      visualComposer.draw(p, midiManager, beat, audioManager, captureManager, visualFont);

      // UIの描画（アセットが読み込まれていれば）
      const { font, logo } = context.assets;
      if (font && logo) {
        const uiContext: VisualRenderContext = {
          p,
          tex: uiManager.getTexture(), // UI描画では内部でテクスチャを使用
          midiManager,
          beat,
          audioManager,
          captureManager,
          font,
        };
        uiManager.draw(uiContext);
      } else {
        // アセット未読み込み時はUIテクスチャをクリア
        const uiTexture = uiManager.getTexture();
        uiTexture.push();
        uiTexture.clear();
        uiTexture.pop();
      }

      // エフェクトの適用
      effectManager.apply(
        p,
        midiManager,
        beat,
        visualComposer.getTexture(),
        uiManager.getTexture(),
      );
    },

    handleResize(p: p5): void {
      // キャンバスをウィンドウサイズにリサイズ
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      // 各マネージャーにリサイズを通知
      visualComposer.resize(p);
      uiManager.resize(p);
      captureManager?.resize(p);
    },

    handleKeyPressed(p: p5): void {
      if (p.keyCode === 32) {
        p.fullscreen(true); // スペースキーでフルスクリーン
      }
      // オーディオコンテキストを再開（ユーザー操作が必要）
      audioManager?.resume().catch(() => undefined);
    },

    handleMousePressed(): void {
      // オーディオコンテキストを再開（ユーザー操作が必要）
      audioManager?.resume().catch(() => undefined);
    },

    dispose(): void {
      // リソース解放
      visualComposer.dispose();
      captureManager?.dispose();
      audioManager?.dispose();
    },

    getContext(): AppContext {
      return context; // コンテキスト参照を返す
    },
  };
};
