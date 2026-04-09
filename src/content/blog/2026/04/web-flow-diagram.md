---
title: 'WebのURLを入力してからレスポンスが返るまでの流れ'
description: 'ユーザーがURLを入力してからレスポンスが返るまでの流れ——DNS、ロードバランサー、サーバー、DBの役割と通信の方向を図解する。'
pubDate: 2026-04-09
tags: ['ネットワーク', 'インフラ', 'DNS', 'ロードバランサー', 'HTTP']
draft: false
customSlug: 'web-flow-diagram'
---

ブラウザにURLを入力してからページが表示されるまで、裏側ではいくつかのコンポーネントが連携して動いている。ざっくりとした全体像を図で整理する。

---

## 全体の流れ

<div style="margin: 2rem 0; overflow-x: auto; text-align: center;">
<svg viewBox="0 0 780 680" xmlns="http://www.w3.org/2000/svg" style="width: 100%; max-width: 780px; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif;">

  <rect width="780" height="680" fill="#12131f" rx="12"/>

  <defs>
    <marker id="arr-b" viewBox="0 0 10 7" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="#5B9CF6"/>
    </marker>
    <marker id="arr-o" viewBox="0 0 10 7" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0,10 3.5,0 7" fill="#E8823A"/>
    </marker>
    <marker id="arr-g" viewBox="0 0 8 6" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#555"/>
    </marker>
  </defs>

  <!-- LEGEND -->
  <line x1="20" y1="26" x2="68" y2="26" stroke="#5B9CF6" stroke-width="2.5" marker-end="url(#arr-b)"/>
  <text x="76" y="31" fill="#bbb" font-size="13">Inbound（リクエスト）</text>
  <line x1="320" y1="26" x2="368" y2="26" stroke="#E8823A" stroke-width="2.5" stroke-dasharray="6,3" marker-end="url(#arr-o)"/>
  <text x="376" y="31" fill="#bbb" font-size="13">Outbound（レスポンス）</text>
  <line x1="20" y1="44" x2="760" y2="44" stroke="#252635" stroke-width="1"/>

  <!-- 1. User → DNS: ドメイン名 -->
  <line x1="350" y1="82" x2="499" y2="82" stroke="#5B9CF6" stroke-width="2" marker-end="url(#arr-b)"/>
  <text x="424" y="74" fill="#999" font-size="12" text-anchor="middle">ドメイン名</text>

  <!-- 2. DNS → User: IPアドレス -->
  <line x1="499" y1="108" x2="350" y2="108" stroke="#E8823A" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arr-o)"/>
  <text x="424" y="124" fill="#999" font-size="12" text-anchor="middle">IPアドレス</text>

  <!-- 3. User → LB: HTTPリクエスト -->
  <line x1="244" y1="128" x2="316" y2="238" stroke="#5B9CF6" stroke-width="2" marker-end="url(#arr-b)"/>
  <text x="241" y="188" fill="#999" font-size="12" text-anchor="end">HTTPリクエスト</text>

  <!-- 4. LB → User: HTTPレスポンス -->
  <line x1="416" y1="238" x2="278" y2="128" stroke="#E8823A" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arr-o)"/>
  <text x="420" y="176" fill="#999" font-size="12" text-anchor="start">HTTPレスポンス</text>

  <!-- 5. LB → S1 -->
  <line x1="268" y1="308" x2="114" y2="420" stroke="#5B9CF6" stroke-width="2" marker-end="url(#arr-b)"/>

  <!-- 6. LB → S2 -->
  <line x1="380" y1="308" x2="379" y2="420" stroke="#5B9CF6" stroke-width="2" marker-end="url(#arr-b)"/>

  <!-- 7. LB → S3 -->
  <line x1="492" y1="308" x2="646" y2="420" stroke="#5B9CF6" stroke-width="2" marker-end="url(#arr-b)"/>

  <!-- 10. S1 → DB: gray dashed (全サーバーがDBに接続可能) -->
  <line x1="186" y1="486" x2="270" y2="590" stroke="#444" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#arr-g)"/>

  <!-- 8. S2 → DB: SQLクエリ -->
  <line x1="358" y1="486" x2="347" y2="590" stroke="#5B9CF6" stroke-width="2" marker-end="url(#arr-b)"/>
  <text x="316" y="542" fill="#999" font-size="12" text-anchor="end">SQLクエリ</text>

  <!-- 9. DB → S2: 結果セット -->
  <line x1="400" y1="590" x2="400" y2="486" stroke="#E8823A" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arr-o)"/>
  <text x="410" y="538" fill="#999" font-size="12" text-anchor="start">結果セット</text>

  <!-- NODES (drawn on top of arrows) -->

  <!-- User -->
  <rect x="170" y="62" width="180" height="66" rx="8" fill="#3D4451"/>
  <text x="260" y="90" fill="white" font-size="15" font-weight="bold" text-anchor="middle">ユーザー</text>
  <text x="260" y="111" fill="#aaa" font-size="12" text-anchor="middle">URLを入力</text>

  <!-- DNS -->
  <rect x="500" y="62" width="222" height="66" rx="8" fill="#3A3F4B"/>
  <text x="611" y="90" fill="white" font-size="15" font-weight="bold" text-anchor="middle">DNSサーバー</text>
  <text x="611" y="111" fill="#aaa" font-size="12" text-anchor="middle">名前解決</text>

  <!-- Load Balancer -->
  <rect x="250" y="238" width="260" height="70" rx="8" fill="#6B5FAD"/>
  <text x="380" y="266" fill="white" font-size="16" font-weight="bold" text-anchor="middle">ロードバランサー</text>
  <text x="380" y="287" fill="#d0caff" font-size="12" text-anchor="middle">リクエストを分配</text>

  <!-- Server 1 -->
  <rect x="25" y="420" width="178" height="66" rx="8" fill="#1B6B47"/>
  <text x="114" y="458" fill="white" font-size="14" font-weight="bold" text-anchor="middle">サーバー 1</text>

  <!-- Server 2 -->
  <rect x="290" y="420" width="178" height="66" rx="8" fill="#1B6B47"/>
  <text x="379" y="458" fill="white" font-size="14" font-weight="bold" text-anchor="middle">サーバー 2</text>

  <!-- Server 3 -->
  <rect x="557" y="420" width="178" height="66" rx="8" fill="#1B6B47"/>
  <text x="646" y="458" fill="white" font-size="14" font-weight="bold" text-anchor="middle">サーバー 3</text>

  <!-- Database -->
  <rect x="268" y="590" width="220" height="70" rx="8" fill="#8B5E00"/>
  <text x="378" y="620" fill="white" font-size="15" font-weight="bold" text-anchor="middle">データベース</text>
  <text x="378" y="641" fill="#FFD166" font-size="12" text-anchor="middle">データの読み書き</text>

