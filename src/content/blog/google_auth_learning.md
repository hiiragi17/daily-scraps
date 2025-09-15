---
title: '今日学んだこと：Google認証システムの実装に関して'
description: 'Google認証システムの実装に関して'
pubDate: 2025-09-15
tags: ['Google認証', 'Supabase']
draft: false
---

## 概要

今日はGoogle認証システムの実装について学んだ。

### 全体の流れ

```
1. ユーザーがログインボタンをクリック
2. Googleの認証画面に移動
3. Googleで認証完了後、アプリに戻る
4. セッション情報を保存
5. ダッシュボードページを表示
```

### ログインボタンがクリックされた時

```
// AuthStore内のsignInWithGoogle関数
signInWithGoogle: async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        response_type: 'code',
        flow_type: 'pkce',
      },
    },
  });
}
```

何が起こるか:

Supabaseライブラリが、GoogleのOAuth認証URLを作成
ブラウザが自動的にGoogleの認証画面にリダイレクト
redirectToで、認証後に戻ってくるURL（/auth/callback）を指定

### Googleでの認証処理

ユーザーがGoogleアカウントでログインすると、Googleは以下のような情報を返す。

ユーザー情報:

- ID: "⚪︎⚪︎"
- Email: "⚪︎⚪︎@gmail.com"
- Name: "Test User"
- Avatar: プロフィール画像のURL

### 認証後のコールバック処理

Googleから戻ってきたとき、/auth/callbackページで処理される。

```
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const code = searchParams.get('code'); // Googleからの認証コード
  
  if (code) {
    // Authorization Code Flow（推奨される方法）
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    // 認証コードをセッション情報に変換
  } else {
    // Implicit Flow（代替方法）
    // クライアントサイドで処理
  }
}
```

重要なポイント:

認証コード: Googleから受け取る一時的なコード
セッション: 実際にアプリで使用する永続的な認証情報

###  セッション情報の保存
認証が成功すると、セッション情報がブラウザのクッキーに保存される。

```
// app/api/auth/session/route.ts
const { data, error } = await supabase.auth.setSession({
  access_token: accessToken,    // アクセストークン
  refresh_token: refreshToken,  // リフレッシュトークン
});
```

保存される情報:

アクセストークン: APIにアクセスするための認証情報
リフレッシュトークン: アクセストークンを更新するための情報
有効期限: 通常1時間程度

### ユーザープロフィールの作成
初回ログイン時は、データベースにユーザー情報を保存する。

```
await supabase.from('profiles').insert({
  id: session.user.id,
  email: session.user.email,
  name: session.user.user_metadata?.full_name || 'ユーザー',
  provider: 'google',
  avatar_url: session.user.user_metadata?.avatar_url,
});
```

### 認証状態の管理

アプリ全体で認証状態を管理するため、Zustandストアを使用。

```
// AuthStore
const useAuthStore = create((set) => ({
  user: null,           // 現在のユーザー情報
  isAuthenticated: false, // ログイン状態
  isLoading: false,     // 読み込み状態
  
  // 初期化時にセッション確認
  initialize: async () => {
    // サーバーAPIでセッション確認
    const response = await fetch('/api/auth/verify');
    const serverSession = await response.json();
    
    if (serverSession.authenticated) {
      // 認証済みならユーザー情報を設定
      set({ user: userData, isAuthenticated: true });
    }
  }
}));
```

### ページでの認証確認
各ページで認証状態をチェックする。

```
// ダッシュボードページ
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  
  // 認証されていない場合はログインページにリダイレクト
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading]);
  
  if (!user) return <div>読み込み中...</div>;
  
  return <div>ようこそ、{user.name}さん</div>;
}
```



### データの流れ

```
ブラウザ → Google → Supabase → アプリ → データベース
```
---
