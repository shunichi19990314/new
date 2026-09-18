import { useState, useEffect } from 'react';
import type { Story } from '../types';
import { formatDate, fetchArticle, type ArticleData } from '../api/rss';

interface NewsDetailProps {
  story: Story;
  onBack: () => void;
}

export default function NewsDetail({ story, onBack }: NewsDetailProps) {
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchArticle(story.url);
        setArticleData(data);
      } catch (err) {
        console.error('Failed to load article:', err);
        setError('記事の読み込みに失敗しました。元サイトで読むことができます。');
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [story.url]);

  let domain = '';
  try {
    domain = new URL(story.url).hostname.replace('www.', '');
  } catch {
    domain = story.source;
  }

  // 表示する画像（優先順位：記事から取得 > サムネイル）
  const displayImage = articleData?.image || story.thumbnail;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-6 transition-colors"
      >
        <span className="text-lg">←</span>
        <span>ニュース一覧に戻る</span>
      </button>

      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {articleData?.title || story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium">
              📰 {domain}
            </span>
            {story.author && (
              <span className="inline-flex items-center gap-1">
                👤 {story.author}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              🕐 {formatDate(story.publishedAt)}
            </span>
          </div>

          {(articleData?.description || story.description) && (
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              {articleData?.description || story.description}
            </p>
          )}
        </div>

        {/* 画像 */}
        {displayImage && (
          <div className="border-b border-gray-100 dark:border-gray-700">
            <img
              src={displayImage}
              alt={story.title}
              className="w-full h-auto max-h-96 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* 記事本文 */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">記事を読み込んでいます...</p>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          )}

          {articleData?.content && (
            <div
              className="article-content text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: articleData.content }}
            />
          )}

          {!loading && !error && !articleData?.content && (
            <div className="text-center py-12">
              <span className="text-4xl">📄</span>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                記事本文を取得できませんでした
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>出典: {story.source}</span>
            </div>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              元サイトで読む ↗
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
