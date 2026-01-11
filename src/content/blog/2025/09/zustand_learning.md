---
title: '今日学んだこと：Zustandに関して'
description: 'Zustandに関して'
pubDate: 2025-09-06
tags: ['Zustand', 'persist']
draft: false
customSlug: 'zustand_learning'
---

## 概要

今日はZustandについて学んだ。

### Zustandとは
Zustandは、Reactアプリ向けの軽量でシンプルな状態管理ライブラリ。
そのAPIはReactフックにもとづいており、直感的に扱える設計が特徴。
初心者でも簡単に導入できるため、初めての状態管理ライブラリとしても適している。

Zustandという名前はドイツ語で「状態」を意味する。
発音については、ドイツ語風に「ツーシュタント」と読まれることもあれば、
英語圏では「ズースタンド」と呼ばれることが多い。
その正確な発音は地域や発信者によって異なる場合がある。

### 状態管理ライブラリとは

状態管理ライブラリとは、
アプリ内で使用されるデータ（状態）を効率的かつ一元的に管理するためのツール。

状態とはアプリの「現在の状況」を表すもの。
「状態（state）」とは、アプリが「今どんな状況にあるか」を示すデータのこと。
例えば、以下のようなデータが状態に該当する。

- ユーザーのログイン状態
- ショッピングカートに入っている商品
- フォームに入力されたテキスト

これらの状態は、ユーザーの操作によって頻繁に変化する。
適切に管理することで、アプリの動作がスムーズになり、
ユーザー体験を向上させることができる。

### 状態管理ライブラリが必要な理由
Reactには useState や useReducer といった状態管理の仕組みが用意されている。
しかし、アプリが大規模になるにつれて、以下のような問題が発生することがある。

- 状態の複雑化

アプリが扱う状態が増えると、「どの状態がどこで管理されているのか」が分かりにくくなり、開発や保守が難しくなる。

- 状態の共有の複雑さ

親コンポーネントから子コンポーネントへ状態を渡す際に、「バケツリレー」のようなコードが増え、全体の可読性が低下する。

- パフォーマンスの問題

状態の変更による不要な再レンダリングが発生し、アプリの動作が遅くなる場合がある。

このような課題を解決するために、状態管理ライブラリが役立つ。
状態を一元管理し、コンポーネント間で簡単に共有できるようにすることで、
コードの可読性や保守性を向上させることができる。

### 使用例
zustandのcreateメソッドを使うことで状態管理のストアを作成することができる。
stateの初期値の設定とcreateメソッドに以下の関数が備わっている。

get()： storeの値を参照する
set()： 状態を更新する
上記があるのでstoreの中で状態と更新ロジックをstoreの中で作成することができる。

```typescript
// アプリ全体で共有される認証情報を保存
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,           // ログインしているユーザー情報
      isLoading: false,     // 処理中かどうか
      isAuthenticated: false, // ログイン済みかどうか
      error: null,          // エラー情報
      
      // 各種機能...
    })
  )
);
```

### presist 永続化

persistとというstateを永続化するためのミドルウェアがある。
storeを作る時にpersistを使うことでstateをlocalStorageに保存して
ブラウザがリロードされてもstateを保持することができる。

使う時はcreate内のstoreをpersistでラップして、
ストレージに保存するKeyのnameを追加する必要がある。
デフォルトでは保存先がlocalStorageとなっているが、
任意のStorageを指定することも可能。

### カスタムフック（便利な道具）

useAuth - 基本的な認証機能

```typescript
export function useAuth() {
  const { user, isLoading, signInWithGoogle, ... } = useAuthStore();

  // アプリ起動時に自動で認証状態をチェック
  useEffect(() => {
    initialize();
  }, []);

  return { user, isLoading, signInWithGoogle, ... };
}
```

役割：

Zustand Storeから必要な情報だけを取り出す
アプリ起動時に自動で「前回ログインしていたか？」をチェック

### useRequireAuth - 高度な認証機能

```
export function useRequireAuth() {
  const { user, isAuthenticated } = useAuth();
  
  return {
    isGuest: user?.provider === 'guest',  // ゲストユーザーかどうか
    canUseFeature: (feature) => {         // 機能が使えるかチェック
      // ログインユーザーのみ使える機能をチェック
      return user?.provider !== 'guest';
    },
  };
}
```

役割：

ユーザーの種類（ゲスト or 本格ユーザー）を判別
機能制限をかける（例：AI機能はログインユーザーのみ）


### ログインフォーム

```typescript
export default function LoginForm() {
  const { isLoading, error, isAuthenticated, signInWithGoogle } = useAuth();
  const router = useRouter();

  // ログイン済みなら自動でダッシュボードへ
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated]);

  return (
    // 実際のログイン画面のUI
  );
}
```

### 実際の流れ

1. アプリ起動時
```
アプリ起動 
→ useAuth()が自動実行 
→ initialize()がチェック
→ 「前回ログインしてた？」
   ├─ Yes → 自動ログイン
   └─ No → ログイン画面表示
```

2. Googleログイン時

```
ユーザーがボタンクリック
→ signInWithGoogle()実行
→ Googleの認証画面へ
→ 成功時：/auth/callbackに戻る
→ ダッシュボードへリダイレクト
```

3. ゲストログイン時
```
ゲストボタンクリック
→ signInAsGuest()実行
→ 仮のユーザー情報を作成
→ LocalStorageに保存
→ すぐにダッシュボードへ
```

## 参考文献・リンク

https://zustand-demo.pmnd.rs/

https://envader.plus/article/524

https://qiita.com/s_taro/items/0c16f077d843ac1a78fa

---