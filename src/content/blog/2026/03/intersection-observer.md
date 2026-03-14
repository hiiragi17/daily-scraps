---
title: '今日学んだこと：IntersectionObserver（要素の表示検知API）'
description: '要素が画面に見えたかどうかを効率的に監視するブラウザAPI「IntersectionObserver」の概要・使い方・従来手法との違いをまとめた'
pubDate: 2026-03-14
tags: ['JavaScript', 'ブラウザAPI', 'パフォーマンス', 'フロントエンド']
draft: false
customSlug: 'intersection-observer'
---

## 概要

IntersectionObserver とは、**ある要素が画面（ビューポート）に見えてきたかどうかを監視するブラウザのAPI**である。スクロールイベントを使わずに、要素の表示・非表示を非同期で検知できる。

---

## どんな場面で使われるか

- ページ下部に近づくと次のコンテンツが自動で読み込まれる（**無限スクロール**）
- 画像が画面に入ったタイミングで表示される（**遅延読み込み / Lazy Load**）
- 要素が見えたときにアニメーションが始まる（**スクロールアニメーション**）
- メッセージが画面に入ったときに既読処理を走らせる（**チャットアプリ**）

---

## 従来の方法との違い

| | scroll イベント | IntersectionObserver |
|---|---|---|
| 仕組み | スクロールのたびに位置を計算 | 見えたときだけ非同期で通知 |
| パフォーマンス | 重い（毎回計算が走る） | 軽い（ブラウザが最適化） |
| コード量 | 多い（位置計算を自分で書く） | 少ない（APIに任せる） |

### 従来のやり方（scroll イベント）

```js
// スクロールのたびに計算が走るので重い
window.addEventListener("scroll", () => {
  const element = document.querySelector(".target")
  const rect = element.getBoundingClientRect()
  if (rect.top < window.innerHeight) {
    // 見えた！
  }
})
```

### IntersectionObserver を使ったやり方

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 要素が画面に入った！
      console.log("見えた！")
    }
  })
})

observer.observe(document.querySelector(".target"))
```

---

## 主なメソッド

| メソッド | 意味 |
|---|---|
| `observe(要素)` | 指定した要素の監視を開始する |
| `unobserve(要素)` | 指定した要素の監視を停止する |
| `disconnect()` | 全ての監視を停止する |

---

## オプション（threshold・rootMargin）

IntersectionObserver にはオプションを渡すことで、通知のタイミングを細かく制御できる。

```js
const observer = new IntersectionObserver(callback, {
  threshold: 0.5,       // 要素が50%見えたら通知
  rootMargin: "100px",  // 画面の100px手前で通知（先読みに便利）
})
```

| オプション | 意味 |
|---|---|
| `threshold` | 要素がどれだけ見えたら通知するか（0〜1） |
| `rootMargin` | 検知範囲を広げる／狭める（CSS風の指定） |
| `root` | 監視の基準となる要素（デフォルトはビューポート） |

---

## 実用例：画像の遅延読み込み

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src  // data-src から本来のURLを設定
      observer.unobserve(img)    // 読み込んだら監視を解除
    }
  })
})

document.querySelectorAll("img[data-src]").forEach(img => {
  observer.observe(img)
})
```

---

## まとめ

- **何のため？** → 要素が画面に見えたかどうかを効率的に検知するため
- **従来との違い？** → scroll イベントで毎回計算する代わりに、ブラウザが非同期で通知してくれる
- **主なメソッドは？** → `observe`（監視開始）・`unobserve`（監視停止）・`disconnect`（全停止）
- **キーワードで覚えるなら？** → 「見えたら教えてくれるAPI」

## 参考文献

- [MDN Web Docs - IntersectionObserver](https://developer.mozilla.org/ja/docs/Web/API/IntersectionObserver)
- [MDN Web Docs - Intersection Observer API](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API)
