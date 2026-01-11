---
title: '今日学んだこと：Web API:the Good Parts第2章まとめ'
description: 'Web API:the Good Parts 第二章をまとめた。'
pubDate: 2025-09-21
tags: ['Web API:the Good Parts']
draft: false
customSlug: 'web_api2'
---

## 概要

今日はWeb API:the Good Partsについて学んだ。


### ポイント1

Web APIのエンドポイントはURIなので、
一般的なウェブページのURIの設計の考え方がそのまま適用できるほか、
APIならではのルール、デファクトスタンダードが存在している。
基本的には、URIが「リソース」を表すものであり、URIとHTTPのメソッドの組み合わせで処理の対象と内容を表す。

[Good] 覚えやすく、どんな機能を持つかがひと目でわかるエンドポイントにする
[Good] 適切なHTTPメソッドを利用する
[Good] 適切な英単語を利用し、単数形、複数形にも注意する
[Good] 認証にはOAuth 2.0を使う

---
