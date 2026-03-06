---
title: 'OpenSearch とは何か：全文検索エンジンの仕組みを理解する'
description: 'RDBでの全文検索の限界から始まり、OpenSearchの転置インデックスの仕組み・基本操作・強みをまとめた入門記事'
pubDate: 2026-03-06
tags: ['OpenSearch', 'Elasticsearch', '検索', 'インフラ']
draft: false
customSlug: 'opensearch-fulltext-search'
---

## OpenSearch とは

一言で言うと、**「高速な全文検索エンジン」** 。

---

## まず「なぜ普通のDBじゃダメなのか？」から

RDBでテキスト検索をしようとすると…

```sql
SELECT * FROM articles WHERE body LIKE '%パフォーマンス チューニング%';
```

これは **全行をスキャン**するので、データが増えると死ぬほど遅くなる。また「パフォーマンス」と「チューニング」が**離れた場所にある文章**はヒットしない。

OpenSearch はこの問題を解決するために存在する。

---

## OpenSearch の仕組み（転置インデックス）

文章を事前に**単語単位で分解・索引化**しておく仕組み。

```
「Pythonのパフォーマンスをチューニングする方法」
         ↓ 事前に分解して索引を作る

Python        → [document_1, document_3, document_7]
パフォーマンス → [document_1, document_5]
チューニング   → [document_1, document_2]
方法           → [document_1, document_4, document_9]
```

本の**巻末索引**と同じ発想。検索時に全ページをめくるのではなく、索引を引くだけなので爆速になる。

---

## RDBとの概念対応

| RDB | OpenSearch | 説明 |
|---|---|---|
| Database | Index | データの入れ物 |
| Table | （Indexに統合） | 1 Index = 1 Table的な感覚 |
| Row | Document | 1件のデータ（JSON形式）|
| Column | Field | データの各項目 |
| Schema | Mapping | フィールドの型定義 |

---

## 基本操作のイメージ

### データを入れる（インデキシング）

```json
PUT /articles/_doc/1
{
  "title": "Pythonのパフォーマンスをチューニングする方法",
  "body": "プロファイリングツールを使ってボトルネックを特定し、アルゴリズムを改善する",
  "tags": ["Python", "パフォーマンス"],
  "published_at": "2026-03-01"
}
```

### 検索する

```json
GET /articles/_search
{
  "query": {
    "match": {
      "body": "パフォーマンス チューニング"
    }
  }
}
```

これだけで**関連度スコア付き**の結果が返ってくる。

---

## OpenSearch の強み

### 1. 全文検索が得意
「パフォーマンス」「速度改善」「高速化」をある程度まとめて検索できる（アナライザー設定次第）

### 2. 関連度スコアリング
ただヒットするだけでなく、**どれだけ関連しているか**をスコアで返してくれる

### 3. ファセット検索
「タグ別の記事件数」「月別の投稿数」をまとめて集計できる

```json
// 「チューニング」で検索しつつ、タグごとの件数も同時に返す
{
  "query": { "match": { "body": "チューニング" } },
  "aggs": {
    "by_tag": {
      "terms": {
        "field": "tags.keyword"
      }
    }
  }
}
```

### 4. 地理情報検索（Geo Search）
「現在地から半径2km以内のイベント」のような位置情報検索も得意

---

## ElasticsearchとOpenSearchの関係

```
Elasticsearch（元祖、Elastic社が開発）
    ↓ 2021年にライセンス変更でOSSでなくなった
OpenSearch（AWSがフォークしてOSS継続）
```

APIの構造はほぼ同じなので、**Elasticsearchの情報もOpenSearchにほぼ流用できます**。

---

## まとめ

- **何のため？** → RDBでは辛い全文検索・高度な検索を高速に行うため
- **データ形式は？** → JSONドキュメント
- **RDBの代替？** → No。**RDBと併用**するのが基本（メインDBはRDB、検索用にOpenSearch）
- **ElasticSearchとの違いは？** → ほぼ同じ。OpenSearchはAWSが管理するOSS版

## 参考文献

- [OpenSearch 公式ドキュメント](https://opensearch.org/docs/latest/)
- [Amazon OpenSearch Service とは - AWS 公式](https://docs.aws.amazon.com/ja_jp/opensearch-service/latest/developerguide/what-is.html)
- [転置インデックス - Wikipedia](https://ja.wikipedia.org/wiki/%E8%BB%A2%E7%BD%AE%E3%82%A4%E3%83%B3%E3%83%87%E3%83%83%E3%82%AF%E3%82%B9)
- [Elasticsearch: The Definitive Guide（O'Reilly）](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html) - OpenSearch にも概念がほぼ共通
- [なぜ全文検索エンジンが必要か - Elastic 公式ブログ](https://www.elastic.co/jp/blog/found-elasticsearch-from-the-bottom-up)
