---
title: '今日学んだこと：SupabaseでのGoogle認証エラーに関して'
description: 'SupabaseでのGoogle認証エラーに関して'
pubDate: 2025-09-04
tags: ['Supabase', 'Google認証']
draft: false
customSlug: 'supabase_google-learning'
---

## 概要

今日はSupabaseについて学んだ。

### 今回生じた問題

- Google認証でエラーが起きていた

```
http://localhost:3000/auth/callback?error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user#error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

調べたところDBにユーザーが登録できないエラーだった。
問題として考えられるのは以下。

1. RLSポリシーの問題
2. トリガー関数の問題
3. 環境変数の問題 → Supabase URLやキーが間違っている

トリガー関数とは：
DBで特定のイベントが発生した時に自動実行される関数

RLSポリシーや環境変数、リダイレクトURIが登録されているかを確認したが、そこは問題なさそうだった。

### 原因

当初のトリガー関数には、avatar_urlがあった。

```
INSERT INTO public.profiles (id, email, name, avatar_url, provider)
VALUES (
    NEW.id,
    NEW.email,
    COALESCE(...),
    NEW.raw_user_meta_data->>'avatar_url',  -- この行が問題
    COALESCE(...)
);
```
しかしprofilesテーブルからavatar_urlを消していた。
それなのにトリガー関数から消さなかったため、
エラーが生じていた。

SupabaseのAuthログから判明した。
```
ERROR: column "avatar_url" of relation "profiles" does not exist (SQLSTATE 42703)
```

テーブル設計とトリガー関数の同期が必須なことがわかった。

CREATE OR REPLACE の活用→関数の削除・再作成ではなく、直接上書きが効率的