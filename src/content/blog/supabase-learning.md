---
title: '今日学んだこと：Supabaseの環境構築に関して'
description: 'Supabaseの環境構築に関して'
pubDate: 2025-08-30
tags: ['Supabase']
draft: false
---

## 概要

今日はSupabaseの環境構築について学んだ。

### ポイント1

- Supabase（スーパーベース）は、オープンソースのリアルタイムデータベースを基盤とした、バックエンド機能を提供するプラットフォーム。

- Supabaseの主な特徴：
    - PostgreSQL DBの採用
    - リアルタイムデータ同期
    - 認証機能
    - ロールベースのアクセス制御
    - ストレージ機能

- Supabaseは、データベースのテーブルを作成するごとにテーブルにアクセスし、操作するための一意のAPIエンドポイント（URL）が取得できる。そのため、データベースに詳しくなくても、エンドポイントに対してHTTPリクエストをするだけで結果が得られるなど、データへのアクセスが簡単。

### ポイント2

- プロジェクト作成

- パッケージのインストール

- 環境変数の設定
Supabaseアカウントに戻り、settingsのAPIに記載されている「Project URL」と「Project API keys (anon)」をコピーする

- プロジェクトの一番上のディレクトリ（ルートディレクトリ）に.env.localファイルを作成し、以下のように編集する：
このkeyに関しては誰にも見られないようにenvファイルで管理する

```
NEXT_PUBLIC_SUPABASE_ANON_KEY = コピーした「Project API keys」を貼り付ける
NEXT_PUBLIC_SUPABASE_URL = コピーした「Project URL」を貼り付ける
```

### 実装例・コード例

supabase.tsファイル
```ts
import { createClient } from '@supabase/supabase-js'
// Create a single supabase client for interacting with your database
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

## 参考文献・リンク

https://www.craftstadium.com/blog/tech-supabase

https://udemy.benesse.co.jp/development/app/supabase.html

https://qiita.com/UKI_datascience/items/19d690753890b63a29c6

---