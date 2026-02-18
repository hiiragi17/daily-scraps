---
title: '今日学んだこと：nginxに関して'
description: 'nginxに関して'
pubDate: 2026-2-18
tags: ['nginx']
draft: false
customSlug: 'nginx_learning'
---

## 概要

今日はnginxについて学んだ。

### 学んだこと

nginx（エンジンエックス）は、軽量かつ高性能なWebサーバソフトウェア。
同時接続を効率よく処理するため、イベント駆動モデルを採用しており、
静的ファイルの配信からリバースプロキシ、ロードバランサまで幅広く活用されている。

高性能・低リソース消費：少ないメモリ・CPUリソースで高負荷に耐える。
イベント駆動アーキテクチャ：リクエストごとにプロセスを作らず、イベントループで多接続を効率的にさばく。
リバースプロキシ機能：バックエンドアプリケーション（PHP, Node.jsなど）との橋渡し。
ロードバランサ機能：複数バックエンドへのリクエスト分散が可能。
設定ファイルがシンプルで直感的。

pumaはRubyで書かれているが、nginxはCで書かれている。
速度差は圧倒的にnginxが高速で多機能。

### 参考文献

https://zenn.dev/sonicmoov/articles/2f5e2573c64572

https://qiita.com/fooramu/items/818f54b75a14832d9d16

https://blog.mothule.com/web/nginx/web-nginx-getting-started-step3-on-mac#puma%E3%81%A8%E3%81%AF

---


