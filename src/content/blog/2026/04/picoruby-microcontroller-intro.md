---
title: '今日学んだこと：PicoRubyとは何か'
description: 'マイコン上でRubyを動かす超軽量実装「PicoRuby」の仕組みと、CRuby・mrubyとの違い、できることを整理した。'
pubDate: 2026-04-14
tags: ['Ruby', 'PicoRuby', 'mruby', 'マイコン', 'IoT', '電子工作']
draft: false
customSlug: 'picoruby-microcontroller-intro'
---

PicoRubyは、**マイコン（小さなコンピュータチップ）の上でRubyを動かすための超軽量なRuby実装**だ。

---

## まず「マイコン」を理解しよう

普通のRuby（CRuby）はPCやサーバ向けに作られており、メモリも潤沢にある。

一方**マイコン**とは、LEDやモーター・センサーなどを制御するための小さなチップだ。

```
スマホ・PC：RAM 数GB〜
マイコン  ：RAM 数百KB（1000分の1以下！）
```

この極端にリソースが少ない環境でもRubyを動かせるようにしたのがPicoRubyだ。

---

## 何ができるの？

PicoRubyはワンチップマイコンで動作し、ファイルをドラッグ＆ドロップするだけで実行できる。

**Lチカ（LEDを点滅させる）**

```ruby
pin = GPIO.new(29, GPIO::OUT)
loop do
  pin.write(1)  # 点灯
  sleep 0.5
  pin.write(0)  # 消灯
  sleep 0.5
end
```

コミュニティではこんな作品も生まれている。

- Kaigi on Rails 2025でのクイズ早押しボタン
- WiFiを使ったスマートロック・洗濯機稼働チェッカー・トイレットペーパー購入ボタンなどのシェアハウスIoTデバイス
- カニロボコンへの出場、自作キーボードのファームウェアなど

---

## CRuby・mruby・PicoRubyの関係

```
CRuby（普通のRuby）
  └ PC・サーバ向け。Railsもこれ

mruby
  └ 組み込み向けに軽量化したRuby

mruby/c
  └ mrubyをさらに軽量化

PicoRuby
  └ mruby/c VM + 独自コンパイラを組み合わせた超軽量実装
    マイコン上で動くシェル「R2P2」などを提供
```

PicoRubyは単なるmrubyの派生ではなく、独自のコンパイラを持つ点が特徴的だ。

---

## 対応マイコンと広がり

最初はRaspberry Pi Pico（RP2040チップ）がメインターゲットだったが、ESP32（Wi-FiとBluetoothを内蔵した人気のIoTチップ）への移植なども進んでいる。

---

## Rubyコミュニティとの関係

RubyKaigiでも毎年登壇があり、Matz（Rubyの作者）もPicoRubyという名前を気に入っているとのこと。REPLやputsなどRubyらしいインタラクティブな体験がそのまま使えるのが大きな魅力で、「C言語は難しそう」と敬遠していたWeb系エンジニアが電子工作に入門するきっかけになっている。

---

## まとめ

```
PicoRuby ＝ マイコンで動く超軽量Ruby
・LEDやモーター・センサーをRubyで制御できる
・ドラッグ＆ドロップで動くので環境構築が簡単
・Web系RubyエンジニアがIoT・電子工作に入門する入口として注目
```

---
