---
title: '今日学んだこと：AWS SES（Amazon Simple Email Service）'
description: 'アプリからのメール送信を安全・確実・安価に行うためのAWSサービス。自前メールサーバーの辛さをまるごと解決してくれる。'
pubDate: 2026-03-08
tags: ['AWS', 'SES', 'Ruby', 'Rails', 'メール']
draft: false
customSlug: 'aws-ses-learning'
---

## 概要

**Amazon Simple Email Service（SES）** は、アプリケーションから大量のメールを安価・確実に送るためのAWSインフラ。

---

## 自前でメール送信の何が辛いのか

SESを使わずに自前でメールサーバーを立てると…

- **スパム判定**されやすい（IPの信頼性がない）
- サーバー管理・セキュリティ対応が必要
- 大量送信時のスケールが難しい
- バウンス（届かなかったメール）の管理が面倒

SES はこれらをまるごと解決してくれる。

---

## 主な用途

| 用途 | 具体例 |
|---|---|
| トランザクションメール | 会員登録確認、パスワードリセット、購入完了通知 |
| バルクメール | メルマガ、キャンペーンの一斉配信 |
| 通知メール | アラート、レポート自動送信 |
| メール受信 | 問い合わせメールの受け取り・処理 |

---

## 仕組みのイメージ

```
あなたのアプリ
    ↓ API or SMTP で送信依頼
  AWS SES
    ↓ 信頼性の高いAWSのIPから送信
  受信者のメールボックス
```

AWSのIPアドレスは世界中のメールプロバイダーから**信頼されている**ので、スパム判定されにくい。

---

## 送信方法は2種類

### 1. SMTP経由

既存のメール送信ライブラリをほぼそのまま使える。

```ruby
# Rails の場合、config/environments/production.rb
config.action_mailer.smtp_settings = {
  address: "email-smtp.ap-northeast-1.amazonaws.com",
  port: 587,
  user_name: "SESのアクセスキー",
  password: "SESのシークレットキー",
  authentication: :login,
}
```

### 2. AWS SDK経由

よりAWSネイティブな使い方。

```ruby
# aws-sdk-ses gem を使う場合
ses = Aws::SES::Client.new(region: "ap-northeast-1")
ses.send_email(
  destination: { to_addresses: ["user@example.com"] },
  message: {
    subject: { data: "件名" },
    body: { text: { data: "本文" } }
  },
  source: "noreply@yourapp.com"
)
```

---

## 重要な概念

### サンドボックスモード

最初はこのモードになっており、**自分が認証したメールアドレス宛にしか送れない**制限がある。本番運用前にAWSへ申請して解除が必要。

### ドメイン認証（DKIM / SPF）

「このドメインからのメールは本物ですよ」とメールプロバイダーに証明する仕組み。SESがほぼ自動でセットアップしてくれる。

### バウンス・クレーム管理

- **バウンス** → 存在しないアドレスへの送信
- **クレーム** → 受信者が「迷惑メール」と報告

これらの率が高いと送信停止になるため、SESはSNS経由でアプリに通知する仕組みがある。

---

## 料金

非常に安いのが特徴。

- **EC2やLambdaから送信** → 最初の62,000通/月は**無料**
- それ以降 → **$0.10 / 1,000通**（約15円）

---

## Rails × SES の典型的な構成

```
Rails ActionMailer
    ↓
SES（SMTP or SDK）
    ↓
ユーザーへのメール送信

バウンス発生
    ↓
SES → SNS → SQS or Lambda
    ↓
Rails側でバウンスアドレスをDBに記録 → 以降の送信をスキップ
```

---

## まとめ

- **何のため？** → アプリからのメール送信を安全・確実・安価に行うため
- **自前サーバーとの違い？** → スパム対策・スケール・バウンス管理をAWSが肩代わり
- **Railsとの相性** → ActionMailerのSMTP設定を変えるだけで導入できる
- **注意点** → 最初はサンドボックスモードなので本番前に申請が必要
