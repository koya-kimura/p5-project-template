import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  server: {
    port: 4647,        // ポート番号を固定
    strictPort: true,  // ポートが使用中ならエラーにする（勝手に変えない）
  },
  preview: {
    port: 4647,        // プレビュー時も同じポート
    strictPort: true,
  },
  plugins: [
    glsl({
      include: /\.(glsl|vert|frag)(\?[\s\S]*)?$/i, // クエリ付き拡張子にもマッチさせる
      compress: false,  // 可読性を保持
      watch: true,      // ファイル変更を監視
    }),
  ],
  build: {
    sourcemap: false,  // 本番ビルド時はソースマップなし
    minify: 'esbuild', // 高速な最小化
  },
})
