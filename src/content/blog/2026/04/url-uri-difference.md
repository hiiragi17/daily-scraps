---
title: '今日学んだこと：URLとURIの違い'
description: 'URIが「広い概念」でURLはその一種。混同しがちな両者の関係と、実務での使い分けを整理した。'
pubDate: 2026-04-17
tags: ['Web', 'URI', 'URL', 'URN', 'HTTP', 'ネットワーク']
draft: false
customSlug: 'url-uri-difference'
---

結論から言うと、**URIが「広い概念」で、URLはその中の一種類**だ。すべてのURLはURIだが、すべてのURIがURLというわけではない。

---

## それぞれの意味

**URI（Uniform Resource Identifier）** は「統一資源識別子」と訳される。インターネット上の「リソース（資源）」を識別するための文字列の総称だ。ここでいうリソースとは、Webページ・画像・動画・ファイル・書籍など、何かを指し示せるもの全般を意味する。

**URL（Uniform Resource Locator）** は「統一資源位置指定子」と訳される。リソースが「どこにあるか（場所）」を示す文字列だ。ブラウザのアドレスバーに入力する `https://example.com/page.html` のようなものがこれにあたる。

---

## 関係を整理する

人を識別する方法を考えてみよう。

「山田太郎」という名前で呼ぶ方法と、「東京都新宿区〇〇町1-2-3に住んでいる人」と住所で呼ぶ方法がある。どちらも同じ人を指せるが、前者は「名前による識別」、後者は「場所による識別」だ。

URIはこの両方を含む大きな概念で、URLは「住所による識別」にあたる。一方、「名前による識別」にあたるのが **URN（Uniform Resource Name）** で、これもURIの一種だ。

```
URI（識別子の総称）
├── URL（場所で示す）   例：https://example.com/index.html
└── URN（名前で示す）   例：urn:isbn:978-4-12-345678-9
```

---

## 具体例で比べる

| 文字列 | 種別 | 理由 |
|---|---|---|
| `https://www.example.com/photo.jpg` | URL（かつURI） | サーバーとパスという「場所」を示している |
| `urn:isbn:978-4-12-345678-9` | URN（かつURI） | ISBNという「名前」で本を示している。どこにあるかは不明 |

`https://www.example.com/photo.jpg` はURLだ。`example.com` というサーバーの `photo.jpg` というファイルという**場所**を示しているからだ。同時にこれはURIでもある（URLはURIの一種なので）。

`urn:isbn:978-4-12-345678-9` はURNだ。特定の本をISBN番号という**名前**で指しているが、その本が書店にあるのか図書館にあるのかは示していない。これもURIの一種だ。

---

## 実務での使い分け

日常会話やWeb開発の現場では「URL」という言葉が圧倒的によく使われ、ほとんどの場合それで通じる。

ただし、技術仕様書では正確性のために「URI」という用語が使われることが多い。

```java
// Javaの標準ライブラリ
java.net.URI  // より広い概念を扱う
java.net.URL  // URLに特化したクラス
```

HTMLの仕様書やRFC文書でも「URI」が使われるのは、URLだけでなくURNなどより広い識別子も対象に含めるためだ。

---

## まとめ

```
URI ＝ リソースを識別する文字列の総称
URL ＝ その中でも「場所（アドレス）」で示すもの
URN ＝ その中でも「名前」で示すもの

日常会話 → 「URL」で問題なし
技術文書で「URI」を見かけたら → URLも含む広い意味だと理解する
```

---

## 参考文献・リンク

https://www.rfc-editor.org/rfc/rfc3986

https://url.spec.whatwg.org/

https://developer.mozilla.org/ja/docs/Glossary/URI

https://developer.mozilla.org/ja/docs/Glossary/URL

---
