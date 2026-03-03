---
title: '今日学んだこと：map / map + compact / filter_map の違い'
description: 'Rubyのmap、map + compact、filter_mapの使い分けとパフォーマンスの違い'
pubDate: 2026-03-03
tags: ['Ruby', 'map', 'map + compact', 'filter_map']
draft: false
customSlug: 'ruby_map_filter_map'
---

## 概要

今日はRubyの配列操作メソッド `map`、`map + compact`、`filter_map` の違いと使い分けについて学んだ。

| メソッド | 説明 |
|---|---|
| `map` | 全要素を変換する |
| `map + compact` | 変換後に `nil` を除去する |
| `filter_map` | 変換 + `nil` 除去を一度に行う |

## コードで比較

```ruby
numbers = [1, 2, 3, 4, 5]

# 偶数だけ2倍にして、奇数はnilにしたい場合

# ① map → nilが残る
numbers.map { |n| n.even? ? n * 2 : nil }
# => [nil, 4, nil, 8, nil]

# ② map + compact → nilを除去
numbers.map { |n| n.even? ? n * 2 : nil }.compact
# => [4, 8]

# ③ filter_map → 一発で同じ結果
numbers.filter_map { |n| n * 2 if n.even? }
# => [4, 8]
```

## それぞれの使いどころ

### `map`

- **全要素を変換したい**（nil を残したくても残したくなくても）
- nilが出ない確信があるとき

```ruby
users.map { |u| u.name }
# => ["Alice", "Bob", "Carol"]
```

### `map + compact`

- レガシーコードや、処理を分けて読みやすくしたいとき
- ただし **2回イテレーションが走る** のでやや非効率

```ruby
users.map { |u| u.premium? ? u.name : nil }.compact
```

### `filter_map`

- **変換しつつ条件で絞り込みたい** ときのベストプラクティス（Ruby 2.7+）
- `map + compact` より **パフォーマンスが良い**（1回のイテレーション）
- コードも簡潔になる

```ruby
users.filter_map { |u| u.name if u.premium? }
```

## パフォーマンスのイメージ

```
map + compact  → 配列を2回なめる（map で1回、compact で1回）
filter_map     → 配列を1回なめるだけ
```

## まとめ

- nilが出ない → **`map`**
- nilを除きたい（古いRuby or 可読性優先）→ **`map + compact`**
- nilを除きたい（モダンなRuby）→ **`filter_map`** ✅ ← 基本これを使う
