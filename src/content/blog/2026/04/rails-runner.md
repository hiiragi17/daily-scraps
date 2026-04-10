---
title: '今日学んだこと：rails runnerに関して'
description: 'rails runnerの基本的な使い方と、rails consoleとの違い、cronを使った定期バッチ処理への応用をまとめた。'
pubDate: 2026-04-10
tags: ['Rails', 'Ruby', 'rails runner', 'バッチ処理']
draft: false
customSlug: 'rails-runner'
---

`rails runner` は、Railsアプリのコードをスクリプトとして実行するためのコマンドだ。`rails console` と違い対話形式ではなく、書いたコードを一気に実行して終わるのが特徴。

---

## rails console との違い

| | `rails console` | `rails runner` |
|---|---|---|
| 形式 | 対話型（REPL） | スクリプト実行 |
| 用途 | 手動で試したいとき | 処理を自動化したいとき |
| 終わり方 | 自分で `exit` する | コード実行後に自動終了 |
| 定期実行 | 不可 | cron などと組み合わせ可能 |

`rails console` は「手で試す用」、`rails runner` は「自動実行用」と覚えておくとわかりやすい。

---

## 基本的な使い方

### 文字列で直接実行

```bash
rails runner "puts User.count"
```

`"..."` の中にRubyコードを書くだけで実行できる。

### ファイルを指定して実行

```bash
rails runner script/hello.rb
```

`script/hello.rb` の中身：

```ruby
users = User.where(active: true)
users.each do |user|
  puts user.name
end
```

---

## 具体的なユースケース

### データの一括更新

```ruby
# script/fix_emails.rb
User.where(email: nil).each do |user|
  user.update!(email: "unknown_#{user.id}@example.com")
end
puts "完了"
```

```bash
rails runner script/fix_emails.rb
```

ActiveRecordがロードされているので、モデルはそのまま使える。`puts` の出力はターミナルに直接表示される。

### 定期バッチ処理（cron と組み合わせ）

```bash
# 毎日深夜0時に実行する例（crontab）
0 0 * * * cd /app && bundle exec rails runner script/daily_report.rb
```

cronと組み合わせることで、定期的なデータ集計やレポート送信を自動化できる。

---

## 環境の指定

```bash
# 本番環境で実行
rails runner -e production "User.find(1).update!(name: 'test')"

# 環境変数で指定する方法
RAILS_ENV=staging rails runner script/batch.rb
```

---

## 注意点

エラーが起きるとそこで処理が止まるため、本番実行前に必ずローカルや検証環境で動作確認をしておく必要がある。本番データを操作するスクリプトは特に慎重に扱う。

---

## まとめ

`rails runner` は、Railsの環境を丸ごと読み込んだ上でRubyスクリプトを実行する仕組みだ。ちょっとしたデータ修正・移行・集計に使いやすく、cronやCIと組み合わせることで定期バッチ処理にも応用できる。

---

## 参考文献・リンク

https://guides.rubyonrails.org/command_line.html#rails-runner

https://railsguides.jp/command_line.html#rails-runner

---
