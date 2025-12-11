/// <reference types="vite/client" />

// シェーダーファイルの型定義（vite-plugin-glsl 用）
declare module "*.glsl" {
  const value: string;
  export default value;
}

declare module "*.vert" {
  const value: string;
  export default value;
}

declare module "*.frag" {
  const value: string;
  export default value;
}
