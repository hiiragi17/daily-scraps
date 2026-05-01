---
title: '今日学んだこと：NoSQLとドキュメント指向データベースの基礎'
description: 'RDBとNoSQLの違いを整理し、特にドキュメント指向データベースの得意・不得意と具体的なユースケースを学んだ。'
pubDate: 2026-05-01
tags: ['データベース', 'NoSQL', 'MongoDB', 'DynamoDB', '設計']
draft: false
customSlug: 'nosql-document-database'
---

## なぜ学ぶ価値があるのか

Rails開発ではMySQLやPostgreSQLなどのRDBを使うのが自然だが、実運用では「RDBだけでは設計しづらい」ケースが一定数ある。

- 属性が可変なデータ（人や商品ごとに項目が違う）
- ネスト構造をそのまま保持したいデータ
- アクセスパターン重視で、データモデルを柔軟にしたい場面

このときNoSQLの選択肢を持っていると、設計の打ち手が増える。

---

## RDBの復習（比較のため）

RDBはテーブル形式で、原則として同じテーブルの行は同じカラム構造を共有する。

```text
users
| id | name  | age | email          |
|----|-------|-----|----------------|
|  1 | Alice |  30 | alice@mail.com |
|  2 | Bob   |  25 | bob@mail.com   |
```

例えばAliceだけ `twitter_id` を持たせたい場合でも、テーブルには `twitter_id` カラムを追加し、他の行はNULLになる。

---

## NoSQLとは何か

NoSQLは「Not Only SQL」の略で、SQLを否定するものではなく、RDB以外のデータモデルを含めて使い分ける考え方。

代表的な分類は次のとおり。

| 種類 | 代表例 | 特徴 |
|---|---|---|
| ドキュメント指向 | MongoDB, Firestore | JSONライクなドキュメント単位で保存 |
| KVS | Redis, DynamoDB | キーに対して値を高速に扱う |
| カラム指向 | Cassandra, BigQuery | 列志向で集計・分析系に強い |
| グラフ | Neo4j | ノード間の関係性を扱うのに強い |

---

## ドキュメント指向DBの基本

ドキュメント指向DBでは、1レコード相当をJSONのような構造で保存する。

```json
{
  "_id": "user_001",
  "name": "Alice",
  "age": 30,
  "email": "alice@mail.com",
  "address": {
    "city": "Tokyo",
    "zip": "100-0001"
  },
  "tags": ["admin", "premium"]
}
```

同じコレクション内でも、ドキュメントごとに構造が違ってよい。

```json
{
  "_id": "user_002",
  "name": "Bob",
  "twitter_id": "@bob_dev",
  "skills": ["Ruby", "Go", "Rust"]
}
```

この「スキーマの柔軟さ」が最大の特徴。

---

## 得意なこと・苦手なこと

### 得意なこと

1. **可変スキーマのデータ**
   - 例：商品カタログ（本と衣類で属性が違う）
2. **ネスト構造の保存**
   - 例：ユーザーに複数住所を配列で持たせる
3. **アプリ側のオブジェクトに近い形で保持**
   - 変換コストを減らしやすい

### 苦手なこと

1. **複数エンティティを跨ぐ複雑なJOIN・集計**
   - RDBのほうが自然に書けるケースが多い
2. **厳格な整合性が最優先の業務**
   - 金融・会計などはRDBの強いトランザクション保証が有利なことが多い

---

## ユースケースでの使い分け

| ユースケース | 向いているDB | 理由 |
|---|---|---|
| ユーザープロフィール（項目が人によって異なる） | ドキュメント指向 | 柔軟なスキーマ |
| セッション情報 | KVS（Redis） | 高速アクセス、TTL |
| 商品カタログ（カテゴリごとに属性差） | ドキュメント指向 | モデル変更に強い |
| 取引履歴（厳密な整合性） | RDB | ACID特性 |
| フォロー関係 | グラフDB | 関係性クエリが得意 |

---

## DynamoDBの使い分けに向けた一言

DynamoDBはKVS（正確にはKey-Value + Wide Column寄りの特性も持つ）として、**アクセスパターンを先に決める設計**が重要になる。

今回のNoSQL理解を踏まえると、次は以下を深掘りすると実務で使いやすい。

- パーティションキー設計
- ソートキーとレンジクエリ
- GSI/LSIの使い分け
- 一貫性モデル（強整合 / 結果整合）

---

## まとめ

- NoSQLは「RDBの代替」ではなく「適材適所の選択肢」
- ドキュメント指向DBは可変スキーマ・ネスト構造に強い
- JOIN/厳密トランザクション中心の領域はRDBが依然として強い
- 実務では「データ構造」より先に「アクセスパターン」を見ると選定しやすい

---

## 参考文献・リンク

- [MongoDB Docs: Documents](https://www.mongodb.com/docs/manual/core/document/)
- [MongoDB Docs: Data Modeling Introduction](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)
- [Firebase Docs: Cloud Firestore Data model](https://firebase.google.com/docs/firestore/data-model)
- [AWS Docs: What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [Redis Docs](https://redis.io/docs/)
- [Google Cloud: BigQuery overview](https://cloud.google.com/bigquery/docs/introduction)
- [Neo4j Docs](https://neo4j.com/docs/)
- [PostgreSQL Documentation: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
