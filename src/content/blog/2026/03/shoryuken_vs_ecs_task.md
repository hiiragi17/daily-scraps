---
title: '今日学んだこと：Shoryuken::Worker vs ECS Task'
description: 'Shoryuken::Worker と ECS Task の違い、役割、使い分けについて整理した'
pubDate: 2026-03-04
tags: ['Ruby', 'Rails', 'Shoryuken', 'AWS', 'ECS', 'SQS']
draft: false
customSlug: 'shoryuken_vs_ecs_task'
---

## 一言で言うと

| | Shoryuken::Worker | ECS Task |
|---|---|---|
| **レイヤー** | アプリケーション層 | インフラ層 |
| **何者か** | Ruby の非同期ジョブ処理ライブラリ | AWS のコンテナ実行環境 |
| **キュー** | Amazon SQS | なし（直接起動） |
| **単位** | メソッド1回分の処理 | コンテナ1台分の起動 |

---

## Shoryuken::Worker とは

SQS のメッセージを受け取って処理する **Ruby のワーカー**。Sidekiq の SQS 版というイメージ。

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

---

## ECS Task とは

**Amazon Elastic Container Service (ECS)** のコンテナ実行単位。タスク定義（設計図）をもとに実際にコンテナを起動する。

### ECS の主要コンポーネント

```
Cluster（クラスター）
  └── Service（サービス）
        └── Task（タスク）
              └── Container（コンテナ）
```

### Task Definition（タスク定義）の例

```json
{
  "family": "my-app",
  "containerDefinitions": [
    {
      "name": "web",
      "image": "nginx:latest",
      "cpu": 256,
      "memory": 512,
      "portMappings": [
        { "containerPort": 80, "hostPort": 80 }
      ]
    }
  ]
}
```

### タスクの実行方法

**① Service として常時起動**（Web サーバーなど常駐するもの）

```bash
aws ecs create-service \
  --cluster my-cluster \
  --service-name my-service \
  --task-definition my-app:1 \
  --desired-count 2
```

**② Standalone Task として単発実行**（バッチや1回限りのジョブ）

```bash
aws ecs run-task \
  --cluster my-cluster \
  --task-definition my-app:1 \
  --launch-type FARGATE
```

### Task Role と Execution Role の違い

よく混乱するポイント。

| ロール | 目的 | 例 |
|--------|------|-----|
| **Task Role** | コンテナ内アプリが AWS を操作する権限 | S3 アクセス、DynamoDB 読み書き |
| **Task Execution Role** | ECS がコンテナを起動するための権限 | ECR からイメージ pull、CloudWatch ログ送信 |

---

## 両者の関係

```
ECS Task（コンテナ）
  └── Rails アプリ
        └── Shoryuken::Worker が SQS を polling して処理
```

**ECS Task は Shoryuken が動く「箱」**、Shoryuken は箱の中で動く「処理ロジック」。

構造で比較すると：

```
【Shoryuken の場合】
SQS → Shoryuken::Worker（Rails プロセス内） → perform 実行
         ↑
    ECS Task の中で動いている

【ECS Task 単体の場合】
スケジューラー / API → ECS Task 起動 → コンテナ全体が1ジョブ
```

---

## どちらを使う？の判断基準

| ユースケース | 向いてる方 |
|---|---|
| メール送信、通知など軽い非同期処理 | Shoryuken::Worker |
| 大量データの ETL・バッチ | ECS Task（単発起動） |
| 複数ジョブを並列キュー処理 | Shoryuken（SQS でスケール） |
| 処理ごとにメモリを大量消費する | ECS Task（終わったら消える） |
| 夜間バッチ（毎日1回だけ） | ECS Scheduled Task |

Rails 環境だと、**通知やデータ更新は Shoryuken、重い定期バッチは ECS Scheduled Task** という使い分けが多い。

---

## まとめ

- Shoryuken は **SQS をポーリングして処理する Ruby ライブラリ**（アプリ層）
- ECS Task は **コンテナを動かす AWS の実行単位**（インフラ層）
- 関係は入れ子：ECS Task の中で Shoryuken が動く
- 軽い非同期処理は Shoryuken、重いバッチは ECS Task が向いている
