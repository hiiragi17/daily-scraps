---
title: '今日学んだこと：Shoryuken::Worker vs ECS Task'
description: '非同期処理という目的は似ているが、レイヤーが全く異なる Shoryuken::Worker と ECS Task の違いと使い分け'
pubDate: 2026-03-04
tags: ['Ruby', 'AWS', 'ECS', 'Shoryuken', 'SQS']
draft: false
customSlug: 'shoryuken-vs-ecs-task'
---

## 概要

「非同期処理」という目的は似ているが、レイヤーが全く異なる。

| | Shoryuken::Worker | ECS Task |
|---|---|---|
| **レイヤー** | アプリケーション層 | インフラ層 |
| **何者か** | Ruby の非同期ジョブ処理ライブラリ | AWS のコンテナ実行環境 |
| **キュー** | Amazon SQS | なし（直接起動） |
| **単位** | メソッド1回分の処理 | コンテナ1台分の起動 |

---

## Shoryuken::Worker とは

SQS のメッセージを受け取って処理する **Ruby のワーカー**。

```ruby
class HardWorker
  include Shoryuken::Worker

  shoryuken_options queue: 'hello', auto_delete: true

  def perform(sqs_msg, body)
    puts "Doing hard work with #{body}"
  end
end
```

- Rails プロセスの**中**で動く
- SQS にメッセージが来たら `perform` を呼ぶ
- Sidekiq の SQS 版イメージ

---

## ECS Task とは

**Amazon Elastic Container Service (ECS)** が提供するコンテナの実行単位。

```
Cluster（クラスター）
  └── Service（サービス）
        └── Task（タスク）
              └── Container（コンテナ）
```

### Task Definition（タスク定義）

タスクの「設計図」。以下を定義する。

| 項目 | 内容 |
|------|------|
| `image` | 使用する Docker イメージ |
| `cpu` / `memory` | リソース割り当て |
| `environment` | 環境変数 |
| `secrets` | Secrets Manager / SSM から取得する機密情報 |

### タスクの実行方法

**① Service として常時起動**（Web サーバーなど）

```bash
aws ecs create-service \
  --cluster my-cluster \
  --service-name my-service \
  --task-definition my-app:1 \
  --desired-count 2
```

**② Standalone Task として単発実行**（バッチ処理など）

```bash
aws ecs run-task \
  --cluster my-cluster \
  --task-definition my-app:1 \
  --launch-type FARGATE
```

### Task Role と Execution Role の違い

| ロール | 目的 | 例 |
|--------|------|-----|
| **Task Role** | コンテナ内アプリが AWS を操作する権限 | S3 へのアクセス、DynamoDB の読み書き |
| **Task Execution Role** | ECS がコンテナを起動するための権限 | ECR からイメージ pull、CloudWatch にログ送信 |

---

## 構造で比較

```
【Shoryuken の場合】

SQS → Shoryuken::Worker（Rails プロセス内） → perform 実行
         ↑
    ECS Task の中で動いている


【ECS Task 単体の場合】

スケジューラー / API → ECS Task 起動 → コンテナ全体が1ジョブ
```

### つまりこういう関係

```
ECS Task（コンテナ）
  └── Rails アプリ
        └── Shoryuken::Worker が SQS を polling して処理
```

**ECS Task は Shoryuken が動く「箱」**、Shoryuken は箱の中で動く「処理ロジック」。

---

## どちらを使う？の判断基準

| ユースケース | 向いてる方 |
|---|---|
| メール送信、通知など軽い非同期処理 | Shoryuken::Worker |
| 大量データの ETL・バッチ | ECS Task（単発起動） |
| 複数ジョブを並列キュー処理 | Shoryuken（SQS でスケール） |
| 処理ごとにメモリを大量消費する | ECS Task（終わったら消える） |
| 夜間バッチ（毎日1回だけ） | ECS Scheduled Task |

---

## まとめ

- **Shoryuken::Worker** → アプリ層。SQS のメッセージを受けて `perform` を実行するRubyのライブラリ
- **ECS Task** → インフラ層。Dockerコンテナの実行単位
- 両者は対立しない。**ECS Task の中で Shoryuken が動く**という入れ子の関係
- 通知やデータ更新は Shoryuken、重い定期バッチは ECS Scheduled Task、という使い分けが基本
