---
title: '今日学んだこと：saveFormDataDisabledの意味'
description: 'React Native WebViewのsaveFormDataDisabled設定について理解する'
pubDate: 2025-12-22
tags: ['React Native', 'WebView', 'Android', 'フォームデータ', 'パスワード管理']
draft: false
customSlug: 'saveformdata_learning'
---

## 概要

今日はReact Native WebViewの`saveFormDataDisabled`設定について学んだ。この設定は、WebView内のフォームデータ（メールアドレスやパスワードなど）を保存するかどうかを制御する。

## saveFormDataDisabledとは

この設定名は以下の3つの部分で構成されている：

- **save** = 保存する
- **FormData** = フォームデータ
- **Disabled** = 無効化

### 設定値の意味

```typescript
saveFormDataDisabled: false
```

- ❌ **false** = 「フォームデータの保存を無効化」**しない**
  - = 「フォームデータの保存」を **許可** する

```typescript
saveFormDataDisabled: true
```

- ✅ **true** = 「フォームデータの保存を無効化」**する**
  - = 「フォームデータの保存」を **禁止** する

## 具体例でわかりやすく

### false の場合（現在の設定）

```typescript
saveFormDataDisabled: false  // ← フォームデータ保存を許可
```

1. ユーザーがログインフォームを送信
2. Google Password Manager が検出
3. 「パスワードを保存しますか？」ダイアログが出現
4. ユーザーが保存をタップ
5. ✅ Google Password Manager に保存される

### true の場合（禁止）

```typescript
saveFormDataDisabled: true  // ← フォームデータ保存を禁止
```

1. ユーザーがログインフォームを送信
2. Google Password Manager が検出するが...
3. ❌ WebView の設定で禁止されているので保存されない
   - ダイアログも出ない可能性がある

## 簡潔に言うと

| 設定 | 意味 | 結果 |
|------|------|------|
| `saveFormDataDisabled: false` | フォーム保存を許可 | ✅ パスワード保存ダイアログが出現 |
| `saveFormDataDisabled: true` | フォーム保存を禁止 | ❌ パスワード保存ダイアログが出ない |

## "フォームデータ" とは何か

```html
<form>
  <input name="email" value="user@example.com">
  <input name="password" value="mypassword123">
</form>
```

この入力値（**メールアドレスとパスワード**）を保存するかどうかを制御する。

- `false` = 保存を許可 → Google Password Manager や iCloud Keychain が「これを保存しますか？」と聞いてくる
- `true` = 保存を禁止 → 保存ダイアログが出ないように制御

## 実装例

### 現在のコード

```typescript
{...Platform.select({
  android: {
    saveFormDataDisabled: false,  // ✅ Android ではパスワード保存を許可
    textZoom: 100,
  },
  ios: {},  // iOS は特に設定不要（iCloud Keychain が自動的に動作）
  default: {}
})}
```

## 補足：プラットフォーム別の挙動

実は `saveFormDataDisabled` は **Android 専用** の設定：

- **iOS** → iCloud Keychain が自動的に動作するので、この設定は不要
- **Android** → Google Password Manager を有効化するために必要

## まとめ

- `saveFormDataDisabled` は「フォームデータの保存を無効化するかどうか」を制御する設定
- `false` に設定することでパスワードマネージャーの保存機能が有効になる
- Android専用の設定で、iOSでは不要
- ユーザー体験を向上させるため、基本的には `false`（保存を許可）に設定するのが推奨される

---
