---
title: '今日学んだこと：bin/rails c と rails c の違い'
description: 'どちらもRailsコンソールを起動するコマンドだが、実行経路とバージョン解決の仕組みが異なる。安全に使うためのポイントを整理した。'
pubDate: 2026-05-02
tags: ['Rails', 'Ruby', 'Bundler', 'binstub']
draft: false
customSlug: 'bin-rails-c-vs-rails-c'
---

どちらもRailsコンソールを起動するコマンドだが、実行される仕組みが違う。結論から言うと、普段の開発では `bin/rails c` を使うのが安全。

---

## `bin/rails c`

`bin/rails c` は、プロジェクト内の `bin/rails`（binstub）を直接実行する。

- `config/boot` を経由して Bundler がセットアップされるため、Gemfile に定義した依存関係に沿って起動できる
- プロジェクト固有の実行経路を使うので、チーム開発でも環境差分が出にくい
- Rails公式ドキュメントでも、アプリ内コマンドとして `bin/rails` が案内されている

```ruby
#!/usr/bin/env ruby
APP_PATH = File.expand_path("../config/application", __dir__)
require_relative "../config/boot"
require "rails/commands"
```

---

## `rails c`

`rails c` は、シェルの `$PATH` 上にある `rails` 実行ファイルを起動する。

- グローバル環境に複数のRailsがあると、意図しない実行ファイルを先に拾う可能性がある
- ただし、Bundler経由（例: `bundle exec rails c`）で実行すれば、Gemfile準拠で動かせる
- プロジェクト外で `rails new` などを叩く用途では便利

---

## 実用上の比較

| 観点 | `bin/rails c` | `rails c` |
|---|---|---|
| バージョンの確実性 | 高い（アプリ内実行経路） | 環境依存になりやすい |
| チーム開発での再現性 | 高い | 個人環境差が出ることがある |
| 公式の基本案内 | こちらが中心 | 補助的 |
| 入力の手軽さ | やや長い | 短い |

---

## 使い分けの指針

- **Railsアプリ内で日常的に作業するなら `bin/rails c`**
- `rails c` を使う場合でも、アプリ内では `bundle exec rails c` にして依存関係を固定すると安全
- 毎回長く打つのが気になるなら、`alias rc='bin/rails c'` のようにエイリアスを切っておくと運用しやすい

---

## まとめ

`bin/rails c` と `rails c` は目的が近い一方で、実行ファイルの解決方法が異なる。プロジェクト依存のRailsを確実に使いたいなら、`bin/rails c` を標準にしておくのが堅実。

---

## 参考文献・リンク

https://guides.rubyonrails.org/command_line.html

https://bundler.io/guides/bundler_setup.html

https://rubygems.org/gems/railties
