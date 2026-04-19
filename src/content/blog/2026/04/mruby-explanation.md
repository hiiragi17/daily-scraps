---
title: '今日学んだこと：mrubyとは何か'
description: '組み込み向けに軽量化されたRuby「mruby」の仕組みと用途、通常のRubyやmruby/cとの違いをまとめた。'
pubDate: 2026-04-19
tags: ['Ruby', 'mruby', '組み込み', 'IoT', 'nginx', 'バイトコード']
draft: false
customSlug: 'mruby-explanation'
---

mrubyは、**組み込み向けに軽量化されたRuby**だ。通常のRuby（CRuby）はPCやサーバーで動くことを前提に作られているが、mrubyは**メモリや処理能力が限られた環境**でも動くように設計されている。作者はCRubyと同じくまつもとゆきひろ氏だ。

---

## 通常のRubyとの違い

| | CRuby（普通のRuby） | mruby |
|---|---|---|
| 用途 | サーバー・PC | 組み込み・IoTなど |
| メモリ | 比較的多く使う | 非常に少ない |
| 標準ライブラリ | 豊富 | 最小限 |
| gem | 使える | 基本使えない |

コードの書き方はほぼ同じだが、`require` や `gem` が使えない点が大きな制約になる。

---

## どこで使われているのか

- **nginx** … Webサーバーのnginxにmrubyを組み込んで、リクエスト処理をRubyで書けるようにした [ngx_mruby](https://github.com/matsumoto-r/ngx_mruby) というプロジェクトがある
- **IoTデバイス** … マイコンなどリソースが少ない機器のスクリプトとして
- **ゲームエンジン** … ゲームのスクリプト言語として組み込まれるケース
- **Hakobeの設定** … Cookpadが開発したデプロイツールでも採用された

「Rubyで書けること」の価値を、サーバー以外の世界にも広げるための実装だ。

---

## mrubyの基本的な仕組み

```
Rubyコード (.rb)
    ↓
mrbc（コンパイラ）
    ↓
バイトコード (.mrb)
    ↓
mruby VM（仮想マシン）で実行
```

CRubyと違い、事前にバイトコードにコンパイルして実行することが多い。バイトコードにしておくことで、実行環境へのデプロイや起動の効率がよくなる。

---

## コードの書き方はほぼ同じ

```ruby
name = "mruby"
puts "Hello, #{name}!"

[1, 2, 3].each do |n|
  puts n * 2
end
```

書き方はほぼ通常のRubyと変わらない。`require` や `gem` が使えないこと以外は、日常的なRubyの感覚で書ける。

---

## mruby/cというさらに軽量な実装もある

mrubyにはさらに軽量な **mruby/c（mruby slash c）** というものもある。

| | mruby | mruby/c |
|---|---|---|
| RAM使用量 | 数百KB〜 | **数KB〜**（超軽量）|
| 対象 | 組み込み全般 | マイコン（Arduino等）|

mruby/cはArduinoのようなマイコンを対象にしており、消費RAMが桁違いに少ない。IoTの末端デバイスに載せるならmruby/cの方が適している場合が多い。

---

## RubyKaigiでも注目されるトピック

mrubyはRubyKaigiでもよく取り上げられる。YJIT・ZJITなどのパフォーマンス改善とは別のアプローチで、**Rubyが動く場所を広げる**という方向性の実装として、コアコミッターたちが積極的に発表している。

Ruby 4.0の `Ruby::Box` といった"Rubyの多様化"の議論とあわせて、Rubyの可能性がどこまで広がるかを示す象徴的な存在になってきている。

---

## まとめ

mruby ＝ **軽量版Ruby**、組み込み向け

- 書き方はほぼ通常のRubyと同じ（gemは使えない）
- nginx・IoT・ゲームなど幅広い場所で使われている
- バイトコードにコンパイルしてVMで実行するのが基本の流れ
- さらに軽量なmruby/cはマイコン向け

---

## 参考文献・リンク

https://mruby.org/

https://github.com/mruby/mruby

https://github.com/matsumoto-r/ngx_mruby

https://mrubyc.org/

https://github.com/mruby/mruby/blob/master/doc/guides/compile.md

---
