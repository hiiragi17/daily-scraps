---
title: '今日学んだこと：RubyのRactorに関して'
description: 'Ruby 3.0で導入されたRactorの基本、Threadとの違い、データ共有制約、実用時の注意点を初心者向けにまとめた。'
pubDate: 2026-04-22
tags: ['Ruby', 'Ractor', '並列処理', 'Thread', 'GVL']
draft: false
customSlug: 'ruby-ractor-intro'
---

Ractor（ラクター）は、Ruby 3.0から導入された**並列処理**のための仕組みだ。名前は「Ruby + Actor（アクターモデル）」に由来する。

一言でいうと、**複数の処理を本当に同時実行するための箱**。

---

## なぜRactorが必要なのか

Rubyにはもともと`Thread`があるが、CRubyでは**GVL（Global VM Lock）**の制約があるため、同じ瞬間にRubyコードを実行できるスレッドは基本1つだけになる。

つまり、スレッドは「同時に進んでいるように見える」ものの、CPUを使う重い処理ではマルチコア性能をフル活用しづらい。

Ractorはこの点を改善する。**Ractorごとに独立した実行環境**を持つため、CPUコアを使った真の並列実行が可能になる。

---

## 基本の使い方

```ruby
r = Ractor.new do
  puts "Ractorの中だよ"
  1 + 2
end

result = r.take
puts result  # => 3
```

ポイントは次の3つ。

1. `Ractor.new`でRactorを作る
2. ブロック内は別Ractorで実行される
3. `take`で結果を受け取る（必要なら待機する）

---

## Ractor間通信の2パターン

### 1. `send` / `receive`（プッシュ型）

```ruby
r = Ractor.new do
  msg = Ractor.receive
  puts "受け取った: #{msg}"
end

r.send("こんにちは")
r.take
```

送信側がメッセージを渡し、受信側が`Ractor.receive`で受け取る。

### 2. `yield` / `take`（プル型）

```ruby
r = Ractor.new do
  Ractor.yield "データ1"
  Ractor.yield "データ2"
  "最後のデータ"
end

puts r.take  # => "データ1"
puts r.take  # => "データ2"
puts r.take  # => "最後のデータ"
```

生成側が`yield`し、取得側が`take`で順に取り出す。

---

## 実用イメージ：重い計算を並列化

```ruby
require 'prime'

numbers = [100000007, 100000037, 100000039, 100000049]

start = Time.now
numbers.each { |n| Prime.prime?(n) }
puts "直列: #{Time.now - start}秒"

start = Time.now
ractors = numbers.map do |n|
  Ractor.new(n) { |num| Prime.prime?(num) }
end
ractors.each(&:take)
puts "並列: #{Time.now - start}秒"
```

CPUバウンドな処理では、Ractorで速度改善できるケースが多い。

---

## 使う前に知っておく制約

Ractorは安全性のために、データ共有を厳格に制限している。

### 1. 外側のローカル変数をそのまま参照できない

```ruby
x = 10

r = Ractor.new do
  puts x  # エラー
end
```

必要な値は引数として明示的に渡す。

```ruby
x = 10
r = Ractor.new(x) { |v| puts v }
r.take
```

### 2. オブジェクトには共有/移動ルールがある

共有可能オブジェクト（イミュータブルな値など）はそのまま扱えるが、通常の可変オブジェクトは受け渡し時に**所有権移動**が発生する場合がある。

```ruby
str = "hello"
r = Ractor.new(str) { |s| s.upcase }
r.take  # => "HELLO"

puts str  # Ractor::MovedError
```

これは「同じオブジェクトを複数Ractorが同時更新する事故」を防ぐための設計。

### 3. 実験的機能として扱われる時期があった

Rubyバージョンによっては`Ractor is experimental`の警告が出る。実運用で使う場合は、使用中バージョンのドキュメントで挙動確認が必要。

---

## ThreadとRactorの使い分け

- **Ractor向き**: CPUを使う重い計算（数値計算、画像処理、暗号系など）
- **Thread向き**: I/O待ち中心の処理（HTTP通信、ファイルI/Oなど）

「何で遅いか」がCPUかI/Oかで、選択が変わる。

---

## まとめ

Ractorは、Rubyでマルチコアを活かした並列処理を実現するための仕組みだ。制約は厳しいが、そのぶんデータ競合バグを設計レベルで防ぎやすい。

最初は、重い計算を小さく分割してRactorに投げるところから試すのがわかりやすい。

---

## 参考文献・リンク

- https://docs.ruby-lang.org/en/3.4/Ractor.html
- https://docs.ruby-lang.org/en/3.4/ractor_md.html
- https://github.com/ruby/ruby/blob/master/doc/ractor.ja.md
- https://www.atdot.net/~ko1/activities/
- https://blog.appsignal.com/2022/08/24/an-introduction-to-ractors-in-ruby.html
- https://www.honeybadger.io/blog/ractors/
- https://blog.kiprosh.com/ruby-3-introduction-to-ractors/
- https://blog.bohr.su/2021/08/07/Ruby-ractors-chasing-parallelism.html

---
