---
title: "今日学んだこと：ECSの配置とNAT Gatewayのコスト設計"
description: "ECSをパブリックサブネットに置くか、プライベートサブネットに置いてNAT GatewayやVPCエンドポイントを使うか。Public IPv4課金後の設計判断を整理した。"
pubDate: 2026-05-08
tags: ["AWS", "ECS", "VPC", "NAT Gateway", "コスト設計"]
draft: false
customSlug: "ecs-nat-gateway-cost-design"
---

前回までに、VPC、サブネット、ALB、ECS、RDS、セキュリティグループの流れを整理した。

今日はその続きとして、ECSを**パブリックサブネットに置くのか、プライベートサブネットに置くのか**を、NAT Gateway、Public IP、VPCエンドポイントのコストと合わせて整理する。

最初に結論を書くと、本番寄りの構成では、ECSはプライベートサブネットに置き、外部APIだけNAT Gateway経由、AWSサービスへの通信はVPCエンドポイント経由に逃がす形が基本になりやすい。

ただし、学習用や小規模構成では、NAT Gatewayの固定費を避けるためにPublic IP付きのECSで代用する判断もある。大事なのは、どちらが絶対に正しいかではなく、**通信経路と課金ポイントを理解して選ぶこと**だ。

---

## まずNAT Gatewayはどこに置くのか

インターネット向けに使うNAT Gatewayは、パブリックサブネットに置く。

理由は、NAT Gateway自身がインターネットゲートウェイへ出ていく必要があるからだ。

```text
インターネット
     ▲ ▼
   [IGW]
     │
  ┌──┼─────────────────────────┐
  │  ▼                          │
  │ パブリックサブネット         │
  │  [ALB]  [NAT Gateway]       │
  │            ▲                │
  │            │                │
  │ プライベートサブネット      │
  │  [ECS] ──→┘                 │
  │  [RDS]                      │
  └─────────────────────────────┘
```

プライベートサブネットのECSは、Public IPを持たない。そのため、そのままではインターネット上のAPIやパッケージレジストリに出られない。

そこで、プライベートサブネットのルートテーブルに次のような経路を追加する。

```text
0.0.0.0/0 → NAT Gateway
```

一方、NAT Gatewayが置かれているパブリックサブネット側は、インターネットゲートウェイへ向かう経路を持つ。

```text
0.0.0.0/0 → Internet Gateway
```

つまり、プライベートサブネットのECSから見ると、NAT Gatewayは「自分の代わりに外へ出てくれる出口」になる。

> 補足：AWSにはPrivate NAT Gatewayという種類もあるが、この記事ではインターネット向けの外向き通信で使うPublic NAT Gatewayを前提にしている。

---

## NAT Gatewayがしていること

NATは、Network Address Translationの略で、IPアドレスを書き換える仕組みだ。

プライベートサブネット内のECSは、たとえば `10.0.1.5` のようなプライベートIPを持つ。このIPはインターネット上ではそのまま使えない。

そこでNAT Gatewayが、外へ出る通信の送信元IPを自分のPublic IPに変換する。

```text
[ECS]
送信元: 10.0.1.5
    ↓
[NAT Gateway]
送信元を NAT Gateway の Public IP に変換
    ↓
[インターネット上の外部API]
    ↓
返事は NAT Gateway の Public IP に戻る
    ↓
[NAT Gateway]
元の通信を覚えているので 10.0.1.5 に戻す
    ↓
[ECS]
```

ここで重要なのは、NAT Gatewayは単に「IPを固定するためのもの」ではないということ。

本質は、**Public IPを持たないプライベートなリソースが、外向き通信を開始できるようにすること**だ。

---

## NAT Gatewayを通るかどうかの判断基準

ECSがNAT Gatewayを通るかどうかは、ざっくり言うと次のように決まる。

| ECSの配置 | Public IP | 外への出方 | NAT Gateway |
|---|---|---|---|
| パブリックサブネット | あり | ECS自身がIGW経由で出る | 基本的に通らない |
| プライベートサブネット | なし | NAT Gateway経由で出る | 通る |

Public IP付きのECSは、自分自身がインターネットへ出ていける。

一方、Public IPなしのECSは、自力では外へ出られない。そのため、インターネット向け通信にはNAT Gatewayなどの出口が必要になる。

この違いを理解しておくと、次のような混乱を避けやすい。

```text
ECSのIPが変わるからNAT Gatewayを通る
```

ではなく、正しくは次の理解になる。

```text
ECSがPublic IPを持たず、外向き通信の出口としてNAT Gatewayへルーティングしているから通る
```

IPが変わるかどうかは、NAT Gatewayを通るかどうかの直接の条件ではない。

---

## Public IP課金で設計判断が変わった

