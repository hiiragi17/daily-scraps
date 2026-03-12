---
title: '今日学んだこと：Stimulus（軽量JavaScriptフレームワーク）'
description: 'BasecampがRails向けに開発した軽量JSフレームワーク「Stimulus」の概要・3つの主要概念・ReactやVueとの違いをまとめた'
pubDate: 2026-03-12
tags: ['JavaScript', 'Stimulus', 'Rails', 'フロントエンド']
draft: false
customSlug: 'stimulus-js-framework'
---

## 概要

Stimulus とは、**HTMLに少しだけJavaScriptの動きを加えるための軽量フレームワーク**である。Basecampが開発しており、Rails等のサーバーサイドレンダリング環境との相性が非常によい。

---

## ReactやVueとの違い

| | React / Vue | Stimulus |
|---|---|---|
| 考え方 | JSがHTMLを生成する | すでにあるHTMLにJSを紐づける |
| 規模感 | フロント全体を管理 | ちょっとした動きをつける |
| 向いてるケース | SPA | Rails等のサーバー側レンダリング |

Railsはサーバーでいい感じのHTMLを作るのが得意である。Stimulusはそれを活かして「**あとちょっとだけ動きをつけたい**」という場面に使う。

---

## 3つの主要概念

### Controller — JavaScriptの処理をまとめたクラス

```html
<div data-controller="hello">
```
```js
// hello_controller.js
export default class extends Controller {
  greet() { ... }
}
```

### Target — JSから操作したいHTML要素に印をつける

```html
<input data-hello-target="name">
```
```js
this.nameTarget.value  // JS側から取得できる
```

### Action — イベント（クリックなど）とメソッドを紐づける

```html
<button data-action="click->hello#greet">
  Greet
</button>
```

「クリックしたら `hello` コントローラーの `greet` を呼ぶ」という意味である。

---

## まとめ

- **何のため？** → サーバーレンダリング済みのHTMLに、最小限のJS動作を付け加えるため
- **ReactやVueとの違い？** → JSでHTMLを生成するのではなく、すでにあるHTMLにJSを紐づける
- **3つの概念は？** → Controller（処理のクラス）・Target（操作対象の要素）・Action（イベントとメソッドの紐づけ）
- **キーワードで覚えるなら？** → `data-` 属性でHTMLとJSを繋ぐやつ

## 参考文献

- [Stimulus 公式ドキュメント](https://stimulus.hotwired.dev/)
- [Hotwire 公式サイト](https://hotwired.dev/)
