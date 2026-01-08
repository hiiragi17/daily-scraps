
---
title: '今日学んだこと：経営戦略マネジメントに関して'
description: '基本情報の問題で出てくる経営戦略マネジメント'
pubDate: 2026-1-7
tags: ['ord', 'char']
draft: false
slug: 'ord_chr_learning'
---

## 概要

今日は経営戦略マネジメントについて学んだ。

### 学んだこと

ord():
1 文字の Unicode 文字を表す文字列に対し、その文字の Unicode コードポイントを表す整数を返す。
例えば、 ord('a') は整数 97 を返し、 ord('€') (ユーロ記号) は 8364 を返す。
これは chr() の逆。

chr():
Unicode コードポイントが整数 i である文字を表す文字列を返す。
例えば chr(97) は文字列 'a' を、 chr(8364) は文字列 '€' を返す。 
ord() の逆。

引数の有効な範囲は 0 から 1,114,111 (16 進数で 0x10FFFF) 。
 i が範囲外の場合 ValueError が送出される。

### 参考文献

https://docs.python.org/ja/3.11/library/functions.html#ord

https://docs.python.org/ja/3.11/library/functions.html#chr

---


