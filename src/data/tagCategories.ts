/**
 * タグのカテゴリ定義
 * ここに定義されていないタグは「その他」カテゴリに分類されます。
 */
const CATEGORIES: Record<string, string[]> = {
  '基本情報技術者試験': [
    '基本情報', 'システム戦略', 'システム開発技術', '企業活動', 'ソフトウェア',
    'システム企画', 'サービスマネジメント', 'セキュリティ', 'システム監査',
    '経営戦略マネジメント', '技術戦略マネジメント', '基礎理論',
    'プロジェクトマネジメント', 'ハードウェア', 'ネットワーク', 'データベース',
    'コンピュータ構成要素', 'アルゴリズム', '法務', 'ビジネスインダストリ',
    'ヒューマンインターフェース', 'ソフトウェア開発管理技術', 'システム構成要素',
    '情報セキュリティの3要素', 'マルチメディア', 'マンチェスター符号',
    'ビッグバンテスト', 'データウェアハウス', 'OLTP', 'OLAP',
    '挿入ソート', 'シェルソート', 'リピータ・ハブ', 'スイッチング・ハブ',
    'フォワード・プロキシ', 'リバース・プロキシ', 'プロキシ・サーバー',
    'シーケンス番号', 'ACK番号', 'MD5', 'パスワード管理',
  ],
  'プログラミング': [
    'Ruby', 'Rails', 'JavaScript', 'TypeScript', 'React Native',
    'Zustand', 'Zod', 'Recoil', 'Stimulus', 'Astro', 'Pundit', 'Concern',
    'gem', 'annotate', 'annotaterb', 'Shoryuken',
    'ぼっち演算子', '破壊的メソッド', '文字列操作', 'フロントエンド',
    'map', 'map + compact', 'filter_map', 'gsub', 'append', 'append,add',
    'chr', 'ord', 'max', 'nil', 'div', 'span', 'persist',
    'Cookie', 'SessionStorage', 'LocalStorage', 'iframe',
    'ブラウザAPI', 'フォームデータ', 'Web API:the Good Parts',
  ],
  'インフラ・クラウド': [
    'AWS', 'SQS', 'SES', 'ECS', 'Docker', 'Kubernetes', 'Finch',
    'containerd', 'nginx', 'Cloudflare', 'Upstash', 'Sentry', 'Datadog',
    'SSH', 'コンテナ', '監視', 'APM', '本番環境', 'インフラ',
    'グレースフルシャットダウン', 'バックアップ', 'デッドレタートピック',
    'パフォーマンス', 'メール', 'Socket',
    'Android', 'Webview', 'WebView', 'ProvisioningProfile',
  ],
  'データベース': [
    'MySQL', 'Database', 'Supabase', 'レプリケーション', 'binlog',
    'ストアドプロシージャ', '再帰SQL', 'Row Level Security', 'RLSポリシー',
    'SQLアンチパターン', 'Google認証', 'Snowflake', 'OpenSearch',
    'Elasticsearch', '検索',
  ],
  '書籍': [
    'ソフトウェアアーキテクチャの基礎', 'ネットワークはなぜつながるのか',
    'Tidy First?',
  ],
  'アーキテクチャ': [
    'アーキテクチャ', 'アーキテクト', 'アーキテクチャ特性',
    'アーキテクチャ・カタ', 'コナーセンス', '凝集度',
    'サーバントリーダーシップ',
  ],
};

// タグ → カテゴリの逆引きマップを構築
const tagToCategory = new Map<string, string>();
for (const [category, tags] of Object.entries(CATEGORIES)) {
  for (const tag of tags) {
    tagToCategory.set(tag, category);
  }
}

export function getCategory(tag: string): string {
  return tagToCategory.get(tag) ?? 'その他';
}

export const CATEGORY_ORDER = [
  ...Object.keys(CATEGORIES),
  'その他',
];
