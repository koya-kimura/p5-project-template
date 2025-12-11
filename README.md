# p5.js ビジュアルテンプレート

p5.js（インスタンスモード）を TypeScript で扱い、MIDI・マイク入力・カメラキャプチャ・WebGL ポストエフェクトを組み合わせたライブビジュアル用テンプレートです。初期シーンと各種マネージャが揃っているので、導入直後からリアクティブな表現づくりを始められます。

## クイックスタート
1. 必要環境を整えます。
   - Node.js 18 以上
   - Web MIDI 対応ブラウザ（Chromium 系推奨）
   - 任意：APC Mini MK2 / PC マイク / Web カメラ
2. 依存関係をインストールします。
   ```bash
   npm install
   ```
3. 開発サーバーを起動し、`http://localhost:5173` にアクセスします。
   ```bash
   npm run dev
   ```
   初回アクセス時にブラウザから MIDI／マイク／カメラの利用許可を求められた場合は「許可」を選択してください。
4. 本番ビルドが必要な場合は次を実行します。
   ```bash
   npm run build
   npm run preview
   ```

### よく使うスクリプト
- `npm run dev` : Vite 開発サーバー（ポート 4647 に固定、`vite.config.ts` の `strictPort` で衝突検知）
- `npm run build` : 本番ビルド（`dist/` 出力）
- `npm run preview` : ビルド結果の確認
- `npm run format` : Prettier による整形
- `npm run lint` : ESLint チェック
- `npm run typecheck` : TypeScript 型チェック

## プロジェクト構成
```
public/
  font|icon|image/       … 画像・フォントのプレースホルダー
  shader/                … GLSL 資産（ポストエフェクト）
config/                  … ESLint / Prettier 設定
src/
  main.ts                … p5 エントリーポイント（setup/draw のみ）
  core/
    appConfig.ts         … Audio/Capture 有効化フラグの定義
    appRuntime.ts        … マネージャ初期化とメインループ制御
    texManager.ts        … オフスクリーンテクスチャとシーン制御
    effectManager.ts     … ポストエフェクト適用
    uiManager.ts         … UI オーバーレイ描画
  audio/AudioMicManager.ts      … マイク入力の解析
  capture/CaptureManager.ts     … Web カメラキャプチャを p5.Graphics 化
  midi/                         … Web MIDI および APC Mini MK2 実装
  scenes/placeholderScene.ts    … サンプルシーン（MIDI/Audio/Capture 連携）
  shaders/                      … Vite で直接インポートするシェーダー
  types/, utils/                … 型定義とユーティリティ群
```

## ランタイム全体像
- `createAppRuntime` は `AppConfig` を受け取り、必要なマネージャを束ねた `AppRuntime` を生成します。
  - `enableAudio` / `enableCapture` を `false` にすると該当マネージャの初期化をスキップし、シーン側では `undefined` を受け取ります。
  - 例: キャプチャのみ有効にしたい場合
    ```ts
    import { createAppRuntime } from "./core/appRuntime";

    const runtime = createAppRuntime({ enableAudio: false, enableCapture: true });
    ```
  - ランタイムは `initialize / drawFrame / handleResize / handleKeyPressed / handleMousePressed` を提供し、p5.js の `setup/draw` から呼び出すだけでループ処理が成立します。
- `TexManager` はレンダーテクスチャを作成し、アクティブシーン（現状は `PlaceholderScene`）に MIDI・ビート・オプションの Audio/Capture を渡して描画を委譲します。
- `EffectManager` は `src/shaders/main.vert` と `src/shaders/post.frag` を使ってポストプロセスを適用し、`TexManager` と `UIManager` の出力を合成します。
- `UIManager` はオーバーレイ用の `p5.Graphics` を生成し、MIDI 状態に応じた UI を描画します。

### p5.js の役割分担
`main.ts` には p5.js 固有のライフサイクルのみを残し、内部処理はランタイムへ委譲しています。p5 に慣れている人でも `setup` / `draw` の流れを追うだけでメインループを把握できる構成です。

### アーキテクチャ図
- `docs/architecture.md` に Mermaid 図と各 Manager の役割一覧を掲載しています。全体のデータフローを把握したい場合は参照してください。

## 機能別メモ
### MIDI (APC Mini MK2)
- `src/midi/apcmini_mk2/` にマッピング・LED パレット・デバッグ描画がまとまっています。
- `APCMiniMK2Manager` は Web MIDI の初期化とイベント購読を行い、フェーダー値・ボタン状態を外部へ提供します。
- `uiManager` や `PlaceholderScene` でフェーダー値を参照することで、手持ちのハードウェアが無い状態でもパラメータを確認できます。

### オーディオ（マイク入力）
- `AudioMicManager` が `getVolume()` と `getFrequencyData()` を提供します。AudioContext は初回初期化時に権限を要求し、ユーザー操作で停止した場合は `runtime.handleKeyPressed` / `handleMousePressed` から再開を試みます。
- Audio 無効化時はこれらの戻り値が `undefined` になる想定で、シーンは安全にフォールバックするよう実装されています。

### キャプチャ（Web カメラ）
- `CaptureManager` が `createCapture` した映像を `p5.Graphics` にリサイズ＆センタリングして保持します。
- リサイズ時は内部バッファを追従させ、`PlaceholderScene` では右上にプレビューを描画します。
- `enableCapture: false` の場合は初期化されないため、カメラ権限を求められたくないデモでも安全に利用できます。

### シーンの追加
1. `src/scenes/` に `init/update/draw/resize` を持つクラスを追加します。
2. `TexManager` のコンストラクタで新しいシーンを差し替える、もしくはシーン切り替え機構を実装します。
3. 必要に応じて `AppRuntime` に渡すマネージャ（MIDI, Audio, Capture, BPM など）をシーンの API と同期させます。

## シェーダーパイプライン
- `EffectManager.apply` がオフスクリーンテクスチャをポストシェーダーへ渡し、最終的な画面に描画します。
- Uniform 例: `u_tex`（レンダー結果）、`u_uiTex`（UI オーバーレイ）、`u_resolution`、`u_time` など。
- GLSL は `vite-plugin-glsl` により文字列としてインポートされるため、編集後はブラウザのリロードだけで反映されます。

## 開発ガイドライン
- コーディング規約は `docs/naming-conventions.md` を参照してください。
- `null` は使用せず `undefined` に統一しています。既存方針から外れる場合は理由をコメントに残してください。
- コード整形や静的解析は上記スクリプトを利用し、Pull Request 前に `npm run format`, `npm run lint`, `npm run typecheck` を実行することを推奨します。

## トラブルシューティング
- **MIDI が認識されない**: HTTPS または `localhost` でアクセスし、ブラウザの MIDI 権限ダイアログを許可してください。APC Mini MK2 は接続後にブラウザを再読み込みすると安定します。
- **マイク／カメラが動作しない**: ブラウザの権限設定を確認し、拒否済みの場合は設定から再許可してください。`enableAudio` / `enableCapture` が `false` になっていないかも確認します。
- **画面が真っ黒**: `runtime.initialize` が完了する前に `draw` が走ると描画されません。初期化中は `drawFrame` が早期 return するので、コンソールにエラーが出ていないか確認してください。
- **シェーダーエラー**: デベロッパーツールのコンソールに GLSL のログが出力されます。ホットリロードで解消しない場合は開発サーバーを再起動してください。

Happy hacking! テンプレートをベースに、ライブパフォーマンスやジェネラティブアートの土台として活用してください。