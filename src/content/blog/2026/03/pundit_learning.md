---
title: '今日学んだこと：Punditに関して'
description: 'Ruby on RailsでよくつかわれるPunditについて'
pubDate: 2026-03-02
tags: ['Ruby', 'Rails', 'Pundit', '認可']
draft: false
customSlug: 'pundit_learning'
---

## 概要

今日はRuby on Railsでよく使われる認可（Authorization）ライブラリ「Pundit」について学んだ。

- **認証（Authentication）** → 「誰がログインしているか」（Deviseなど）
- **認可（Authorization）** → 「誰が何をできるか」← Punditはこっち

## 特徴

- シンプルで軽量
- **Policy クラス** という純粋な Ruby オブジェクトで権限を管理
- テストが書きやすい
- Rails の規約に沿った設計

## 基本的な仕組み

### 1. インストール

```ruby
# Gemfile
gem 'pundit'
```

```bash
bundle install
rails g pundit:install
```

### 2. ApplicationController に include

```ruby
class ApplicationController < ActionController::Base
  include Pundit::Authorization
end
```

### 3. Policy クラスを作成

`app/policies/post_policy.rb`

```ruby
class PostPolicy < ApplicationPolicy
  # 誰でも閲覧OK
  def show?
    true
  end

  # 自分の投稿だけ編集OK
  def update?
    user == record.user
  end

  # 管理者だけ削除OK
  def destroy?
    user.admin?
  end
end
```

- `user` → 現在ログイン中のユーザー
- `record` → 対象のモデルインスタンス（今回は `Post`）

### 4. Controller で authorize を呼ぶ

```ruby
class PostsController < ApplicationController
  def update
    @post = Post.find(params[:id])
    authorize @post  # PostPolicy#update? が呼ばれる
    # ...
  end
end
```

権限がない場合は `Pundit::NotAuthorizedError` が発生する。

## Scope（一覧の絞り込み）

```ruby
class PostPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.admin?
        scope.all
      else
        scope.where(published: true)
      end
    end
  end
end
```

```ruby
# Controller
def index
  @posts = policy_scope(Post)
end
```

## よく使うメソッド

| メソッド | 説明 |
|---|---|
| `authorize @record` | Policy のアクションメソッドで認可チェック |
| `policy_scope(Model)` | Scope で絞り込んだコレクション取得 |
| `policy(@record)` | Policy インスタンスを取得 |
| `pundit_user` | 現在のユーザーを返す（デフォルトは `current_user`） |

## View での使い方

```erb
<% if policy(@post).update? %>
  <%= link_to "編集", edit_post_path(@post) %>
<% end %>
```