</svg>
</div>

---

## 各ステップの解説

### ① DNS解決

ブラウザはまず「このドメイン名に対応するIPアドレスは何か」をDNSサーバーに問い合わせる。DNSサーバーが名前解決を行い、IPアドレスをブラウザに返す。

重要なのは、**このIPアドレスはロードバランサーのIP**であるという点だ。ユーザーのブラウザはどのサーバーに振り分けられるかを知らず、LBのIPに接続するだけで、LBが裏側でサーバーを選んでくれる。

### ② ロードバランサーへのHTTPリクエスト

DNS解決で得たIPアドレスに向けてHTTPリクエストを送る。受け取るのはロードバランサーだ。

### ③ サーバーへの振り分け

ロードバランサーは受け取ったリクエストを複数あるサーバーのどれかに振り分ける。どのサーバーに割り振るかはラウンドロビンや負荷状況などに応じた手法で決まる。

### ④ データベースアクセス

リクエストを受け取ったサーバーは必要に応じてデータベースにSQLクエリを送り、結果セットを受け取る。その結果をもとにレスポンスを生成する。図のグレーの破線は「どのサーバーもDBに接続できる」ことを示している。

### ⑤ レスポンスの返却

生成したレスポンスはロードバランサーを経由してユーザーに返る。HTTPレスポンスは来た経路を逆に辿る形になる。

---

## インバウンド / アウトバウンドとは

図の凡例にある「Inbound（リクエスト）」「Outbound（レスポンス）」は、**自分たちのインフラから見た通信の方向**を指す。

- **Inbound**：外部からインフラへの通信（ユーザー → ロードバランサーなど）
- **Outbound**：インフラから外部への通信（ロードバランサー → ユーザーなど）

AWSではセキュリティグループの「インバウンドルール」「アウトバウンドルール」として、この方向ごとにポートやIPの許可を設定する。インフラを触るときにすぐ出てくる概念なので、早めに頭に入れておくと役立つ。

---

## 実際の現場ではもう少し登場人物が多い

この図はざっくりとした概念図だ。実際のプロダクションでは以下のようなコンポーネントが加わることが多い。

| コンポーネント | 役割 | 例 |
|---|---|---|
| CDN | 静的コンテンツのキャッシュ・配信 | CloudFront, Cloudflare |
| WAF | 悪意あるリクエストのブロック | AWS WAF |
| キャッシュ層 | DB負荷軽減 | Redis, Memcached |
| 複数AZ | 可用性向上のための地理分散 | AWS Availability Zones |

---

## 一言でまとめると

> **URL → DNS解決 → ロードバランサー → サーバー → DB → レスポンス**の往復が、Webの基本的な通信経路だ。

ざっくりとした流れとしてはこの図の通りで、各コンポーネントの役割とInbound/Outboundの方向を押さえておくと、クラウドのセキュリティ設定やネットワーク設計の話が格段に理解しやすくなる。
