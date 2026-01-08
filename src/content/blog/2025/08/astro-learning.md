---
title: '今日学んだこと：Astroに関して'
description: 'Astroに関して'
pubDate: 2025-08-23
tags: ['Astro']
draft: false
slug: 'astro-learning'
---

## 概要

今日はAstroについて学んだ。

### ポイント1

- 必要最小限のJavaScriptで最高のパフォーマンスという設計思想
- Astroの最も強力な機能の一つがContent Collections API

### ポイント2

スキーマ定義がnpx astro sync実行時に.astroディレクトリ内に型定義を生成する。
Zodスキーマから自動的にTypeScriptの型を導出する仕組みは、実行時検証とコンパイル時の型チェックを統一できる。

### 実装例・コード例

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});
```

## 参考文献・リンク

https://docs.astro.build/ja/getting-started/

---