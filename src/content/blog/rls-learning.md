---
title: '今日学んだこと：Row Level Security(RLS)設定に関して'
description: 'Row Level Security(RLS)設定に関して'
pubDate: 2025-08-31
tags: ['Row Level Security', 'RLSポリシー']
draft: false
---

## 概要

今日はRLSについて学んだ。

### ポイント1

- Row Level Security(RLS)は、テーブル内の行へのアクセスを制御する機能

- 従来のAPI開発であればコードで権限チェックをしている

```python
# FastAPI例
@app.get("/posts")
async def get_posts(current_user: User = Depends(get_current_user)):
    # コードで権限チェック
    if current_user.role != "admin":
        return posts.filter(author_id=current_user.id)
    return posts
```

- Supabaseの場合はフロンエンドから直接データベースにアクセスするため、RLSが権限チェックのために必要

```
// フロントエンドから直接データベースにアクセス
const { data } = await supabase
  .from('posts')
  .select('*') // RLSが自動的に権限をチェック  
```
### ポイント2

RLSは実際にはPostgreSQLの標準機能。

Supabaseがこれを活用している理由：
- 直接データベースアクセス: フロントエンドから直接PostgreSQLにアクセス

- セキュリティの最後の砦: どんなクエリでも必ずRLSポリシーが適用される

- 統一された権限管理: すべてのテーブルアクセスが同じルールに従う

RLS を利用するためには、作成した任意のテーブルにおいて RLS を有効化して Row Security Policies を作成する必要がある

### 実装例・コード例
RLS設定例

```sql
-- テーブルでRLSを有効化
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（例：自分の投稿のみ表示）
CREATE POLICY "Users can view own posts" ON posts
FOR SELECT USING (auth.uid() = author_id);

-- ポリシー作成（例：自分の投稿のみ更新可能）
CREATE POLICY "Users can update own posts" ON posts
FOR UPDATE USING (auth.uid() = author_id);
```
## 参考文献・リンク

https://zenn.dev/taxin/articles/postgresql-row-level-security-policy

---