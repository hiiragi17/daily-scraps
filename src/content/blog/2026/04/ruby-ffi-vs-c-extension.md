---
title: '今日学んだこと：RubyでFFIを使う方法とC拡張との違い'
description: 'ffi gemとFiddleの基本、構造体の扱い、FFIとC拡張の使い分けを初心者向けに整理。'
pubDate: 2026-04-23
tags: ['Ruby', 'FFI', 'C拡張', 'Fiddle', 'ネイティブ連携']
draft: false
customSlug: 'ruby-ffi-vs-c-extension'
---

RubyからCの機能を呼び出す方法として、今日は**FFI**と**C拡張**の違いを整理した。

結論から言うと、まずはFFIで始めるのが現実的。パフォーマンスや表現力が足りなくなったらC拡張を検討する、という順番がわかりやすい。

---

## RubyでFFIを使う主な選択肢

RubyでFFIを扱う方法は主に2つある。

## 1. `ffi` gem（推奨）

最も広く使われるライブラリで、宣言が読みやすい。

```ruby
require 'ffi'

module MyLib
  extend FFI::Library
  ffi_lib 'c'  # libc をロード

  # int abs(int) を宣言
  attach_function :abs, [:int], :int
  # size_t strlen(const char*) を宣言
  attach_function :strlen, [:string], :size_t
end

puts MyLib.abs(-42)            # => 42
puts MyLib.strlen("hello")     # => 5
```

インストールは次のコマンドでOK。

```bash
gem install ffi
```

## 2. 標準添付の `Fiddle`

Ruby本体に同梱されるため、追加インストール不要。ただし`ffi` gemより低レベル。

```ruby
require 'fiddle'
require 'fiddle/import'

module MyLib
  extend Fiddle::Importer
  dlload 'libc.so.6'
  extern 'int abs(int)'
end

puts MyLib.abs(-42)   # => 42
```

---

## 構造体を扱う例（ffi gem）

Cの構造体も`FFI::Struct`を使ってきれいに表現できる。

```ruby
require 'ffi'

class Timeval < FFI::Struct
  layout :tv_sec,  :long,
         :tv_usec, :long
end

module LibC
  extend FFI::Library
  ffi_lib 'c'
  attach_function :gettimeofday, [:pointer, :pointer], :int
end

tv = Timeval.new
LibC.gettimeofday(tv, nil)
puts tv[:tv_sec]   # 現在のUNIX時刻
```

---

## FFIとC拡張の違い

### 基本的な仕組み

**C拡張**は、`ruby.h`を使ってRuby専用のCコードを書く方式。ビルドして`.so`（Windowsなら`.dll`）を生成し、`require`で読み込む。

**FFI**は、既存の共有ライブラリ（`libc.so`、`libssl.so`、自作`.so`など）を実行時に読み込み、Ruby側でシグネチャ宣言して呼び出す方式。C側にRuby固有コードは不要。

### 主な比較ポイント

1. **実装場所**
   - C拡張: C側（Ruby内部APIを利用）
   - FFI: Ruby側で宣言して呼び出し

2. **ビルド要否**
   - C拡張: 必要（`extconf.rb` + `mkmf`）
   - FFI: 基本不要（純Rubyとして配布しやすい）

3. **パフォーマンス**
   - C拡張: 高速
   - FFI: 呼び出し時の型変換コストあり
   - ただし、呼び先C関数が重ければ差は目立たないことも多い

4. **Rubyとの親和性**
   - C拡張: Rubyオブジェクト、例外、GC連携、メソッド定義まで深く扱える
   - FFI: 基本は関数呼び出し中心（使いやすいAPIはRuby側でラップ）

5. **対象ライブラリ**
   - FFI: 既存Cライブラリ利用が得意
   - C拡張: Ruby向けAPI設計や密結合な実装が得意

6. **移植性**
   - FFI: MRI/JRuby/TruffleRubyで動かしやすい
   - C拡張: MRI依存が強くなりやすい

7. **安全性・デバッグ**
   - どちらもC側の不具合でプロセスごと落ちうる
   - C拡張はRuby内部API誤用によるGC周りのバグ調査が難しくなりやすい

---

## ざっくり比較表

| 項目 | C拡張 | FFI |
|---|---|---|
| 実装言語 | C（Ruby内部API使用） | Ruby中心 |
| ビルド | 必要 | 不要 |
| 速度 | 速い | やや遅い |
| Ruby親和性 | 高い | 低め（ラッパー前提） |
| JRuby等対応 | △ | ◎ |
| 配布の手軽さ | △ | ◎ |

---

## 使い分けの目安

- **既存Cライブラリを手早く使いたい** → FFI
- **ビルドなしで配布したい** → FFI
- **性能がシビア**、**Rubyオブジェクトを深く扱いたい** → C拡張

迷ったら、まずFFIで実装して、ボトルネックが出たところだけC拡張化する方針が安全。

---

## 主な型対応（ffi gem）

よく使う型は次のあたり。

- 整数: `:int` `:long` `:uint32` `:int64`
- 浮動小数: `:float` `:double`
- 文字列: `:string`
- 汎用ポインタ: `:pointer`
- 戻り値なし: `:void`

---

## まとめ

FFIは「既存C資産をRubyからすぐ使う」ための選択肢として非常に優秀。特に`ffi` gemは宣言的に書けるため、学習コストも低い。

一方で、Rubyと密に統合された高性能なAPIを作りたいならC拡張が強い。用途に応じて使い分けるのが最適解。

---

## 参考文献・リンク

- https://github.com/ffi/ffi
- https://github.com/ffi/ffi/wiki
- https://rubydoc.info/github/ffi/ffi
- https://docs.ruby-lang.org/ja/latest/library/fiddle.html
- https://docs.ruby-lang.org/en/3.4/extension_rdoc.html
- https://silverhammermba.github.io/emberb/
- https://github.com/ruby/ruby/tree/master/ext/fiddle

---
