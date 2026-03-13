---
title: '今日学んだこと：Sentry（エラー監視サービス）'
description: '本番環境でのエラーを即座に検知・通知してくれる監視サービス「Sentry」の概要・できること・Railsでの導入方法をまとめた'
pubDate: 2026-03-13
tags: ['Rails', 'Ruby', 'Sentry', '監視', '本番環境']
draft: false
customSlug: 'sentry-monitoring'
---

## 概要

Sentry とは、**本番環境でエラーが起きたときに通知・記録してくれる監視サービス**である。

ローカル開発中はエラーがターミナルに出るのですぐ気づけるが、本番環境だとユーザーがエラーに遭遇しても開発者は気づけないことが多い。Sentry はそれを解決する「安全網」の役割を果たす。

---

## できること

| 機能 | 内容 |
|------|------|
| **即時通知** | エラー発生時に Slack・メール等で通知 |
| **スタックトレース記録** | どのファイルの何行目でエラーが起きたか記録 |
| **影響範囲の把握** | どのユーザーが・何回・どの環境でエラーに遭遇したか把握 |
| **ダッシュボード可視化** | エラーの発生頻度や傾向をグラフで確認 |

---

## Rails での導入

### Gemfile

```ruby
gem "sentry-ruby"
gem "sentry-rails"
```

### 初期化ファイル

```ruby
# config/initializers/sentry.rb
Sentry.init do |config|
  config.dsn = ENV["SENTRY_DSN"]
  config.breadcrumbs_logger = [:active_support_logger]
end
```

### DSN とは

**DSN（Data Source Name）** は、Sentry のプロジェクトごとに発行される接続先 URL のようなものである。環境変数 `SENTRY_DSN` に設定することで、アプリが Sentry にエラーを送信できるようになる。

```
SENTRY_DSN=https://xxxxx@o0.ingest.sentry.io/0
```

---

## ローカル開発 vs 本番環境

```
【ローカル開発】

エラー発生 → ターミナルにスタックトレースが出る → 開発者がすぐ気づく


【本番環境（Sentry なし）】

エラー発生 → ユーザーがエラーに遭遇 → 開発者は気づかない


【本番環境（Sentry あり）】

エラー発生 → Sentry が捕捉 → Slack 等に通知 → 開発者がすぐ対応できる
```

---

## プランについて

個人開発や小規模サービスであれば**無料プランで十分**なことが多い。本番サービスでもほぼ標準的に導入されているツールであり、「本番でエラーが起きたけど誰も気づかなかった」を防ぐための安全網として機能する。

---

## まとめ

- **何のため？** → 本番環境でのエラーを即座に検知・通知するため
- **DSN とは？** → Sentry プロジェクトへの接続先 URL。環境変数で管理する
- **Rails への導入は？** → `sentry-ruby` / `sentry-rails` gem を追加し、initializer で `Sentry.init` を設定するだけ
- **無料プランは？** → 個人開発・小規模サービスなら無料で十分

## 参考文献

- [Sentry 公式ドキュメント](https://docs.sentry.io/)
- [sentry-ruby GitHub](https://github.com/getsentry/sentry-ruby)
