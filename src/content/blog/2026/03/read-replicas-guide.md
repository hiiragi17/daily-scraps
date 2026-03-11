---
title: '今日学んだこと：Read Replica（読み取りレプリカ）'
description: 'Read Replicaの概念・仕組み・レプリケーションラグ・Railsでの実装方法をまとめた'
pubDate: 2026-03-11
tags: ['MySQL', 'Database', 'レプリケーション', 'Rails', 'AWS']
draft: false
customSlug: 'read-replicas-guide'
---

## 概要

Read Replica とは、**「メインDBの読み取り専用コピー」**のこと。

---

## なぜ必要なのか

アプリが成長してユーザーが増えると、1台のDBにアクセスが集中してパンクする。

```
ユーザー100人
  → SELECT が毎秒1000回
  → INSERT/UPDATE も毎秒100回
  → 1台のDBに全部集中 → パンク
```

DBへのアクセスは一般的に **「読み取り（SELECT）が8〜9割、書き込みが1〜2割」**。
Read Replica は「読み取りだけ別のサーバーに分散させる」という発想で生まれた。

---

## 仕組み

```
アプリ
 ├─ 書き込み系 ──→  【Primary DB】（マスター）
 │                       ↓ binlogをリアルタイム転送
 └─ 読み取り系 ──→  【Read Replica】（スレーブ）
```

PrimaryのbinlogをRead Replicaに転送・適用し続けることで、常に最新のデータが同期される。

---

## Primary と Read Replica の役割分担

| 操作 | どちらに送る？ |
|---|---|
| INSERT / UPDATE / DELETE | Primary のみ |
| SELECT（重いレポート系クエリ）| Read Replica |
| SELECT（一覧表示など）| Read Replica |
| トランザクションを伴う処理 | Primary のみ |

---

## Railsでの実装

Rails 6以降は **複数DB接続** が標準サポートされている。

```ruby
# config/database.yml
production:
  primary:
    adapter: mysql2
    host: primary.rds.amazonaws.com
    # 書き込み用
  primary_replica:
    adapter: mysql2
    host: replica.rds.amazonaws.com
    replica: true  # これを付けるだけで読み取り専用に
```

```ruby
# モデルで接続先を切り替える
class ApplicationRecord < ActiveRecord::Base
  connects_to database: {
    writing: :primary,
    reading: :primary_replica
  }
end
```

```ruby
# コントローラなどで明示的に切り替える
ActiveRecord::Base.connected_to(role: :reading) do
  # このブロック内のSELECTはすべてReplicaへ
  @items = Item.where(status: "active").limit(20)
end
```

---

## 重要な注意点：レプリケーションラグ

Read Replica には **「レプリケーションラグ」** という避けられない特性がある。

```
Primary に INSERT
  ↓ binlog転送（数ms〜数百ms）
Read Replica に反映

この「数ms〜数百ms」の間に Read Replica を参照すると
古いデータが返ってくることがある
```

### ラグが問題になる具体例

```
① ユーザーが会員登録（INSERT → Primary）
② すぐに一覧ページをリロード（SELECT → Replica）
③ まだ同期されていないので自分が表示されない
```

### 対策パターン

```ruby
# 書き込み直後は必ずPrimaryから読む
def create
  @user = User.create!(user_params)
  # リダイレクト先でも書き込みロールで読む
  redirect_to user_path(@user)
end

# または書き込み後の一定時間はPrimaryへ誘導する仕組みを入れる
```

---

## AWS RDSでのRead Replica

```
RDS Primary（Multi-AZ）
  ├─ 同一リージョンのRead Replica  → 低レイテンシ・負荷分散
  └─ 別リージョンのRead Replica   → 災害対策（DR）
```

- コンソールやTerraformから数クリックで追加できる
- Read ReplicaをそのままPrimaryに**昇格**させることもできる（フェイルオーバー）
- Replicaだけインスタンスタイプを落として**コスト削減**も可能

---

## まとめ

| 項目 | 内容 |
|---|---|
| 何のため？ | 読み取り負荷の分散、パフォーマンス向上 |
| 仕組みは？ | binlogをPrimaryからReplicaに転送・適用 |
| 書き込みは？ | Primaryのみ（Replicaは読み取り専用） |
| 注意点は？ | レプリケーションラグがある |
| Railsでは？ | `connects_to` で接続先を役割ごとに定義できる |
