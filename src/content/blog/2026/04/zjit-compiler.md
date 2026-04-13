---
title: '今日学んだこと：ZJITとは何か'
description: 'Ruby 4.0で導入された次世代JITコンパイラ「ZJIT」の仕組みと、YJITとの違いを整理した。'
pubDate: 2026-04-13
tags: ['Ruby', 'ZJIT', 'YJIT', 'JIT', 'コンパイラ']
draft: false
customSlug: 'zjit-compiler'
---

ZJIT（Zee JIT）は、Ruby 4.0に搭載された次世代のJITコンパイラだ。現時点ではexperimental扱いだが、Ruby 4.1での本番対応を目標に開発が続いている。

---

## JITとは何か

Rubyは通常、インタープリタがコードを1行ずつ読み取って実行する。柔軟ではあるが、毎回「読んで解釈して実行」を繰り返すのでオーバーヘッドが生じる。

**JIT（Just-In-Time コンパイラ）** はこれを改善する仕組みだ。

```
Rubyコード
  ↓ 何度も呼ばれるメソッドを検出
  ↓ そのメソッドだけ機械語（CPUが直接実行できるコード）に変換
  → 次回からは高速な機械語で実行
```

料理で言えば、毎回レシピを見ながら作る（インタープリタ）のではなく、よく作る料理の手順を完全に暗記して手早く仕上げる（JIT）イメージだ。

---

## YJITからZJITへ

ZJITの前身は **YJIT**（Ruby 3.1〜）だ。ShopifyとRubyコアチームが共同で開発し、Ruby 2.7比で約20%の速度改善を達成した。Shopify・Discourse・Mastodonなどでは最大30%の速度向上が報告されている。

しかしYJITはパフォーマンスの頭打ちに近づいており、さらなる改善のために新しいアーキテクチャが必要になってきた。それがZJITだ。

| | YJIT | ZJIT |
|---|---|---|
| コンパイル単位 | 基本ブロック単位 | **メソッド全体** |
| 中間表現 | なし（直接機械語） | **SSA-IR（最適化しやすい形式）** |
| 最適化の余地 | 限界に近い | より大きな改善が見込める |

**SSA-IR（Static Single Assignment Intermediate Representation）** とは、各変数への代入が1回しか行われないという制約を持つ中間表現だ。この形式にすることで、デッドコード除去・定数畳み込みといった最適化パスを適用しやすくなる。

---

## Ruby 4.0でのZJITの現状

ZJITはRuby 4.0のバイナリにデフォルトでコンパイルされているが、実行時には有効になっていない。パフォーマンスと安定性の観点から、Ruby 4.0ではYJITが依然としてデフォルトのコンパイラだ。

試したい場合は以下のどちらかで有効化できる。

```bash
# フラグで有効化
ruby --zjit my_script.rb

# 環境変数で有効化
RUBY_ZJIT_ENABLE=1 ruby my_script.rb
```

Ruby 4.0時点ではZJITはインタープリタよりは速いが、YJITほどの速度にはまだ達していない。実験的な利用は推奨されているが、本番環境へのデプロイは現時点では控えることが推奨されている。

---

## まとめ

```
ZJIT ＝ 次世代のRuby高速化エンジン
・Ruby 4.0に搭載（experimental）
・メソッド全体をコンパイル単位とし、SSA-IRで最適化
・今はYJITの方がまだ速い
・Ruby 4.1でYJITを超えることを目標に開発中
・普通のRailsアプリ開発者は今すぐ意識しなくてOK
```

---

## 参考文献・リンク

https://railsatscale.com/2025-02-10-zjit-a-new-ruby-jit/

https://bugs.ruby-lang.org/issues/21172

https://github.com/ruby/ruby/tree/master/zjit

https://www.ruby-lang.org/en/news/2025/12/25/ruby-4-0-0-released/

---
