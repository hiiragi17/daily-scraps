---
title: '今日学んだこと：Webアプリケーションサーバーの全体像に関して'
description: 'ブラウザからAWS ECSのコンテナに到達するまでのリクエストフロー、HTTPメソッドとRESTの考え方、デプロイの流れを整理した。'
pubDate: 2026-04-16
tags: ['ネットワーク', 'インフラ', 'AWS', 'ECS', 'Nginx', 'HTTP', 'Rails']
draft: false
customSlug: 'web-app-architecture'
---
 
Webアプリの全体構成を「ブラウザからコンテナまで」の一本道で追いかけると、各コンポーネントの役割がすっきり見えてくる。今回はリクエストの流れ、HTTPメソッドの使い分け、デプロイフローをまとめて整理する。
 
---
 
## リクエストの旅路
 
![Webアプリケーション全体構成図](/daily-scraps/images/posts/2026-04-16_web-architecture.png)
 
ブラウザからRailsアプリのコンテナに届くまで、リクエストは以下の順番で中継される。
 
```
ブラウザ / クライアント
    ↓  HTTPS (port 443)
SSL / TLS（暗号化・ハンドシェイク）
    ↓
Nginx（Webサーバー）
    ├── 静的ファイル配信
    ├── ロードバランサー
    └── リバースプロキシ
    ↓  リクエスト転送
ALB（Application Load Balancer）
    ↓  ヘルスチェック・振り分け
ECS Cluster
    ├── Service A → Task（Railsコンテナ）
    └── Service B → Task（Railsコンテナ）
```
 
各ステップを順に見ていく。
 
---
 
## SSL/TLS — 通信の暗号化
 
ブラウザがサーバーに接続するとき、まずSSL/TLSハンドシェイクが行われる。これにより通信内容が暗号化され、第三者に盗み見されるリスクを防ぐ。ポートは443を使う。
 
鍵長やアルゴリズムで暗号の強度が変わり、SSL証明書で「このサーバーは本物だ」と認証される。ブラウザがHTTPSでアクセスしたとき、左側にCookieやCSRFトークン、APIトークンといった認証情報がヘッダーに載って飛んでいく。
 
---
 
## Nginx — Webサーバーの役割
 
Nginxはport 80 / 443でリクエストを受け、L7（HTTPレイヤー）でルーティングを行う。主な役割は3つ。
 
**静的ファイル配信** — CSS・JS・画像など、Railsを通す必要がないファイルをNginxが直接返す。アプリサーバーの負荷を減らせる。
 
**ロードバランサー** — 複数のアプリサーバーにリクエストを分散する。
 
**リバースプロキシ** — クライアントから見るとNginxが最終的なサーバーに見えるが、実際にはリクエストを背後のアプリサーバーに転送している。
 
---
 
## ALB → ECS — コンテナへの到達
 
Nginxを通過したリクエストはALB（Application Load Balancer）に届く。ALBはヘルスチェックで各タスクの死活を確認しつつ、正常なタスクにリクエストを振り分ける。
 
ECS Cluster内ではServiceごとに複数のTask（= Railsコンテナ）が動いている。Serviceが「常にN台のタスクを維持する」ように管理してくれるので、1つ落ちても自動で補充される。
 
---
 
## レスポンスの戻り道
 
リクエストが届いたら、レスポンスは逆の経路を辿ってブラウザに返る。
 
レスポンスには **ステータスコード** と **Content-Type** が含まれる。
 
| ステータスコード | 意味 |
|---|---|
| 200 | 成功 |
| 404 | リソースが見つからない |
| 500 | サーバー内部エラー |
 
Content-Typeはレスポンスのデータ形式を示すヘッダーだ。`text/html` ならHTMLページ、`application/json` ならJSON形式のデータを返していることがわかる。
 
---
 
## HTTPメソッドとRESTの基本
 
![HTTPメソッドとREST設計](/daily-scraps/images/posts/2026-04-16_http-methods.png)
 
