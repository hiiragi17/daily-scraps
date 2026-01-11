---
title: '今日学んだこと：コナーセンスに関して'
description: 'コナーセンスに関して'
pubDate: 2025-09-10
tags: ['コナーセンス', 'ソフトウェアアーキテクチャの基礎']
draft: false
customSlug: 'connascence_learning'
---

## 概要

今日はコナーセンスについて学んだ。


### ポイント1

システムの全体的な正しさを維持するため、
あるコンポーネントの変更が別のコンポーネントの変更を必要とする場合、
2つのコンポーネントはコナーセント（接続）されている。

静的なコナーセンスとは、コードレベルでの結合を指す。
これは『ソフトウェアの構造化設計法』で定義された求心性と遠心性の結合を洗練させたものだ。
言い換えれば、アーキテクトは、次のような静的なコナーセンスの種類を、
求心的か遠心的かを問わず、何らかの結合の度合いとして捉えられる。

- 名前のコナーセンス（Connascence of Name：CoN）
- 型のコナーセンス（Connascence of Type：CoT）
- 意味のコナーセンス（Connascence of Meaning：CoM）
- 位置のコナーセンス（Connascence of Position：CoP）
- アルゴリズムのコナーセンス（Connascence of Algorithm：CoA）

### ポイント2

Pag-Jonesが定義したもう1つのコナーセンスの分類が、動的なコナーセンスだ。

- 実行順序のコナーセンス（Connascence of Execution：CoE）
- タイミングのコナーセンス（Connascence of Timing：CoT）
- 値のコナーセンス（Connascence of Values：CoV）
- アイデンティティのコナーセンス（Connascence of Identity：CoI）

動的なコナーセンスを評価するのは、
静的なコナーセンスを評価するのに比べるとずっと難しい。
なぜなら、コールグラフと同じくらい効率的に実行時呼び出しを分析できるツールを、
私たちはまだ手にしていないからだ。

---