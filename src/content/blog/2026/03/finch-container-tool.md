---
title: '今日学んだこと：Finch - AWSが作ったDocker Desktop代替ツール'
description: 'AWSが開発したオープンソースのコンテナ開発クライアントツール「Finch」の概要・構成・Docker Desktopとの比較をまとめた'
pubDate: 2026-03-10
tags: ['AWS', 'Finch', 'Docker', 'コンテナ', 'CLI', 'containerd']
draft: false
customSlug: 'finch-container-tool'
---

## Finch とは

AWSが開発・公開している、**オープンソースのコンテナ開発用クライアントツール**。

簡単に言うと「**Docker Desktop の代替**」として使えるツール。

---

## 生まれた背景

Docker Desktop は2022年に**有料化**された（企業規模によっては有償ライセンスが必要）。
これを受けてAWSが「無料で使えるオープンソースの代替を作ろう」と開発したのが Finch 。

---

## Finch の構成要素

Finch は複数のOSSを組み合わせて作られている。

```
Finch（CLIフロントエンド）
  ↓
Lima（macOS上でLinux VMを動かす）
  ↓
containerd（コンテナランタイム）
  ↓
nerdctl（containerd向けのDocker互換CLI）
  ↓
BuildKit（イメージビルドエンジン）
```

ユーザーは Finch コマンドを叩くだけで、裏側の複雑な構成を意識せずに使える。

---

## Docker との互換性

コマンドがほぼ同じなので、Dockerを使ったことがあれば即使える。

```bash
# Docker                          # Finch
docker build -t myapp .       →   finch build -t myapp .
docker run -p 3000:3000 myapp →   finch run -p 3000:3000 myapp
docker compose up             →   finch compose up
docker ps                     →   finch ps
docker images                 →   finch images
```

---

## インストール（Mac）

```bash
# Homebrewで一発インストール
brew install --cask finch

# 初期化（初回のみ・Linux VMのセットアップが走る）
finch vm init

# VMの起動
finch vm start
```

---

## Docker Desktop との比較

| 項目 | Docker Desktop | Finch |
|---|---|---|
| 料金 | 大企業は有料 | 完全無料 |
| ライセンス | 商用利用に制限あり | オープンソース（Apache 2.0）|
| GUIダッシュボード | あり | なし（CLI専用）|
| Docker互換性 | 完全互換 | ほぼ互換 |
| 開発元 | Docker社 | AWS |
| 内部ランタイム | Docker Engine | containerd |

---

## 注意点

### Docker コマンドはそのまま使えない

Finch を入れても `docker` コマンドは `finch` に置き換える必要がある。
`docker` コマンドのまま使いたい場合はエイリアスを設定する。

```bash
# ~/.zshrc に追加
alias docker="finch"
alias docker-compose="finch compose"
```

### 一部のDocker特有機能は未対応

Docker Socket（`/var/run/docker.sock`）を直接使うツールなどは動作しない場合がある。

---

## まとめ

- **何のため？** → コンテナの開発・実行環境をローカルに構築するため
- **Docker Desktopとの違い？** → 無料・OSSで、裏側がcontainerd
- **Docker コマンドは使える？** → `finch` に置き換えるだけでほぼ同じ感覚
- **誰が向いている？** → Docker Desktop の費用を避けたい人・AWS環境で統一したい人
