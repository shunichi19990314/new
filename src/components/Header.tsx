import { CATEGORIES, type Category } from '../types';

interface HeaderProps {
  category: Category;
  onCategoryChange: (cat: Category) => void;
}

export default function Header({ category, onCategoryChange }: HeaderProps) {
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
