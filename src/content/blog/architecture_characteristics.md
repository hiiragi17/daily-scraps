---
title: '今日学んだこと：アーキテクチャ特性に関して'
description: 'アーキテクチャ特性に関して'
pubDate: 2025-09-11
tags: ['アーキテクチャ特性', 'ソフトウェアアーキテクチャの基礎']
draft: false
---

## 概要

今日はアーキテクチャ特性について学んだ。

### ポイント1

アーキテクチャ特性とは、次の3つの基準を満たすもの。

- ドメインに依らない、設計に関する考慮事項を明らかにするもの
- 設計の構造的な側面に影響を与えるもの
- アプリケーションの成功に不可欠か重要なもの

よく非機能要件と呼ばれている。

### ポイント2

- アーキテクチャの運用特性

アーキテクチャの運用特性は、パフォーマンス、スケーラビリティ、弾力性、可用性、信頼性といった能力を対象としている。

- アーキテクチャの構造特性

構成容易性（Configurability）、
拡張性（Extensibility）、
インストール容易性（Installability）、
活用性／再利用性（Leverageability／Reuse）、
ローカライゼーション（Localization）、
メンテナンス容易性（Maintainability）、
可搬性（Portability）、
アップグレード容易性（Upgradeability）

- アーキテクチャの横断的特性

アクセシビリティ（Accessibility）、
長期保存性（Archivability）、
認証（Authentication）、
認可（Authorization）、
合法性（Legal）、
プライバシー（Privacy）、
セキュリティ（Security）、
サポート容易性（Supportability）、
ユーザビリティ／達成容易性（Usability／Achievability）

決して最善のアーキテクチャを狙ってはいけない。
むしろ、少なくとも最悪でないアーキテクチャを狙おう。

---