以前は、学習用や小規模構成で「ECSにPublic IPを付ければNAT Gatewayを省ける」と考えやすかった。

NAT Gatewayには時間課金とデータ処理課金があるため、常時起動すると固定費が気になる。特に個人学習や検証環境では、NAT Gatewayを作りっぱなしにすると地味に効く。

しかし、2024年2月1日から、AWS提供のPublic IPv4アドレスにも課金されるようになった。

AWSの公開情報では、Public IPv4は1IPあたり1時間 $0.005 が目安になる。30日間つけっぱなしなら、次のような計算になる。

```text
$0.005 × 24時間 × 30日 = $3.60 / 月
```

1個なら小さいが、ECSタスクが増えると効いてくる。

```text
10タスク  → 約 $36 / 月
50タスク  → 約 $180 / 月
100タスク → 約 $360 / 月
```

つまり、Public IPを付けてNAT Gatewayを節約する構成は、タスク数が少ないと安く見える一方で、タスク数が増えるとPublic IPv4課金のほうが重くなることがある。

---

## NAT Gateway方式とPublic IP方式の比較

整理すると、2つの方式には次の違いがある。

| 項目 | Public IP方式 | NAT Gateway方式 |
|---|---|---|
| ECSの配置 | パブリックサブネット | プライベートサブネット |
| ECSのPublic IP | タスクごとに付ける | 付けない |
| 外部APIへの通信 | ECS自身がIGW経由で出る | NAT Gateway経由で出る |
| 固定費 | Public IPv4の数に比例 | NAT Gatewayの時間課金 |
| タスク数が増えた時 | Public IPコストが増える | NAT Gateway側に集約される |
| セキュリティ | SGで絞る必要がある | 外から直接届きにくい |
| 本番向きか | 小規模・学習向き | 本番寄り |

Public IP方式は、部品が少なくて理解しやすい。

ただし、ECSタスクがインターネット到達可能な場所に置かれるため、セキュリティグループで「ALBからだけ受ける」などの制御をきちんと入れる必要がある。

NAT Gateway方式は、ECSをプライベートサブネットに置ける。インターネットから直接ECSへ届かない構成にしやすいため、本番寄りの基本形として考えやすい。

---

## VPCエンドポイントでNAT Gatewayの通信量を減らす

ここで重要になるのがVPCエンドポイントだ。

VPCエンドポイントを使うと、VPC内のリソースからAWSサービスへ、インターネットを経由せずにアクセスできる。

```text
通常の経路:
  ECS → NAT Gateway → IGW → インターネット → AWSサービス

VPCエンドポイント経由:
  ECS → VPCエンドポイント → AWSサービス
```

特にS3とDynamoDBのGateway Endpointは追加料金なしで使えるため、先に検討しやすい。

```text
ECS
 ├── S3への通信       → S3 Gateway Endpoint
 ├── DynamoDBへの通信 → DynamoDB Gateway Endpoint
 └── Stripeなど外部API → NAT Gateway
```

こうすると、NAT Gatewayを通る通信を「本当にインターネットへ出る必要があるもの」に絞れる。

たとえば、画像やログをS3へ保存する通信、DynamoDBへ読み書きする通信までNAT Gateway経由にしていると、NAT Gatewayのデータ処理課金が増えやすい。VPCエンドポイントへ逃がせる通信は逃がしたほうがよい。

---

## 注意：すべてのVPCエンドポイントが無料ではない

ここは勘違いしやすい。

VPCエンドポイントには、大きく分けてGateway EndpointとInterface Endpointがある。

| 種類 | 主な対象 | 料金の考え方 |
|---|---|---|
| Gateway Endpoint | S3、DynamoDB | 追加料金なし |
| Interface Endpoint | SQS、SNS、ECR、CloudWatch Logs、Secrets Managerなど | 時間課金・データ処理課金がある |

そのため、「VPCエンドポイントを使えば全部無料」と考えるのは危ない。

正確には、S3やDynamoDBのGateway Endpointは無料で使える。一方で、SQS、ECR、CloudWatch Logsなどで使うInterface Endpointは有料だ。

ただし、有料であっても、次のような理由で採用する価値はある。

- NAT Gatewayを通るデータ量を減らせる
- AWSサービスへの通信をインターネット経由にしなくてよい
- プライベートサブネット内で完結する設計に近づけられる
- セキュリティ要件を満たしやすい

つまり、VPCエンドポイントは「無料化の道具」というより、**通信経路を内側に寄せ、必要に応じてコストも最適化する部品**として理解するのがよさそうだ。

---

## 推奨構成のイメージ

本番寄りに考えるなら、次の形がわかりやすい。

```text
インターネット
     ▲ ▼
   [IGW]
     │
  ┌──┼─────────────────────────────────────┐
  │  ▼                                      │
  │ パブリックサブネット                    │
  │  [ALB]              [NAT Gateway]       │
  │   │                      ▲              │
  │   │                      │ 外部API向け  │
  │ プライベートサブネット   │              │
  │   ▼                      │              │
  │  [ECS] ──────────────────┘              │
  │   │                                     │
  │   ├──→ [S3 Gateway Endpoint] ──→ S3     │
  │   ├──→ [DynamoDB Gateway EP] ─→ DynamoDB│
  │   ├──→ [Interface Endpoint] ──→ ECR等   │
  │   ▼                                     │
  │  [RDS]                                  │
  └─────────────────────────────────────────┘
```

ポイントは、通信先ごとに経路を分けること。

| 通信先 | 経路 | 考え方 |
|---|---|---|
| ユーザーからのアクセス | Internet → ALB → ECS | 入口はALBに集約 |
| ECSからRDS | VPC内部 | DBは外へ出さない |
| ECSからS3/DynamoDB | Gateway Endpoint | NAT Gatewayを通さない |
| ECSからECR/CloudWatch等 | Interface Endpoint候補 | コストと要件で判断 |
| ECSからStripe/Slack等 | NAT Gateway | 外部APIなのでNAT経由 |

この構成にすると、ECS自体はPublic IPを持たずに済む。

外からの入口はALBに寄せ、ECSはプライベートサブネットで動かし、外へ出る必要がある通信だけをNAT GatewayやVPCエンドポイントへ流す。

---

## 学習環境ではどう考えるか

個人学習では、いきなり本番寄りの構成を全部作るとコストが重くなる。

特にNAT Gatewayは、起動しているだけで時間課金が発生する。使っていないつもりでも、作りっぱなしなら課金される。

そのため、学習段階では次のように分けて考えるとよさそうだ。

| 状況 | 選択肢 |
|---|---|
| VPCやALBの流れを学びたい | Public IP付きECSで簡略化 |
| RDSを外に出さない構成を学びたい | RDSはプライベートサブネットに置く |
| 本番に近いECS配置を学びたい | ECSをプライベートサブネットに置き、NAT Gatewayを使う |
| S3/DynamoDB通信を最適化したい | Gateway Endpointを追加する |
| 常時稼働コストを抑えたい | 不要なNAT GatewayやPublic IPを削除する |

学習用のPublic IP方式が悪いわけではない。

ただし、それを本番設計の正解として固定してしまうと、タスク数が増えたときのPublic IPv4課金や、外部公開面の広さが問題になりやすい。

---

## 今日のチェックポイント

自分の言葉で説明できるようにしたいポイントは次の5つ。

- インターネット向けのNAT Gatewayは、パブリックサブネットに置く
- NAT Gatewayは、プライベートIPの送信元をPublic IPへ変換して外へ出す
- ECSがNAT Gatewayを通るかどうかは、Public IPの有無とルートテーブルで決まる
- Public IPv4は2024年2月1日から課金対象になったため、タスク数が増えると効いてくる
- S3/DynamoDBはGateway Endpointで逃がし、外部APIだけNAT Gatewayに流すと設計しやすい

---

## まとめ

ECSの配置は、単に「パブリックサブネットかプライベートサブネットか」だけでは決められない。

Public IPを付ければNAT Gatewayなしで外へ出られるが、Public IPv4課金とセキュリティ面を考える必要がある。

一方、ECSをプライベートサブネットに置くと本番向きの形になるが、外向き通信のためにNAT GatewayやVPCエンドポイントの設計が必要になる。

今の自分の理解では、基本方針は次のように整理できる。

```text
学習・小規模:
  Public IP付きECSで構成を簡略化することもある

本番寄り:
  ECSはプライベートサブネット
  AWSサービス向けはVPCエンドポイント
  外部API向けはNAT Gateway
```

コスト最適化は、安い部品を選ぶだけではなく、通信の種類ごとに正しい出口を選ぶ作業だとわかった。

---

## 参考文献・リンク

- [AWS Docs: NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)
- [AWS Docs: Connect to the internet or other networks using NAT devices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat.html)
- [AWS Docs: Internet gateways](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html)
- [AWS Docs: Gateway endpoints for Amazon S3](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html)
- [AWS Docs: Gateway endpoints for Amazon DynamoDB](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-ddb.html)
- [AWS Docs: AWS PrivateLink pricing](https://aws.amazon.com/privatelink/pricing/)
- [AWS: Amazon VPC Pricing](https://aws.amazon.com/vpc/pricing/)
- [AWS News Blog: New AWS Public IPv4 Address Charge + Public IP Insights](https://aws.amazon.com/jp/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/)
