import type { Story } from '../types';
import { formatTimeAgo, getStoryUrl, getCommentsUrl } from '../api/hackernews';

interface NewsDetailProps {
  story: Story;
  onBack: () => void;
}

export default function NewsDetail({ story, onBack }: NewsDetailProps) {
  const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : null;

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
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium">
              ⬆️ {story.score} ポイント
            </span>
            <span className="inline-flex items-center gap-1">
              👤 {story.by}
            </span>
            <span className="inline-flex items-center gap-1">
              🕐 {formatTimeAgo(story.time)}
            </span>
            {story.descendants !== undefined && (
              <span className="inline-flex items-center gap-1">
                💬 {story.descendants} コメント
              </span>
            )}
            {domain && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                🌐 {domain}
              </span>
            )}
          </div>

          {story.text && (
            <div
              className="mt-6 prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: story.text }}
            />
          )}

          <div className="flex flex-wrap gap-3 mt-8">
            {story.url && (
              <a
                href={getStoryUrl(story)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                📖 記事を読む
                <span className="text-sm">↗</span>
              </a>
            )}
            <a
              href={getCommentsUrl(story)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              💬 コメントを見る
              <span className="text-sm">↗</span>
            </a>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>📋</span>
            <span>ID: {story.id}</span>
            <span>•</span>
            <span>Type: {story.type}</span>
          </div>
        </div>
      </article>
    </main>
  );
}
