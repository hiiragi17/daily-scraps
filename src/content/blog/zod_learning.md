---
title: '今日学んだこと：Zodに関して'
description: 'Zodに関して'
pubDate: 2025-08-24
tags: ['Zod', 'TypeScript']
draft: false
---

## 概要

今日はZodについて学んだ。

### ポイント1

- Zodとは、TypeScript向けのスキーマ宣言とデータ検証のためのライブラリ。
- Zodを使用すると、型安全な方法でデータ構造を定義し、それに基づいてデータを検証できる。
- Zodは、TypeScriptの型システムと統合されており、コンパイル時に型エラーを検出しやすくし、ランタイムエラーを減らすのに役立つ。
- TypeScript向けのスキーマ宣言とデータ検証のためのライブラリのこと。
型安全な方法でデータ構造を定義し、それに基づいてバリデーションを行うことが可能。

### ポイント2

- 単純な文字列スキーマを作成し、.parse()という関数を使用して文字列であるかどうかを検証できる。エラーの場合は、ZodErrorをスローする。

### 実装例・コード例

```typescript
import { z } from 'zod'

// 文字列のスキーマの作成
const stringScheme = z.string()

stringScheme.parse("hoge")
// => "hoge"
stringScheme.parse(12)
// => throws ZodError
```

## 参考文献・リンク

https://zenn.dev/fumito0808/articles/29ad3c1b51f8fe

https://qiita.com/3062_in_zamud/items/2625cfcdb300be73f218

---