---
title: '今日学んだこと：iframeに関して'
description: 'iframe(インラインフレーム)要素に関して'
pubDate: 2025-11-12
tags: ['iframe']
draft: false
customSlug: 'iflame_learning'
---

## 概要

今日は学習したトピックについて学んだ。


### ポイント1

`<iframe>` は HTML の要素で、入れ子になった閲覧コンテキストを表現し、
現在の HTML ページに別のページを埋め込むことができる。

### ポイント2

iframeタグは<body>~<body>内で使用する。src属性でフレーム内に表示する内容を指定することができる。
name属性でフレームに名前を付けることができ、そのインラインフレームをリンクの表示先としてしてできる。

X-Frame-Options: ALLOWALL と frame-ancestors * を設定することで、任意のサイトのiFrameにこのログインフォームを埋め込める

## 参考文献・リンク

https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/iframe

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options

---