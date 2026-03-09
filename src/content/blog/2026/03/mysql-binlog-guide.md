---
title: '今日学んだこと：MySQLのbinlog（バイナリログ）'
description: 'MySQLのバイナリログ（binlog）の概念・用途・記録形式・redo logとの違いをまとめた'
pubDate: 2026-03-09
tags: ['MySQL', 'Database', 'binlog', 'レプリケーション', 'バックアップ']
draft: false
customSlug: 'mysql-binlog-guide'
---

## 概要

binlog（バイナリログ）とは、MySQLが持つ「**データベースへのすべての変更を記録した日誌ファイル**」。

---

## まず「なぜ必要なのか」から

データベースを運用していると、こんな事故が起きる。

```
❌ 誰かが間違えて大量のデータを DELETE してしまった
❌ サーバーが突然クラッシュして、直近のデータが消えた
❌ 別のDBサーバーとデータを同期させたい
```

binlog はこれらをすべて解決する**保険**のような存在。

---

## binlog に記録されているもの

CREATE TABLE 文や INSERT 文といったデータベースの中身を変更する操作の履歴を追跡できる形で記録した情報であり、コミットされたトランザクションの情報が保存される。

具体的には…

```sql
-- これらがすべてbinlogに記録される
INSERT INTO properties VALUES (...);
UPDATE users SET name = '田中' WHERE id = 1;
DELETE FROM sessions WHERE expired_at < NOW();
CREATE TABLE new_table (...);
```

**SELECT は記録されません**（データを変更しないから）。

---

## binlog の主な用途 3つ

### 1. ポイントインタイムリカバリ（特定時点への復元）

データベースのバックアップをベースに、バックアップ時点から指定時点の間のbinlogを適用することで、指定時点のデータを復元できる。

```
昨夜0時のバックアップ ──→ 今朝10時までのbinlogを適用 ──→ 10時時点に復元！

例）
「今朝11時に誰かが間違えてDELETEした」
  → 昨夜のバックアップ + 11時直前までのbinlogで復元可能
```

### 2. レプリケーション（DBの複製・同期）

マスタスレーブ構成で2つ以上のデータベースサーバが存在する場合、マスタサーバからスレーブサーバにbinlogの内容を転送する。スレーブサーバがbinlogを適用して、マスタサーバのデータと一致性を保つ。

```
マスターDB（書き込み用）
    ↓ binlogをリアルタイム転送
スレーブDB（読み取り用）
    → 読み込みの負荷分散や、障害時のフェイルオーバーに使う
```

### 3. 変更の追跡・監査

「いつ・誰が・何を変えたか」を後から追いかけることができる。

---

## binlog の記録形式（3種類）

| 形式 | 内容 | 特徴 |
|---|---|---|
| **STATEMENT** | SQL文をそのまま記録 | 容量小・一部で非一致リスク |
| **ROW** | 変更された行データを記録 | 確実・容量大 |
| **MIXED** | 状況に応じて自動で切り替え | バランス型 |

MySQL 8.0.34 では `binlog_format` パラメータが廃止され、以降のバージョンでは行ベースのレプリケーションのみをサポートする予定。そのため、新しい MySQL レプリケーション設定には行ベースのログ記録を使用することが推奨される。

---

## binlog の確認方法

```sql
-- 保存されているbinlogファイルの一覧
SHOW BINARY LOGS;

-- 特定ファイルの中身を確認
SHOW BINLOG EVENTS IN 'binlog.000001';
```

コマンドラインからテキストで読むには `mysqlbinlog` コマンドを使う。

```bash
mysqlbinlog binlog.000001
```

サーバーはこれらのファイルをバイナリ形式で書き出す。内容をテキスト形式で表示するには、`mysqlbinlog` ユーティリティーを使用する。

---

## redo log との違い（混乱しやすい）

MySQLにはよく似た「redo log」も存在する。

| | **binlog** | **redo log** |
|---|---|---|
| 管理者 | MySQLサーバー層 | InnoDB（ストレージエンジン）層 |
| 目的 | レプリケーション・バックアップ | クラッシュ時の復旧 |
| 記録対象 | コミットされた変更 | コミット前も含む |

---

## まとめ

- **何のため？** → データの復元・DB間の同期・変更履歴の追跡
- **何が記録される？** → INSERT/UPDATE/DELETE/DDLなどの変更系操作
- **SELECTは？** → 記録されない
- **新しい設定では？** → MySQL 8.0.34以降は行ベース（ROW形式）一択

## 参考文献

- [MySQL 8.0 公式リファレンス「バイナリログ」](https://dev.mysql.com/doc/refman/8.0/ja/binary-log.html)
- [MySQL 8.0 公式「mysqlbinlog ユーティリティー」](https://dev.mysql.com/doc/refman/8.0/ja/mysqlbinlog.html)
- [AWS RDS公式「MySQL バイナリログにアクセスする」](https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.Binarylog.html)
- [MySQLのbinlogとredo logについて（株式会社アイ・プライド）](https://www.ipride.co.jp/blog/3660)
- [mysqlbinlog 使い方（Zenn）](https://zenn.dev/haggar/articles/48d597cdcf45be)
