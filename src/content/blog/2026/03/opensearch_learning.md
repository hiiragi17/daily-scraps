---
title: '今日学んだこと：OpenSearch で全文検索入門'
description: '転置インデックスの仕組みから RDB との使い分けまで、OpenSearch の基本をまとめた'
pubDate: 2026-03-06
tags: ['OpenSearch', 'Elasticsearch', '検索', 'AWS']
draft: false
customSlug: 'opensearch_learning'
---

## OpenSearch とは

一言で言うと、**「高速な全文検索エンジン」**。

---

## なぜ普通の DB じゃダメなのか？

RDB でテキスト検索をしようとすると…

```sql
SELECT * FROM articles WHERE content LIKE '%データベース 検索%';
```

これは**全行をスキャン**するので、データが増えると死ぬほど遅くなる。また「データベース」と「検索」が**離れた場所にある文章**はヒットしない。

OpenSearch はこの問題を解決するために存在する。

---

## OpenSearch の仕組み（転置インデックス）

文章を事前に**単語単位で分解・索引化**しておく仕組み。

```
「データベースの検索パフォーマンスを改善する方法」
         ↓ 事前に分解して索引を作る

データベース → [document_1, document_5, document_12]
検索         → [document_1, document_3, document_8]
パフォーマンス → [document_1, document_7]
```

本の**巻末索引**と同じ発想。検索時に全ページをめくるのではなく、索引を引くだけなので爆速になる。

---

## RDB との概念対応

| RDB | OpenSearch | 説明 |
|---|---|---|
| Database | Index | データの入れ物 |
| Table | （Index に統合） | 1 Index = 1 Table 的な感覚 |
| Row | Document | 1 件のデータ（JSON 形式）|
| Column | Field | データの各項目 |
| Schema | Mapping | フィールドの型定義 |

---

## 基本操作のイメージ

### データを入れる（インデキシング）

```json
PUT /articles/_doc/1
{
  "title": "OpenSearch 入門",
  "content": "OpenSearch はオープンソースの全文検索エンジンです",
  "author": "yamada",
  "published_at": "2026-03-06"
}
```

### 検索する

```json
GET /articles/_search
{
  "query": {
    "match": {
      "content": "全文検索 エンジン"
    }
  }
}
```

これだけで**関連度スコア付き**の結果が返ってくる。

---

## OpenSearch の強み

### 1. 全文検索が得意

「全文検索」「全文サーチ」「テキスト検索」をある程度まとめて検索できる（アナライザー設定次第）。

### 2. 関連度スコアリング

ただヒットするだけでなく、**どれだけ関連しているか**をスコアで返してくれる。

### 3. ファセット検索

「カテゴリ別の件数」「日付範囲別の件数」をまとめて集計できる。

```json
// 「全文検索」で検索しつつ、カテゴリごとの件数も同時に返す
{
  "query": { "match": { "content": "全文検索" } },
  "aggs": {
    "by_category": {
      "terms": {
        "field": "category.keyword"
      }
    }
  }
}
```

### 4. 地理情報検索（Geo Search）

「現在地から半径 2km 以内の店舗」のような位置情報検索も得意。

---

## Elasticsearch と OpenSearch の関係

```
Elasticsearch（元祖、Elastic 社が開発）
    ↓ 2021 年にライセンス変更で OSS でなくなった
OpenSearch（AWS がフォークして OSS 継続）
```

API の構造はほぼ同じなので、**Elasticsearch の情報も OpenSearch にほぼ流用できる**。

---

## まとめ

- **何のため？** → RDB では辛い全文検索・高度な検索を高速に行うため
- **データ形式は？** → JSON ドキュメント
- **RDB の代替？** → No。**RDB と併用**するのが基本（メイン DB は RDB、検索用に OpenSearch）
- **Elasticsearch との違いは？** → ほぼ同じ。OpenSearch は AWS が管理する OSS 版

---

## 参考文献・リンク

- [OpenSearch 公式ドキュメント](https://opensearch.org/docs/latest/)
- [Amazon OpenSearch Service Developer Guide](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html)
- [転置インデックス - Wikipedia](https://ja.wikipedia.org/wiki/%E8%BB%A2%E7%BD%AE%E3%82%A4%E3%83%B3%E3%83%87%E3%83%83%E3%82%AF%E3%82%B9)
- [Elasticsearch: The Definitive Guide（無料公開版）](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html)
- [OpenSearch vs Elasticsearch: What's the Difference?](https://aws.amazon.com/what-is/opensearch/)