リクエストには「何をしたいか」を示すHTTPメソッドが付く。RESTの考え方と合わせて整理するとこうなる。
 
| メソッド | 用途 | bodyの有無 | 補足 |
|---|---|---|---|
| **GET** | リソースの取得 | なし | `?key=value` でクエリパラメーターを送る。URIに長さ上限あり |
| **POST** | データの送信・新規作成 | あり | form-data / JSON / multipart で送れる |
| **PUT** | リソースの完全な置き換え | あり | 指定したリソース全体を送信データで上書き |
| **PATCH** | リソースの部分更新 | あり | 変更したいフィールドだけ送る |
| **DELETE** | リソースの削除 | なし | 指定したリソースを削除する |
 
ブラウザのフォーム送信やリンククリックで使われるのはほとんど **GET と POST** だ。PUT / PATCH / DELETEはAPIで使うことが多く、Railsでは `routes.rb` の `resources` で自動的にこれらのメソッドにマッピングされる。
 
---
 
## パスパラメーターとクエリパラメーター
 
RESTful URL設計では、パラメーターの渡し方に2種類ある。
 
| 種類 | 形式 | 使い分け |
|---|---|---|
| **パスパラメーター** | `/agents/10` | 特定のリソースを指定する |
| **クエリパラメーター** | `?agent=10&status=active` | フィルター・条件を指定する |
 
「IDで1つのリソースを取りたい」ならパス、「条件で絞り込みたい」ならクエリ。これがRESTの基本ルールだ。
 
---
 
## Content-Type — データ形式の宣言
 
Content-Typeはリクエスト・レスポンスの両方で「このデータは何の形式か」を示すヘッダーだ。
 
| Content-Type | 用途 |
|---|---|
| `application/json` | APIでのJSON送受信 |
| `text/html` | HTMLページの返却 |
| `text/plain` | プレーンテキスト |
| `multipart/form-data` | ファイルアップロード |
 
ファイルアップロード時は `multipart/form-data` が使われる。バウンダリーと呼ばれる区切り文字で本文とファイルを分離して送る仕組みだ。
 
---
 
## デプロイフロー — コードからコンテナへ
 
コードを書いてからECS上で動くまでの流れはこうなる。
 
```
コード push
    ↓
CircleCI（Build → Push → Deploy）
    ↓  Docker イメージを push
ECR（Docker イメージ保管）
    ↓  イメージを pull
ECS Cluster → Task として起動
```
 
**CircleCI** がコードの変更を検知してDockerイメージをビルドし、**ECR（Elastic Container Registry）** にpushする。ECSはECRから最新のイメージを取得して新しいタスクとして起動する。CI/CDパイプラインがこの一連の流れを自動化してくれる。
 
---
 
## まとめ
 
- リクエストは **ブラウザ → SSL/TLS → Nginx → ALB → ECS Task（Railsコンテナ）** の順で届く
- Nginxは静的ファイル配信・ロードバランシング・リバースプロキシの3役を担う
- HTTPメソッドはGET/POSTが基本、PUT/PATCH/DELETEはAPI向け
- パスパラメーターは「特定リソースの指定」、クエリパラメーターは「条件の指定」
- デプロイは **CircleCI → ECR → ECS** の自動パイプラインで回る
---
 
## 参考文献・リンク
 
- [MDN Web Docs：HTTP の概要](https://developer.mozilla.org/ja/docs/Web/HTTP/Guides/Overview)
- [MDN Web Docs：HTTP リクエストメソッド](https://developer.mozilla.org/ja/docs/Web/HTTP/Reference/Methods)
- [AWS公式：Elastic Load Balancing](https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/introduction.html)
- [AWS公式：Amazon ECS](https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/Welcome.html)
- [AWS公式：Amazon ECR](https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/what-is-ecr.html)
- [Nginx公式ドキュメント](https://nginx.org/en/docs/)
- [RESTful Web API Design（Microsoft）](https://learn.microsoft.com/ja-jp/azure/architecture/best-practices/api-design)
---