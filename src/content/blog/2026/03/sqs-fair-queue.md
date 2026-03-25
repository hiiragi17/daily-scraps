---
title: '今日学んだこと：SQS Fair Queue と Noisy Neighbor 問題'
description: 'AWS が 2025 年にリリースした Amazon SQS の新機能「Fair Queue」の仕組みと、Noisy Neighbor 問題をどう解決するかを整理した'
pubDate: 2026-03-25
tags: ['AWS', 'SQS', 'Shoryuken', 'キュー', 'マルチテナント']
draft: false
customSlug: 'sqs-fair-queue'
---

## SQS Fair Queue とは

2025 年中頃に AWS がリリースした Amazon SQS の新機能。

「フェアキューイング」はもともと、複数のプロセスや参加者がシステムリソース（CPU や帯域幅など）を公平に共有できるようにするスケジューリング技術で、SQS Fair Queue はその考え方をメッセージ処理に適用したもの。

---

## 解決する問題：Noisy Neighbor

通常の SQS では、あるテナントが一度に大量のメッセージを送ると、そのすべてが処理し終わるまで他のテナントのメッセージが待たされてしまう。

```
【Fair Queue なし】
テナント A: メッセージ 1000 件 → 全部先に処理される
テナント B: メッセージ   10 件 → ずっと待たされる
```

```
【Fair Queue あり】
テナント A が大量送信
  → A は Noisy Neighbor と判定
  → B, C, D のメッセージを優先的に配信
  → A のメッセージも余剰スレッドで処理される
```

---

## 仕組み

Amazon SQS は、処理中（in-flight 状態）のメッセージのテナントごとの分布を監視している。

あるテナントの in-flight メッセージが他と比べて不釣り合いに多くなると、そのテナントを **Noisy Neighbor** と判定し、他のテナントのメッセージを優先的に配信する。

コンシューマー側の実装変更は一切不要。稼働中のシステムにも無停止で導入できる。

---

## 使い方

有効化するには、メッセージ送信時に `MessageGroupId` を付与するだけ。

Shoryuken の場合：

```ruby
MyWorker.perform_async('data', message_group_id: "tenant_#{tenant_id}")
```

`tenant_id` の部分には、公平性を担保したい単位（テナント ID、ユーザー ID、処理種別など）を入れる。

---

## キュー種別との比較

| 種別 | 順序保証 | スループット | Noisy Neighbor 対策 |
|---|---|---|---|
| Standard Queue | なし | 無制限 | ❌ |
| FIFO Queue | あり | 制限あり（300 TPS） | ある程度 |
| Fair Queue | なし | 無制限 | ✅ 自動対応 |

FIFO キューは in-flight メッセージ数を制限することで Noisy Neighbor をある程度防ぐが、スループットも制限される。
Fair Queue は **高スループットを維持しながら公平性も確保**できる点が特徴。

---

## どんな場面で使えるか

複数のテナントやユーザーが同じキューを共有しているシステムで特に効果を発揮する。

たとえば：

- マルチテナント SaaS で、あるテナントのバッチ処理が他テナントのリアルタイム処理を圧迫している
- ユーザーごとに処理量が大きく異なり、ヘビーユーザーが軽量ユーザーの処理を遅延させている
- 複数の処理種別（優先度の異なるジョブなど）が同じキューに混在している

`message_group_id` を公平性の単位（テナント ID、ユーザー ID など）に設定するだけで対応できるので、導入コストは非常に低い。

---

## まとめ

- SQS Fair Queue は Noisy Neighbor 問題を解決するための新機能
- `MessageGroupId` を付けるだけで有効化でき、コンシューマーの変更は不要
- Standard Queue の高スループットと、FIFO Queue の公平性を両立している
- マルチテナント構成や処理量に偏りがあるシステムに導入を検討する価値がある
