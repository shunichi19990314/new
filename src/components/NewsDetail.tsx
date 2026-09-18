import { useState } from 'react';
import type { Story } from '../types';
import { formatDate } from '../api/rss';

interface NewsDetailProps {
  story: Story;
  onBack: () => void;
}

type ViewMode = 'summary' | 'iframe' | 'external';

export default function NewsDetail({ story, onBack }: NewsDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [iframeError, setIframeError] = useState(false);

  let domain = '';
  try {
    domain = new URL(story.url).hostname.replace('www.', '');
  } catch {
    domain = story.source;
  }

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
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {story.title}
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

          {/* View Mode Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200 dark:border-gray-600">
            <button
              onClick={() => { setViewMode('summary'); setIframeError(false); }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'summary'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📝 要約
            </button>
            <button
              onClick={() => { setViewMode('iframe'); setIframeError(false); }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'iframe'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              🌐 サイト内閲覧
            </button>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              ↗ 元サイトで読む
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Thumbnail */}
          {story.thumbnail && viewMode === 'summary' && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={story.thumbnail}
                alt=""
                className="w-full h-auto max-h-80 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Summary View */}
          {viewMode === 'summary' && (
            <div className="prose dark:prose-invert max-w-none">
              {story.content ? (
                <div
                  className="text-gray-700 dark:text-gray-300 leading-relaxed article-content"
                  dangerouslySetInnerHTML={{ __html: story.content }}
                />
              ) : (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {story.description}
                  </p>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      💡 記事の全文を読むには、上部の「🌐 サイト内閲覧」または「↗ 元サイトで読む」をクリックしてください。
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Iframe View */}
          {viewMode === 'iframe' && (
            <div>
              {!iframeError ? (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <iframe
                    src={story.url}
                    className="w-full h-[70vh] border-0"
                    title={story.title}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    onError={() => setIframeError(true)}
                  />
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <span className="text-4xl">🚫</span>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    このサイトはサイト内での表示に対応していません
                  </p>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    元サイトで読む ↗
                  </a>
                </div>
              )}
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                ※ 一部のサイトはセキュリティ設定によりサイト内表示ができない場合があります
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
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
              元サイトで全文を読む ↗
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
