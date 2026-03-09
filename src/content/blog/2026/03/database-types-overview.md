---
title: '今日学んだこと：データベースの種類を整理する：OLTP・OLAPとSnowflakeの全体像'
description: 'OLTP/OLAPの違いからSnowflakeのアーキテクチャ・仮想ウェアハウス・独自機能・データパイプラインの全体像までをまとめた記事'
pubDate: 2026-03-07
tags: ['データベース', 'Snowflake', 'OLTP', 'OLAP', 'データウェアハウス']
draft: false
customSlug: 'database-types-overview'
---

## そもそもデータベースの種類を整理する

まず全体像を理解するために、データベースの用途を2つに分けて考える。

| 種類 | 目的 | 代表例 |
|------|------|--------|
| **OLTP**（トランザクション処理） | アプリの日常的な読み書き | MySQL, PostgreSQL |
| **OLAP**（分析処理） | 大量データの集計・分析 | Snowflake, BigQuery, Redshift |

RailsアプリのメインDBはOLTP。Snowflakeは**OLAP**の代表格。

---

## Snowflakeのアーキテクチャ

Snowflakeの最大の特徴は**3層に分かれた構造**。

```
┌─────────────────────────────┐
│       クラウドサービス層       │  ← 認証・メタデータ管理・クエリ最適化
└─────────────────────────────┘
┌─────────────────────────────┐
│      コンピュート層           │  ← クエリの実行エンジン（仮想ウェアハウス）
│  [WH-A] [WH-B] [WH-C]      │  ← 複数同時に動かせる
└─────────────────────────────┘
┌─────────────────────────────┐
│       ストレージ層            │  ← データの保存（S3など）
└─────────────────────────────┘
```

**ポイントはコンピュートとストレージが分離していること。**

他のDBだとデータの保存場所と処理するサーバーが一体化していますが、Snowflakeは別々なので：
- データはそのままでも、処理能力だけ増やせる
- 処理していない時間はコンピュートを止めてコスト削減できる

---

## 仮想ウェアハウスとは

Snowflakeの**コンピュートリソースの単位**です。「処理するためのサーバー群」だと思ってください。

```
同じデータに対して複数のウェアハウスが同時アクセスできる

[分析チーム用WH]  ─┐
[ETLバッチ用WH]   ─┼── 同じストレージのデータを参照
[ダッシュボード用WH]─┘
```

サイズはXS〜4XLまであり、大きいほど処理が速いですが料金も上がります。**クエリを投げていない時間は自動停止**させることができる。

---

## データの構造

SQL（RDB）と基本的に同じ構造なので、MySQLを知っていれば馴染みやすい。

```
アカウント
└── データベース（例: FACILO_DB）
    └── スキーマ（例: PUBLIC, ANALYTICS）
        └── テーブル（例: PROPERTIES, USERS）
            └── カラム・レコード
```

SQLもほぼ標準的なものが使える。

```sql
-- こんな感じで普通に書ける
SELECT
  prefecture,
  COUNT(*) AS property_count,
  AVG(price) AS avg_price
FROM properties
WHERE created_at >= '2024-01-01'
GROUP BY prefecture
ORDER BY property_count DESC;
```

---

## Snowflake独自の便利機能

### ① タイムトラベル

過去のデータ状態に戻れます。誤ってDELETEしても復元可能。

```sql
-- 1時間前のデータを参照
SELECT * FROM orders AT(offset => -3600);

-- 特定時刻のデータを参照
SELECT * FROM orders AT(timestamp => '2024-01-01 12:00:00'::timestamp);
```

### ② ゼロコピークローン

データをコピーせずにテーブルやDBのクローンを作れます。ストレージコストをかけずに本番データのコピー環境を作れるので、テストに便利。

```sql
-- 本番DBのクローンを一瞬で作成
CREATE DATABASE dev_db CLONE prod_db;
```

### ③ ステージ

S3などのファイルをSnowflakeに取り込む仕組み。CSVやJSONをそのまま読み込んでSQLで扱えます。

---

## データがSnowflakeに届くまでの流れ（全体像）

実際の現場ではこういう構成が多い。

```
[Railsアプリ]           [外部データ]
  MySQL/PostgreSQL   +   APIログ・CSVなど
         │                    │
         └──────┬─────────────┘
                ▼
         ETLツール（dbt, Airbyte, Embulkなど）
                │  データを変換・整形して流し込む
                ▼
          【Snowflake】
                │
         ┌──────┴──────┐
         ▼             ▼
    BIツール        データサイエンス
 (Looker, Metabase)  (Python分析など)
```

RailsアプリはMySQLで日常の読み書きをして、その**データをSnowflakeにコピーして分析する**という役割分担。

---

## まとめ

| 項目 | 内容 |
|------|------|
| 何者か | クラウド型データウェアハウス |
| 何に使うか | 大量データの分析・集計 |
| Railsとの関係 | メインDBとは別で、分析専用に使う |
| 強み | スケーリング容易・運用不要・SQL標準対応 |
| キーワード | 仮想ウェアハウス・タイムトラベル・ゼロコピークローン |

---

## 参考文献

- [Snowflake公式ドキュメント - Key Concepts & Architecture](https://docs.snowflake.com/en/user-guide/intro-key-concepts)
- [Snowflake公式ドキュメント - Virtual Warehouses](https://docs.snowflake.com/en/user-guide/warehouses)
- [Snowflake公式ドキュメント - Time Travel](https://docs.snowflake.com/en/user-guide/data-time-travel)
- [Snowflake公式ドキュメント - Zero-Copy Cloning](https://docs.snowflake.com/en/user-guide/tables-storage-considerations#label-cloning-tables)
- [AWS - OLTPとOLAPの違い](https://aws.amazon.com/jp/compare/the-difference-between-olap-and-oltp/)
