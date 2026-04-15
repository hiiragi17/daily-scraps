---
title: '今日学んだこと：YJITとは何か'
description: 'Ruby 3.1から標準搭載されたJITコンパイラ「YJIT」の仕組みと使い方、ZJITとの違いをまとめた。'
pubDate: 2026-04-15
tags: ['Ruby', 'YJIT', 'JIT', 'コンパイラ', 'Shopify', 'パフォーマンス']
draft: false
customSlug: 'yjit-overview'
---

YJITは、**Ruby 3.1から標準搭載されたJITコンパイラ**だ。ShopifyとRubyコアチームが共同で開発し、Shopifyの本番環境で鍛えられてきた実績がある。

---

## JITとは何か（おさらい）

Rubyは通常、インタープリタがコードを1行ずつ読み取って実行する。

```
Rubyコード → インタープリタが読んで → 1行ずつ実行
```

毎回「読んで解釈して実行」を繰り返すので、それなりにオーバーヘッドがかかる。

**JIT（Just-In-Time コンパイラ）** はこれを改善する仕組みだ。

```
Rubyコード
  ↓ 何度も呼ばれるコードを検出
  ↓ そのコードをCPUが直接実行できる「機械語」に変換
  → 次回以降は高速な機械語で実行
```

---

## YJITの特徴：「使いながら賢くなる」

YJITの面白い点は**動かしながら学習する**ところだ。

```ruby
def add(a, b)
  a + b
end

add(1, 2)      # 最初はインタープリタで実行
add(3, 4)      # 何度も呼ばれると…
add(5, 6)      # YJITが「このメソッドは頻繁に使われる！」と判断
               # 機械語にコンパイルして高速化
```

さらに「型の推測」も行う。

```ruby
# addが毎回Integerで呼ばれていると学習したら
# 「次もIntegerだろう」と仮定した最適なコードを生成
```

仮定が外れた場合でも、インタープリタに安全に戻れる仕組みが用意されている。これを**サイドエグジット**と呼ぶ。

---

## どのくらい速くなるの？

| 環境 | 効果 |
|---|---|
| Shopify本番環境 | 約20〜25%高速化 |
| Discourse | 約10〜20%高速化 |
| Railsベンチマーク | 平均15〜20%高速化 |

長時間動くサーバーアプリほど恩恵が大きい。起動直後はまだコンパイルが進んでいないため、ウォームアップが必要なためだ。

---

## 使い方は簡単

```bash
# フラグをつけるだけ
ruby --yjit app.rb

# Railsなら
RUBY_YJIT_ENABLE=1 bundle exec rails s
```

Ruby 3.3以降はデフォルトで有効になっているため、何もしなくても恩恵を受けられる。

---

## YJITとZJITの違い

ZJITの記事でも触れたが、改めて整理する。

```
YJIT（Ruby 3.1〜）
  ├ 今すぐ使える・安定している
  ├ Shopify等で本番稼働中の実績あり
  └ Ruby 3.3からデフォルト有効

ZJIT（Ruby 4.0〜 experimental）
  ├ YJITの後継として開発中
  ├ メソッド全体をコンパイル単位とし、SSA-IRで最適化
  └ まだ本番利用は非推奨
```

現時点では **YJIT = 使える・速い・安定、ZJIT = 将来への投資** という位置づけだ。

---

## まとめ

YJIT ＝ Rubyを速くする仕組みで今すぐ使えるもの

- Ruby 3.3からデフォルト有効（意識しなくてもOK）
- 長時間動くRailsアプリで特に効果大
- Shopifyが開発・実績あり
- 難しい設定不要、`--yjit` フラグだけで試せる

---

## 参考文献・リンク

https://shopify.engineering/yjit-just-in-time-compiler-cruby

https://github.com/ruby/ruby/blob/master/doc/yjit/yjit.md

https://www.ruby-lang.org/en/news/2021/12/25/ruby-3-1-0-released/

https://www.ruby-lang.org/en/news/2023/12/25/ruby-3-3-0-released/

---
