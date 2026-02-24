---
title: '今日学んだこと：AWS SQSに関して'
description: 'AWS SQS（Simple Queue Service）に関して'
pubDate: 2026-2-24
tags: ['AWS', 'SQS']
draft: false
customSlug: 'aws_sqs_learning'
---

## 概要

今日はAWS SQSについて学んだ。

### 学んだこと

SQSはSimple Queue Serviceの略で、フルマネージドのキューイングサービス。

キューイングとは異なるソフトウェア間でデータの送受信をする手法の一つで、ソフトウェア間を直接データを渡すのではなく、第三者経由でデータを渡すことで、送信側と受信側が好きなときに処理を行うことができる。

そのキューイングができるサービスがSQS。

「やってほしい仕事」をキューに入れておくと、別のシステムが取り出して処理する。郵便ポストのようなイメージで、送り手と受け手が同時にオンラインでなくても大丈夫。

### 参考文献

https://qiita.com/miyuki_samitani/articles/e46ef9452fcd73f9d240

---



