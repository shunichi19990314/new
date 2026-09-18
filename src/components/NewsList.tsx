import type { Story } from '../types';
import { formatDate } from '../api/rss';

interface NewsListProps {
  stories: Story[];
  loading: boolean;
  onSelect: (story: Story) => void;
}

export default function NewsList({ stories, loading, onSelect }: NewsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl">📭</span>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          ニュースが見つかりませんでした
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stories.map((story, index) => (
        <NewsCard
          key={story.id}
          story={story}
          index={index + 1}
          onClick={() => onSelect(story)}
        />
      ))}
    </div>
  );
}

interface NewsCardProps {
  story: Story;
  index: number;
  onClick: () => void;
}

function NewsCard({ story, index, onClick }: NewsCardProps) {
  let domain = '';
  try {
    if (story.url) {
      domain = new URL(story.url).hostname.replace('www.', '');
    } else {
      domain = story.source;
    }
  } catch {
    domain = story.source;
  }

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {story.thumbnail && (
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={story.thumbnail}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900 dark:text-white font-medium leading-snug line-clamp-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {story.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {story.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
              📰 {domain}
            </span>
            {story.author && (
              <span className="flex items-center gap-1">
                👤 {story.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              🕐 {formatDate(story.publishedAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
