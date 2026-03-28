---
title: '今日学んだこと：Kernel モジュールと Enumerable モジュール'
description: 'RubyのKernelモジュールとEnumerableモジュールの概要・代表的なメソッド・使い方'
pubDate: 2026-03-28
tags: ['Ruby', 'Kernel', 'Enumerable', 'module']
draft: false
customSlug: 'kernel-enumerable-modules'
---

## 概要

今日は Ruby の `Kernel` モジュールと `Enumerable` モジュールについて学んだ。

| | Kernel | Enumerable |
|---|---|---|
| 目的 | Ruby 全体の基本機能 | コレクションの繰り返し処理 |
| mix-in 先 | `Object`（全クラス） | `Array`, `Hash`, `Range` など |
| 代表例 | `puts`, `p`, `require` | `map`, `select`, `reduce` |
| 自作クラスへの利用 | 通常は意識しない | `each` を実装して include |

---

## 1. Kernel モジュール

`Kernel` は Ruby の**すべてのオブジェクトが持つ基本機能**を提供するモジュール。`Object` クラスに mix-in されているため、Ruby のあらゆる場所で使える。

### 代表的なメソッド

```ruby
puts "hello"        # 出力
p [1, 2, 3]         # デバッグ出力
print "hello"       # 改行なし出力
pp { a: 1, b: 2 }   # pretty print

gets                # 標準入力から読み込む
rand(10)            # ランダムな数値
sleep(2)            # 処理を止める

Integer("42")       # 型変換
String(123)
Array(nil)          # => []

raise "error!"      # 例外を発生させる
require "json"      # ライブラリの読み込み
```

### ポイント

`puts` や `p` がどこでも使えるのは、`Kernel` が `Object` に mix-in されているから。
「メソッドを呼んでいるようで実はどこにも属していない」ように見えるメソッドの多くが `Kernel` 由来。

```ruby
# トップレベルで書いているが…
puts "hello"

# 実態はこう
Kernel.puts "hello"  # 同じ意味
```

---

## 2. Enumerable モジュール

`Enumerable` は**コレクション（配列・ハッシュなど）を繰り返し処理する**ための豊富なメソッドを提供するモジュール。`each` メソッドさえ実装すれば、クラスに mix-in できる。

### 代表的なメソッド

```ruby
arr = [1, 2, 3, 4, 5]

arr.map { |n| n * 2 }                              # => [2, 4, 6, 8, 10]
arr.select { |n| n.odd? }                          # => [1, 3, 5]
arr.reject { |n| n.odd? }                          # => [2, 4]
arr.find { |n| n > 3 }                             # => 4
arr.reduce(0) { |sum, n| sum + n }                 # => 15
arr.each_with_object([]) { |n, memo| memo << n * 2 } # => [2, 4, 6, 8, 10]
arr.filter_map { |n| n * 2 if n.odd? }             # => [2, 6, 10]
arr.any? { |n| n > 4 }                             # => true
arr.all? { |n| n > 0 }                             # => true
arr.count { |n| n.even? }                          # => 2
arr.sort_by { |n| -n }                             # => [5, 4, 3, 2, 1]
arr.group_by { |n| n.odd? }                        # => {true=>[1,3,5], false=>[2,4]}
arr.flat_map { |n| [n, n] }                        # => [1,1,2,2,3,3,4,4,5,5]
arr.min_by { |n| n }                               # => 1
arr.max_by { |n| n }                               # => 5
```

### 自作クラスに mix-in する例

`each` を一つ実装するだけで、数十のメソッドが使えるようになるのが強み。

```ruby
class NumberList
  include Enumerable  # mix-in するだけ

  def initialize(numbers)
    @numbers = numbers
  end

  def each(&block)    # each だけ実装すれば OK
    @numbers.each(&block)
  end
end

list = NumberList.new([3, 1, 4, 1, 5])
list.sort           # => [1, 1, 3, 4, 5]
list.select(&:odd?) # => [3, 1, 1, 5]
list.map { |n| n * 2 } # => [6, 2, 8, 2, 10]
```

---

## 参考文献

- [Kernel モジュール - Ruby リファレンスマニュアル](https://docs.ruby-lang.org/ja/latest/class/Kernel.html)
- [Enumerable モジュール - Ruby リファレンスマニュアル](https://docs.ruby-lang.org/ja/latest/class/Enumerable.html)
- [module Kernel - Ruby 3.x.x リファレンス（英語）](https://ruby-doc.org/core/Kernel.html)
- [module Enumerable - Ruby 3.x.x リファレンス（英語）](https://ruby-doc.org/core/Enumerable.html)
