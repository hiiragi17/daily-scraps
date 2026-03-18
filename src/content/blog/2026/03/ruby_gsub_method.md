---
title: '今日学んだこと：gsub と gsub! の違い（Rubyの破壊的メソッド）'
description: 'Rubyのgsub!メソッドの基本的な使い方、gsubとの違い、戻り値がnilになるケースの注意点をまとめた'
pubDate: 2026-03-18
tags: ['Ruby', 'gsub', '破壊的メソッド', '文字列操作']
draft: false
customSlug: 'ruby_gsub_method'
---

## 概要

今日は Ruby の `String` クラスのメソッド `gsub` と `gsub!` の違いについて学んだ。

| メソッド | 破壊的か | 戻り値 |
|----------|----------|--------|
| `gsub`   | ❌ 元の文字列を変えない（新しい文字列を返す） | 新しい文字列 |
| `gsub!`  | ✅ 元の文字列を直接書き換える | 置換が発生したら自身、なければ `nil` |

末尾の `!`（bang）は Ruby の慣習で「破壊的メソッド」であることを示す。

---

## コードで比較

```ruby
str = "hello world"

# gsub（非破壊的）
new_str = str.gsub("l", "r")
puts str      # => "hello world"（変わらない）
puts new_str  # => "herro worrd"

# gsub!（破壊的）
str.gsub!("l", "r")
puts str      # => "herro worrd"（書き換わる！）
```

---

## 正規表現との組み合わせ

正規表現も使える。日付フォーマットの変換など実務でよく見かける。

```ruby
str = "2024-03-17"
str.gsub!(/-/, "/")
puts str  # => "2024/03/17"
```

---

## 戻り値が nil になるケースに注意

置換対象が見つからなかった場合、`gsub!` は `nil` を返す。

```ruby
str = "hello"
result = str.gsub!("xyz", "abc")
puts result.inspect  # => nil
puts str             # => "hello"（変化なし）
```

これを知らないと、戻り値を使ったチェーン処理でエラーになることがある。

```ruby
# NG例：置換対象がなければ result は nil → NoMethodError になる
result = str.gsub!("xyz", "abc").upcase
```

---

## いつ gsub! を使うか

### 使ってもよいケース

- メモリ効率を意識したい場合（新しい文字列オブジェクトを生成しない）
- 元の文字列を直接変更することが明確な場合

### gsub を使った方が安全なケース

- 戻り値をそのまま使いたい（`nil` が返ってくるリスクを避けたい）
- 特にこだわりがなければ `gsub` の方がシンプルで安全

```ruby
# 安全な gsub の使い方
result = str.gsub("l", "r")

# gsub! を安全に使うなら nil チェックを入れる
if str.gsub!("l", "r")
  puts "置換しました: #{str}"
else
  puts "置換対象がありませんでした"
end
```

---

## まとめ

- `gsub` → 非破壊的。新しい文字列を返す。安全で使いやすい
- `gsub!` → 破壊的。元の文字列を直接書き換える。置換なしのとき `nil` を返すので注意
- 正規表現と組み合わせることで柔軟な文字列置換ができる
- Rails のコードベースでも `gsub!` は見かける場面がある

## 参考文献

- [Ruby 公式ドキュメント - String#gsub!](https://docs.ruby-lang.org/ja/latest/method/String/i/gsub=21.html)
