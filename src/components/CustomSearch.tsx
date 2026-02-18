import { useState, useEffect, useCallback } from 'react';

interface Article {
  title: string;
  description: string;
  tags: string[];
  pubDate: string;
  slug: string;
}

interface Props {
  baseUrl: string;
}

export default function CustomSearch({ baseUrl }: Props) {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [results, setResults] = useState<Article[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch(`${baseUrl}/search-index.json`)
      .then(res => res.json())
      .then((data: Article[]) => setArticles(data))
      .catch(err => console.error('検索インデックスの読み込みに失敗しました:', err));
  }, [baseUrl]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(lower) ||
      article.description.toLowerCase().includes(lower) ||
      article.tags.some(tag => tag.toLowerCase().includes(lower))
    );
    setResults(filtered);
    setSearched(true);
  }, [articles]);

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return <>{text}</>;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase()
            ? <mark key={i} style={{ backgroundColor: 'rgba(35, 55, 255, 0.15)', color: '#000d8a', padding: '0 0.2em', borderRadius: '2px' }}>{part}</mark>
            : part
        )}
      </>
    );
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="記事を検索..."
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            background: 'white',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = '#2337ff')}
          onBlur={e => (e.target.style.borderColor = '#e0e0e0')}
        />
        {query && (
          <button
            onClick={() => handleSearch('')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            クリア
          </button>
        )}
      </div>

      {searched && (
        <p style={{ padding: '1rem', textAlign: 'center', color: '#888', margin: '0.5rem 0' }}>
          {results.length > 0
            ? `${results.length}件の検索結果が見つかりました: ${query}`
            : `検索結果が見つかりませんでした: ${query}`}
        </p>
      )}

      <div style={{ marginTop: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
        {results.map(article => (
          <a
            key={article.slug}
            href={`${baseUrl}/blog/${article.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div
              style={{
                padding: '1rem',
                marginBottom: '0.5rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                background: 'white',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = '#2337ff';
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = '#e0e0e0';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2337ff', marginBottom: '0.4rem' }}>
                {highlight(article.title, query)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.5', marginBottom: '0.4rem' }}>
                {highlight(article.description, query)}
              </div>
              {article.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.1rem 0.5rem',
                        background: 'rgba(35, 55, 255, 0.08)',
                        color: '#2337ff',
                        borderRadius: '4px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                {new Date(article.pubDate).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
