# 命名規則

プロジェクト全体で統一感を保ち、保守性を高めるための命名方針をまとめます。基本的に ESLint/Prettier が示すスタイルに従いつつ、以下を追加ルールとして守ってください。

## ディレクトリ・ファイル
- ディレクトリ名は英小文字とハイフン/アンダースコアを用いず、`core` や `utils` のようにシンプルな英単語で統一する。
- TypeScript ファイルは用途別に命名し、以下を使い分ける。
  - クラス/コンポーネントをエクスポートするファイルは `PascalCase`（例: `APCMiniMK2Manager.ts`）。ファイル名と主要クラス名の先頭文字を必ず一致させる。
  - ヘルパー関数群やユーティリティは `camelCase`（例: `mathUtils.ts`）。モジュールの先頭文字は常に小文字で始める。
  - 定数定義ファイルは `kebab-case` を避け、`colorPalette.ts` のように役割が明確な `camelCase` にする。
- GLSL シェーダーは `main.vert`、`post.frag` のようにドットでバリアントを分け、処理内容が分かる短い英単語を使う。
- アセット（画像・フォント）は用途に合わせた英語名を付け、スペースは使用しない。

## TypeScript コード
- クラス名、インターフェイス名、型エイリアスは `PascalCase`（例: `TexManager`, `SceneConfig`）。
- 変数・関数・メソッドは `camelCase`（例: `loadTextures`, `getBeat`）。
- 定数は `const` で宣言し、コア定数は `UPPER_SNAKE_CASE`、ローカルな魔法値は `camelCase` のままにする。
- 真偽値は `is`, `has`, `should` などの接頭辞を付け、意図を明確にする。
- `null` は使用せず、未初期化状態を表す際は `undefined` を採用する。

## イベント・コールバック
- イベントハンドラーは `on` プレフィックスを付与（例: `onMidiMessage`）。
- `p5` のライフサイクルは `setup`, `draw`, `windowResized` など既定名を尊重し、追加のフックは `handle*` で統一する。

## データ構造
- `enum` のキーは `UPPER_SNAKE_CASE`、値は用途に応じた文字列もしくは数値。
- `Record` やマップ型のキーは、参照元の意味が分かるよう複数語でも `camelCase` で記述する。
- `Promise` を返す関数は末尾に `Async` を付ける。

## シェーダー内の命名
- uniform / varying 名は `camelCase`（例: `u_time`, `v_texCoord`）。
- マクロや定数は `UPPER_SNAKE_CASE`。
- 断片的な処理はコメントで機能を示し、変数名にも用途を反映させる。

## ドキュメント・スクリプト
- Markdown ファイルは目的に合わせた `kebab-case`（例: `naming-conventions.md`）。
- npm スクリプト名は `:` で名前空間を切った `kebab-case` を使用する（例: `lint:fix`）。

以上のルールが既存コードと矛盾する場合は、影響範囲を確認してからリファクタリングを提案してください。