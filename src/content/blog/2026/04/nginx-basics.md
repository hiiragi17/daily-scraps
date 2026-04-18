---
title: '今日学んだこと：Nginxの基本に関して'
description: 'Nginxとは何か、リバースプロキシ・静的ファイル配信・ロードバランシングの仕組みと設定例を整理した。'
pubDate: 2026-04-18
tags: ['Nginx', 'インフラ', 'ネットワーク', 'リバースプロキシ', 'Webサーバー']
draft: false
customSlug: 'nginx-basics'
---

Nginxは「**高速で軽量なWebサーバー兼リバースプロキシ**」だ。ブラウザからのリクエストを受け取り、静的ファイルを返したり、背後のアプリサーバーに橋渡ししたりする。受付係に近い存在で、Webシステムのフロントに立ちさまざまな仕事をこなす。

---

## Webサーバーとしての基本

ブラウザがURLにアクセスすると、リクエストはサーバーに届き、HTMLや画像が返ってくる。この「返す役」を担うのがWebサーバーだ。

Nginxが担う役割は主に3つある。

**Webサーバー** — HTMLや画像・CSSなどの静的ファイルをそのままクライアントに返す。

**リバースプロキシ** — リクエストを背後のアプリサーバー（Rails・Node.jsなど）に転送する。

**ロードバランサー** — 複数のアプリサーバーにリクエストを分散する。

---

## リバースプロキシとは

プロキシには2種類ある。フォワードプロキシはクライアント側に置いてインターネットへの出口を管理するもの。リバースプロキシはサーバー側に置いてクライアントからのアクセスを内部に振り分けるものだ。

```
[ブラウザ]
    ↓
[Nginx]  ← クライアントから見える唯一の窓口
    ↓
[アプリサーバー]（Rails / Node.js など）
```

クライアントにはNginxだけが見える。アプリサーバーの存在を隠すことで、セキュリティを高めたり構成変更を柔軟に行ったりできる。

---

## なぜNginxが使われるのか

### 非同期処理で高負荷に強い

ApacheなどのWebサーバーはリクエストごとにプロセスやスレッドを生成する方式が多い。接続数が増えるほどメモリ消費が増し、限界が来やすい。

Nginxはイベント駆動・非同期処理を採用している。少ないプロセスで大量の接続を同時に捌けるため、高トラフィック環境でも安定して動く。

### 静的ファイル配信が得意

CSS・JS・画像などはRailsやNode.jsを通す必要がない。Nginxが直接返すことで、アプリサーバーの負荷を大幅に減らせる。

### SSLの終端処理ができる

HTTPSの暗号化・復号をNginxが担う（SSLターミネーション）。アプリサーバーは平文のHTTPを受け取るだけでよくなる。

---

## 基本的な設定例

### リバースプロキシの最小構成

```nginx
server {
    listen 80;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

80番ポートで受け取ったリクエストを、すべてlocalhost:3000（アプリサーバー）に転送する。

### 静的ファイルとアプリの振り分け

```nginx
server {
    listen 80;

    location /images/ {
        root /var/www;
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

`/images/` へのリクエストはNginxが直接ファイルを返し、それ以外はアプリサーバーに渡す。

### ロードバランシング

```nginx
upstream app {
    server 192.168.1.1;
    server 192.168.1.2;
}

server {
    listen 80;

    location / {
        proxy_pass http://app;
    }
}
```

`upstream` ブロックでサーバーグループを定義し、`proxy_pass` で振り分け先として指定する。デフォルトはラウンドロビン（順番に割り当て）で動く。

---

## ApacheとNginxの違い

| 項目 | Nginx | Apache |
|---|---|---|
| 処理方式 | 非同期・イベント駆動 | プロセス / スレッド |
| 高負荷時 | 安定しやすい | メモリ消費が増えやすい |
| 静的ファイル | 高速 | 普通 |
| 設定の柔軟性 | シンプル | 高い（`.htaccess` 等） |

動的なコンテンツが中心でモジュールを細かく制御したい場合はApacheが向く。高トラフィックな環境や静的ファイルが多い場合はNginxの方が有利なことが多い。

---

## まとめ

- Nginxはリバースプロキシ・静的ファイル配信・ロードバランサーの3役を担うWebサーバーだ
- イベント駆動・非同期処理により高負荷でも安定して動く
- `proxy_pass` でアプリサーバーへの転送、`upstream` でロードバランシングを設定できる
- SSLターミネーションをNginxに任せることでアプリサーバーの実装をシンプルに保てる
- Apacheと比べて設定はシンプルで、高トラフィック・静的コンテンツの多い環境に強い

---

## 参考文献・リンク

- [Nginx公式ドキュメント](https://nginx.org/en/docs/)
- [Nginx入門 - Nginxを使い始める](https://nginx.org/en/docs/beginners_guide.html)
- [MDN Web Docs：プロキシサーバーとトンネリング](https://developer.mozilla.org/ja/docs/Web/HTTP/Guides/Proxy_servers_and_tunneling)
- [DigitalOcean：Understanding Nginx HTTP Proxying, Load Balancing, Buffering, and Caching](https://www.digitalocean.com/community/tutorials/understanding-nginx-http-proxying-load-balancing-buffering-and-caching)

---
