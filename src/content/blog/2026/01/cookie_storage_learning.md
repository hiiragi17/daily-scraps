---
title: '今日学んだこと：Cookie、LocalStorage、SessionStorageに関して'
description: 'Cookie、LocalStorage、SessionStorageに関して'
pubDate: 2026-1-11
tags: ['Cookie', 'LocalStorage', 'SessionStorage']
draft: false
customSlug: 'cookie_storage_learning'
---

## 概要

今日はCookie、LocalStorage、SessionStorageについて学んだ。

### 学んだこと

SessionStorage、LocalStorage、Cookiesの詳細比較

| 特徴 | Cookie | LocalStorage | SessionStorage |
|------|--------|--------------|----------------|
| **保存容量** | 約4KB | 約5-10MB | 約5-10MB |
| **有効期限** | 設定可能（デフォルトはセッション終了まで） | 永続的（手動削除まで） | タブを閉じるまで |
| **サーバー送信** | 毎回自動送信 | 送信されない | 送信されない |
| **スコープ** | ドメイン・パス単位 | オリジン単位 | タブ・オリジン単位 |
| **JSアクセス** | 可能（HttpOnlyで制限可） | 常に可能 | 常に可能 |
| **対応ブラウザ** | すべて（古いブラウザも対応） | HTML5対応ブラウザ | HTML5対応ブラウザ |
| **同一オリジンの別タブ** | 共有される | 共有される | 共有されない |

1. Cookie（クッキー）

- **HTTPプロトコルの一部**として設計されている
- サーバーとブラウザ間でデータをやり取りする仕組み
- リクエストのたびに自動的にサーバーに送信される

設定できる属性

| 属性 | 説明 | 例 |
|------|------|-----|
| `expires` | 有効期限 | `expires=Fri, 31 Dec 2025 23:59:59 GMT` |
| `max-age` | 有効期限（秒数指定） | `max-age=3600`（1時間） |
| `path` | 有効なパス | `path=/` または `path=/admin` |
| `domain` | 有効なドメイン | `domain=.example.com` |
| `secure` | HTTPS通信のみ | `secure` |
| `HttpOnly` | JavaScriptからアクセス不可 | `HttpOnly` |
| `SameSite` | CSRF対策 | `SameSite=Strict` / `Lax` / `None` |

主な用途
- **セッション管理**（ログイン状態の維持）
- **認証トークンの保存**（セキュリティ設定と併用）
- **トラッキング**（アクセス解析、広告配信）
- **ユーザー識別**（リピーター判定）

メリット
- サーバー側で簡単にデータを読み書きできる
- `HttpOnly`でXSS攻撃から保護できる
- `Secure`でHTTPS通信のみに制限できる
- 有効期限を細かく設定できる

デメリット
- 容量が小さい（4KB程度）
- 毎回サーバーに送信されるので通信量が増える
- 設定が複雑

2. LocalStorage（ローカルストレージ）

特徴
- **ブラウザに永続的にデータを保存**
- JavaScriptからのみアクセス可能
- サーバーには送信されない
- 同じオリジンの全タブで共有される

主な用途
- **ユーザー設定の保存**（テーマ、言語設定、表示設定）
- **アプリケーションの状態保存**（ゲームのスコア、進捗状況）
- **オフライン対応**（データのキャッシュ）
- **フォームの下書き保存**（長期間保持したい場合）

メリット
- 容量が大きい（5-10MB）
- 永続的に保存される
- APIがシンプルで使いやすい
- サーバー通信が不要

デメリット
- セキュリティ設定ができない（常にJavaScriptからアクセス可能）
- XSS攻撃に脆弱
- 同期的な処理なので大量データの読み書きでブロッキングが発生
- サーバー側からアクセスできない

3. SessionStorage（セッションストレージ）

### 特徴
- **タブが開いている間だけデータを保存**
- LocalStorageと同じAPIを使用
- タブごとに独立したストレージ
- ページをリロードしてもデータは残る

### 主な用途
- **フォーム入力の一時保存**（タブを閉じたら消したい場合）
- **ウィザード形式の入力データ**（複数ステップのフォーム）
- **一時的な状態管理**（現在のページ番号、フィルター条件）
- **タブ固有のデータ**（動画の再生位置など）

メリット
- タブを閉じたら自動的に削除される（セキュリティ的に安心）
- LocalStorageと同じAPIで使いやすい
- 容量が大きい（5-10MB）
- タブごとに独立している

デメリット
- LocalStorageと同じセキュリティリスク（XSS攻撃に脆弱）
- タブをまたいでデータを共有できない
- サーバー側からアクセスできない

詳細比較：技術的な視点

データの保存場所

```
Cookie:
/Users/username/Library/Application Support/Google/Chrome/Default/Cookies
↑ SQLiteデータベースに暗号化されて保存（macOSの場合）

LocalStorage/SessionStorage:
/Users/username/Library/Application Support/Google/Chrome/Default/Local Storage/
↑ LevelDBに平文で保存
```
セキュリティ比較

XSS攻撃への耐性

| ストレージ | 脆弱性 | 対策 |
|-----------|--------|------|
| **Cookie** | `HttpOnly`なし: 脆弱<br>`HttpOnly`あり: 安全 | `HttpOnly; Secure; SameSite=Strict`を設定 |
| **LocalStorage** | に脆弱 | 機密情報を保存しない |
| **SessionStorage** | 常に脆弱 | 機密情報を保存しない |

CSRF攻撃への耐性

| ストレージ | 脆弱性 | 対策 |
|-----------|--------|------|
| **Cookie** | `SameSite`なし: 脆弱<br>`SameSite`あり: 安全 | `SameSite=Strict`または`Lax`を設定 |
| **LocalStorage** | サーバーに送信されないので影響なし | - |
| **SessionStorage** | サーバーに送信されないので影響なし | - |

推奨される保存データ

```javascript
// Cookie（HttpOnly + Secure付き）
// - セッションID
// - 認証トークン
// - リフレッシュトークン

// LocalStorage
// - ユーザー設定（テーマ、言語）
// - キャッシュデータ
// - 非機密な状態情報

// SessionStorage  
// - フォーム入力の一時保存
// - ウィザードの途中状態
// - 一時的なフィルター条件

// 保存してはいけないもの（どのストレージでも）
// - パスワード
// - クレジットカード情報
// - 個人を特定できる機密情報（マイナンバーなど）
```

パフォーマンス比較

| 操作 | Cookie | LocalStorage | SessionStorage |
|------|--------|--------------|----------------|
| **読み込み速度** | 遅い（パース必要） | 速い | 速い |
| **書き込み速度** | 遅い | 同期処理なので大量データは遅い | 同期処理なので大量データは遅い |
| **ネットワーク影響** | 毎回送信で帯域使用 | 影響なし | 影響なし |

### 参考文献

1. **MDN Web Docs - HTTP Cookie**  
   https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies

2. **MDN Web Docs - Web Storage API**  
   https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API

3. **MDN Web Docs - Window.localStorage**  
   https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage

4. **MDN Web Docs - Window.sessionStorage**  
   https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage

---


