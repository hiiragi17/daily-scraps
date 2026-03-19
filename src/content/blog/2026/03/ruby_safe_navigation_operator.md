---
title: '今日学んだこと：ぼっち演算子（&.）で nil エラーを防ぐ'
description: 'Rubyのぼっち演算子（safe navigation operator）の基本的な使い方、nilエラーを防ぐ仕組み、実務でのよくある使いどころをまとめた'
pubDate: 2026-03-19
tags: ['Ruby', 'ぼっち演算子', 'nil', '初心者']
draft: false
customSlug: 'ruby_safe_navigation_operator'
---

## 概要

今日は Ruby の **ぼっち演算子（`&.`）** について学んだ。

正式名称は **safe navigation operator（安全なナビゲーション演算子）** で、Ruby 2.3 で導入された。

`nil` かもしれないオブジェクトに対してメソッドを呼び出すとき、`NoMethodError` を防ぐための演算子。

---

## 問題：nil に対してメソッドを呼ぶとエラーになる

```ruby
user = nil

user.name  # => NoMethodError: undefined method `name' for nil
```

`user` が `nil` のとき、`.name` を呼び出すと Ruby はエラーを投げる。

---

## ぼっち演算子で解決

```ruby
user = nil

user&.name  # => nil（エラーにならない）
```

`&.` を使うと、レシーバ（`.` の左側）が `nil` のとき **エラーにせず `nil` を返す** だけ。

オブジェクトが存在するときは、普通のメソッド呼び出しと同じ動作をする。

```ruby
user = User.find(1)  # ユーザーが存在する場合

user&.name  # => "田中 太郎"（普通に呼び出される）
```

---

## なぜ「ぼっち」？

`&.` の見た目が、**一人でポツンと座っている人の後ろ姿**に見えることから、日本の Ruby コミュニティで「ぼっち演算子」と呼ばれるようになった。`&` が頭、`.` がお尻のイメージ。

英語圏では **lonely operator** と呼ばれることもある。

---

## コードで比較

ぼっち演算子を使わない場合、こう書く必要があった。

```ruby
# 方法1：nil チェック
name = user.nil? ? nil : user.name

# 方法2：&&（ダブルアンド）
name = user && user.name
```

ぼっち演算子を使うと、シンプルに書ける。

```ruby
# ぼっち演算子
name = user&.name
```

---

## JSONカラムのような「存在するかわからないキー」の取り出し

データベースの JSON カラムなど、値が `nil` になりうるケースで特によく使われる。

```ruby
# settings が nil の場合にエラーにならない
settings&.[]('theme')  # => nil

# settings が存在する場合
settings = { 'theme' => 'dark', 'language' => 'ja' }
settings&.[]('theme')  # => "dark"
```

`.[]('キー名')` はハッシュからキーを取り出す書き方で、`hash['キー名']` と同じ意味。

---

## チェーン（連鎖）もできる

```ruby
# user か company が nil なら nil を返す
city = user&.company&.address&.city
```

途中で `nil` が出た時点でそこで止まり、残りは評価しない。

---

## 注意点

### ぼっち演算子は「nil のとき nil を返す」だけ

`false` のときは通常通りメソッドを呼び出す。`nil` だけを特別扱いしている。

```ruby
obj = false
obj&.to_s  # => "false"（false はメソッドを呼び出せる）
```

### 使いすぎに注意

`nil` が来るはずのない場所でぼっち演算子を使うと、バグが隠れてしまうことがある。

```ruby
# user は必ず存在するはずなのに &. を使ってしまうと
# nil が来てもエラーにならず気づけない
user&.name  # 本当は user.name で良い
```

`nil` になる可能性がある場所だけで使うのが基本。

---

## まとめ

| 状況 | 動作 |
|------|------|
| レシーバが `nil` | `nil` を返す（エラーなし） |
| レシーバが `nil` 以外 | 通常のメソッド呼び出しと同じ |
| `false` のとき | 通常のメソッド呼び出し（`nil` 扱いしない） |

- `&.` は **nil のときだけ** エラーを防いで `nil` を返す
- チェーンして複数つなげることもできる
- `nil` になりうる場所にだけ使うのが正しい使い方

## 参考文献

- [Ruby 公式ドキュメント - 演算子式](https://docs.ruby-lang.org/ja/latest/doc/spec=2foperator.html)
- [Ruby 2.3.0 リリースノート](https://www.ruby-lang.org/ja/news/2015/12/25/ruby-2-3-0-released/)
