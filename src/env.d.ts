/// <reference types="astro/client" />

// 画像モジュールの型定義
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// 環境変数の型定義（必要に応じて）
interface ImportMetaEnv {
  readonly PUBLIC_SITE_TITLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}