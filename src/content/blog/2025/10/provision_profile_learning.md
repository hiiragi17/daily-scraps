
---
title: '今日学んだこと：ProvisioningProfileに関して'
description: 'ProvisioningProfileに関して'
pubDate: 2025-10-31
tags: ['ProvisioningProfile']
draft: false
slug: 'provision_profile_learning'
---

## 概要

ProvisioningProfileについて学んだ。

### ProvisioningProfileとは

ProvisioningProfile(略称Profile)とは、iOSアプリのコード署名に必要とされるファイル。

Profileはアプリのビルド時に使用される。
一般にProfileはXcodeにインポートされて使われる。
Profileには以下の情報が格納されており、
これらがXcodeを介してアプリバイナリに格納される。

アプリ発行元の証明書(公開鍵) (=Certificate)
アプリID (=Identifier)
開発実機端末のUUID (=Device) ※開発用Profileのみ

### 参考文献

https://developer.apple.com/jp/help/account/provisioning-profiles/create-a-development-provisioning-profile/

https://qiita.com/rodentia6/items/a19b1aea47798d753e9d

---


