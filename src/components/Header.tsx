import { CATEGORIES, type Category } from '../types';

interface HeaderProps {
  category: Category;
  onCategoryChange: (cat: Category) => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  sortBy?: 'date' | 'relevance';
  onSortChange?: (sort: 'date' | 'relevance') => void;
  filterSource?: string;
  onFilterChange?: (source: string) => void;
  availableSources?: string[];
}

export default function Header({ 
  category, 
  onCategoryChange, 
  searchQuery = '', 
  onSearch,
  sortBy = 'date',
  onSortChange,
  filterSource = 'all',
  onFilterChange,
  availableSources = []
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📰</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Latest News
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                日本語ニュースアグリゲーター
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>
        </div>
        {/* 検索バー */}
        {onSearch && (
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="ニュースを検索..."
                className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => onSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="検索をクリア"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* ソートとフィルタ */}
            {(onSortChange || onFilterChange) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {/* ソート */}
                {onSortChange && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">並び替え:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => onSortChange(e.target.value as 'date' | 'relevance')}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="date">日付順</option>
                      <option value="relevance">関連度順</option>
                    </select>
                  </div>
                )}
                
                {/* ソースフィルタ */}
                {onFilterChange && availableSources.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">ソース:</span>
                    <select
                      value={filterSource}
                      onChange={(e) => onFilterChange(e.target.value)}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 max-w-[200px]"
                    >
                      <option value="all">すべて</option>
                      {availableSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
