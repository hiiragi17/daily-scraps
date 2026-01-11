
---
title: '今日学んだこと：Webviewに関して'
description: 'Webviewに関して'
pubDate: 2025-10-24
tags: ['Webview']
draft: false
customSlug: 'webview_learning'
---

## 概要

今日はWebviewについて学んだ。

### 学んだこと

Webviewとは、その名の通りウェブコンテンツを表示するためのビュー（画面）のこと。ウェブページをアプリ内でも容易に閲覧するための機能で、多くのアプリで利用されている。例えば、ニュースアプリではWebviewを用いて各記事を表示できるようになっていたり、SNSアプリでは、外部リンクをクリックした際にリンク先のWebページをアプリ内で表示する。これにより、ユーザーはアプリを閉じてブラウザを開く手間を省くことができる。

アプリでは原則ネイティブの画面で実装したほうがパフォーマンス面やアクセシビリティの観点で望ましいが、いくつかの理由でWebviewを採用することがありえる。

既存のWebで実装された画面の流用で、再利用するほうがコストが掛からないため
HTMLなど、アプリ上でのレンダリングが難しいコンテンツを描画するため

ReactNativeでは、
react-native-webviewというライブラリを使う。

### 参考文献

https://digiclue.jp/columns/webview/

https://zenn.dev/manalink_dev/articles/manalink-react-native-webview

---


