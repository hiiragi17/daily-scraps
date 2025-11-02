// src/components/PostCalendarReact.jsx
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const PostCalendarReact = ({ posts = [] }) => {
  const [date, setDate] = useState(new Date());
  const [selectedPosts, setSelectedPosts] = useState(null);
  const [postsData, setPostsData] = useState({});

  // 投稿データを日付別に整理
  useEffect(() => {
    const postsByDate = {};
    
    posts.forEach(post => {
      const pubDate = post.data?.pubDate;
      if (!pubDate) return;
      
      const dateObj = new Date(pubDate);
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      
      if (!postsByDate[dateStr]) {
        postsByDate[dateStr] = [];
      }
      
      postsByDate[dateStr].push({
        title: post.data?.title || 'タイトルなし',
        slug: post.id?.replace(/\.(md|mdx)$/, '') || '',
        description: post.data?.description || ''
      });
    });
    
    setPostsData(postsByDate);
  }, [posts]);

  // 日付をフォーマット
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // タイルのクラス名を設定
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDate(date);
      const hasPost = postsData[dateStr] && postsData[dateStr].length > 0;
      const isToday = formatDate(new Date()) === dateStr;
      
      const classes = [];
      if (hasPost) classes.push('has-post');
      if (isToday) classes.push('is-today');
      if (hasPost && isToday) classes.push('today-with-post');
      
      return classes.join(' ');
    }
    return '';
  };

  // タイルのコンテンツを設定
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDate(date);
      const posts = postsData[dateStr];
      
      if (posts && posts.length > 0) {
        return (
          <div className="post-indicator">
            {posts.length > 1 && (
              <span className="post-count">{posts.length}</span>
            )}
          </div>
        );
      }
    }
    return null;
  };

  // 日付クリック時の処理
  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    const posts = postsData[dateStr];
    
    if (posts && posts.length > 0) {
      setSelectedPosts({
        date: date,
        posts: posts
      });
    } else {
      setSelectedPosts(null);
    }
  };

  return (
    <div className="calendar-wrapper">
      <style>{`
        .calendar-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .icon-wrapper {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          padding: 0.75rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-wrapper svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .header-text h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .header-text p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .calendar-container {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        /* React Calendar カスタムスタイル */
        .react-calendar {
          width: 100%;
          border: none;
          background: transparent;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .react-calendar__navigation {
          display: flex;
          margin-bottom: 1rem;
          gap: 0.5rem;
        }

        .react-calendar__navigation button {
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          transition: all 0.2s;
        }

        .react-calendar__navigation button:hover:enabled {
          background: #e5e7eb;
        }

        .react-calendar__navigation button[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
          text-align: center;
        }

        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }

        /* 日曜日を赤色、土曜日を青色に */
        .react-calendar__month-view__weekdays__weekday:first-child {
          color: #ef4444;
        }

        .react-calendar__month-view__weekdays__weekday:last-child {
          color: #3b82f6;
        }

        .react-calendar__tile {
          position: relative;
          padding: 0.75rem;
          background: white;
          border: 2px solid transparent;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.2s;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .react-calendar__tile:hover {
          background: #f9fafb;
          transform: scale(1.05);
        }

        .react-calendar__tile:disabled {
          opacity: 0.5;
        }

        .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white !important;
        }

        .react-calendar__tile--active:hover {
          background: #2563eb !important;
        }

        /* 今日の日付 */
        .react-calendar__tile--now,
        .react-calendar__tile.is-today {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
          font-weight: 700;
          color: #1e40af !important;
        }

        /* 投稿がある日 */
        .react-calendar__tile.has-post {
          border-color: rgb(7, 56, 40) !important;
          background: #f0fdf4 !important;
          font-weight: 600;
          color: #166534 !important;  /* より濃い緑 */
          cursor: pointer;
        }

        .react-calendar__tile.has-post:hover {
          background: #dcfce7 !important;
          border-color: #059669 !important;
          color: #166534 !important;  /* ホバー時も濃い緑 */
        }

        /* 今日かつ投稿がある日 */
        .react-calendar__tile.today-with-post {
          background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%) !important;
          position: relative;
          overflow: visible;
        }

        .react-calendar__tile.today-with-post::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 8px;
          padding: 2px;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 1;
        }

        /* 隣接月の日付 */
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #d1d5db !important;
          opacity: 0.5;
        }

        /* 投稿数インジケーター */
        .post-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
        }

        .post-count {
          background: #10b981;
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.125rem 0.25rem;
          border-radius: 9999px;
          min-width: 1rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .react-calendar__tile.is-today .post-count {
          background: white;
          color: #3b82f6;
        }

        /* 投稿リストセクション */
        .posts-section {
          margin-top: 2rem;
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .posts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f3f4f6;
        }

        .posts-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .close-button {
          background: #f3f4f6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-size: 1.25rem;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .post-item {
          background: linear-gradient(to right, #f9fafb, white);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s;
        }

        .post-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #93c5fd;
        }

        .post-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .post-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .post-item:hover .post-title {
          color: #3b82f6;
        }

        .post-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        /* 戻るリンク */
        .back-link {
          text-align: center;
          margin-top: 2rem;
        }

        .back-link a {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .back-link a:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* レスポンシブ対応 */
        @media (max-width: 640px) {
          .calendar-wrapper {
            padding: 1rem;
          }

          .header-section,
          .calendar-container,
          .posts-section {
            padding: 1rem;
          }

          .react-calendar__tile {
            font-size: 0.75rem;
            padding: 0.5rem;
          }

          .react-calendar__navigation button {
            font-size: 0.875rem;
            padding: 0.5rem;
          }

          .header-text h1 {
            font-size: 1.25rem;
          }

          .header-text p {
            font-size: 0.75rem;
          }

          .post-count {
            font-size: 0.5rem;
            padding: 0.125rem 0.125rem;
          }
        }
      `}</style>

      <div className="header-section">
        <div className="header-content">
          <div className="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="6" width="18" height="15" rx="2"/>
              <path d="M3 10h18M8 3v6M16 3v6"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>投稿カレンダー</h1>
            <p>投稿した日が緑色で表示されます。クリックすると記事を確認できます。</p>
          </div>
        </div>
      </div>

      <div className="calendar-container">
        <Calendar
          onChange={setDate}
          value={date}
          onClickDay={handleDateClick}
          tileClassName={tileClassName}
          tileContent={tileContent}
          locale="ja-JP"
          formatDay={(locale, date) => date.getDate()}
        />
      </div>

      {selectedPosts && (
        <div className="posts-section">
          <div className="posts-header">
            <h3 className="posts-title">
              {selectedPosts.date.getFullYear()}年
              {selectedPosts.date.getMonth() + 1}月
              {selectedPosts.date.getDate()}日の記事
            </h3>
            <button 
              className="close-button"
              onClick={() => setSelectedPosts(null)}
            >
              ×
            </button>
          </div>
          <div className="posts-list">
            {selectedPosts.posts.map((post, index) => (
              <div key={index} className="post-item">
                <a 
                  href={`/daily-scraps/blog/${post.slug}`} 
                  className="post-link"
                >
                  <h4 className="post-title">{post.title}</h4>
                  <p className="post-description">{post.description}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCalendarReact;