# p5.js project template

p5.js（インスタンスモード）を TypeScript で扱い、MIDI・マイク入力・カメラキャプチャ・WebGL ポストエフェクトを組み合わせたライブビジュアル用テンプレートです。

## インストール

```bash
npm install
```

## 使い方

開発サーバー起動:
```bash
npm run dev
```

ブラウザで `http://localhost:4647` にアクセス。初回は MIDI/マイク/カメラの許可を求められるので許可してください。

本番ビルド:
```bash
npm run build
npm run preview
```

## トラブルシューティング

- **MIDI が認識されない**: HTTPS または `localhost` でアクセスし、ブラウザの MIDI 権限ダイアログを許可してください。APC Mini MK2 は接続後にブラウザを再読み込みすると安定します。
- **マイク／カメラが動作しない**: ブラウザの権限設定を確認し、拒否済みの場合は設定から再許可してください。`enableAudio` / `enableCapture` が `false` になっていないかも確認します。
- **画面が真っ黒**: `runtime.initialize` が完了する前に `draw` が走ると描画されません。初期化中は `drawFrame` が早期 return するので、コンソールにエラーが出ていないか確認してください。
- **シェーダーエラー**: デベロッパーツールのコンソールに GLSL のログが出力されます。ホットリロードで解消しない場合は開発サーバーを再起動してください。

## ライセンス

MIT