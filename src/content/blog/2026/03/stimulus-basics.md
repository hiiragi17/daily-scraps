---
title: '今日学んだこと：Stimulus の基本概念'
description: 'HTMLに少しだけJavaScriptの動きを加える軽量フレームワーク Stimulus の概要と主要概念'
pubDate: 2026-03-12
tags: ['JavaScript', 'Stimulus', 'Rails']
draft: false
customSlug: 'stimulus-basics'
---

## 概要

Stimulus は「**HTMLに少しだけJavaScriptの動きを加えるための軽量フレームワーク**」である。Basecampが作っている。

---

## ReactやVueとの違い

| | React / Vue | Stimulus |
|---|---|---|
| 考え方 | JSがHTMLを生成する | すでにあるHTMLにJSを紐づける |
| 規模感 | フロント全体を管理 | ちょっとした動きをつける |
| 向いてるケース | SPA | Rails等のサーバー側レンダリング |

Railsはサーバーでいい感じのHTMLを作るのが得意なので、Stimulusはそれを活かして「**あとちょっとだけ動きをつけたい**」という場面に使う。

---

## 3つの主要概念

**① Controller** — JavaScriptの処理をまとめたクラス

```html
<div data-controller="hello">
```
```js
// hello_controller.js
export default class extends Controller {
  greet() { ... }
}
```

**② Target** — JSから操作したいHTML要素に印をつける

```html
<input data-hello-target="name">
```
```js
this.nameTarget.value  // JS側から取得できる
```

**③ Action** — イベント（クリックなど）とメソッドを紐づける

```html
<button data-action="click->hello#greet">
  Greet
</button>
```

「クリックしたら `hello` コントローラーの `greet` を呼ぶ」という意味である。

---

## まとめ

Railsとの相性が抜群で、once-campfire もこの仕組みでチャットのリアルタイム更新などを実現している。`data-` 属性でHTMLとJSを繋ぐ仕組みとして押さえておくと、Railsプロジェクトのコードが読みやすくなる。
