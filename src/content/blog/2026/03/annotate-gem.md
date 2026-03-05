---
title: '今日学んだこと：annotate gem と annotaterb'
description: 'DBスキーマ情報をモデルファイルに自動注釈してくれる annotate gem と、その後継である annotaterb の違いと移行方法'
pubDate: 2026-03-05
tags: ['Ruby', 'Rails', 'gem', 'annotate', 'annotaterb']
draft: false
customSlug: 'annotate-gem'
---

## annotate gem とは

**annotate**（別名 `annotate_models`）は、RailsプロジェクトのモデルファイルにDBスキーマ情報を自動でコメントとして挿入してくれるgem。

### 何をしてくれるのか

`db/schema.rb` の内容を読み取り、対応するモデルファイルの先頭（または末尾）に以下のようなコメントを自動生成する。

```ruby
# == Schema Information
#
# Table name: users
#
#  id         :bigint           not null, primary key
#  name       :string(255)      not null
#  email      :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
```

### 主な機能

- モデルファイル（`app/models/*.rb`）へのスキーマ注釈
- ルーティング情報（`rake routes` の出力）の注釈も可能
- `spec/`, `test/`, `factory` ファイルへの注釈も対応
- `rails db:migrate` 後に自動実行するフック設定が可能

---

## annotaterb とは

**annotaterb** は、annotate gem を**フォークして再設計**した後継gem。

### 生まれた背景

annotate gem はメンテナンスが滞りがちで、以下の課題があった。

- Ruby 3.x / Rails 7.x との互換性問題
- コードが古く、テストカバレッジが低い
- Zeitwerk対応など現代的なRailsへの追従が遅い

これを解決するため、コミュニティが `annotaterb` として作り直した。

### annotate との主な違い

| 項目 | annotate | annotaterb |
|---|---|---|
| メンテナンス状況 | 停滞気味 | 活発 |
| Rails 7対応 | 不安定 | ✅ 対応済み |
| Ruby 3対応 | 部分的 | ✅ 対応済み |
| コードベース | レガシー | リファクタリング済み |
| gem名 | `annotate` | `annotaterb` |

---

## 移行方法

```ruby
# Gemfile
# gem 'annotate'  # 削除
gem 'annotaterb'  # 追加
```

インストール後は基本的に同じコマンドで動作する。

```bash
bundle exec annotaterb models
bundle exec annotaterb routes
```

---

## まとめ

- **annotate** → モデルファイルにDBスキーマ情報を自動注釈してくれる便利なgem
- **annotaterb** → annotate のコミュニティ主導の後継。Rails 7 / Ruby 3 に対応済みで現在はこちらが推奨
- コマンドの互換性があるため、Gemfile を差し替えるだけで移行できる
