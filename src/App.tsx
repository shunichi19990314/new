import { useState, useEffect, useCallback } from 'react';
import NewsList from './components/NewsList';
import NewsDetail from './components/NewsDetail';
import Header from './components/Header';
import { fetchStories } from './api/rss';
import type { Story, Category } from './types';

function App() {
  const [stories, setStories] = useState<Story[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [category, setCategory] = useState<Category>('top');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 15;

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    const log = `[${timestamp}] ${message}`;
    console.log(log);
    setDebugInfo(prev => [...prev.slice(-9), log]); // 最新10件のみ保持
  };

  const loadStories = useCallback(async (cat: Category) => {
    setLoading(true);
    setError(null);
    setDebugInfo([]);
    
    try {
      addDebugLog(`${cat}カテゴリのニュースを取得中...`);
      
      const fetchedStories = await fetchStories(cat);
      
      addDebugLog(`${fetchedStories.length}件のニュースを取得しました`);
      
      if (fetchedStories.length === 0) {
        setError('ニュースを取得できませんでした。CORSプロキシが一時的に利用できない可能性があります。しばらく待ってから再読み込みしてください。');
        addDebugLog('警告: ニュースが0件です');
      } else {
        setAllStories(fetchedStories);
        setStories(fetchedStories.slice(0, ITEMS_PER_PAGE));
        setPage(0);
        addDebugLog(`最初の${Math.min(ITEMS_PER_PAGE, fetchedStories.length)}件を表示中`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      setError(`ニュースの取得に失敗しました: ${errorMessage}`);
      addDebugLog(`エラー: ${errorMessage}`);
      console.error('Failed to fetch stories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories(category);
  }, [category, loadStories]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setSelectedStory(null);
  };

  const handleNextPage = () => {
    const newPage = page + 1;
    const start = newPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setStories(allStories.slice(start, end));
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (page > 0) {
      const newPage = page - 1;
      const start = newPage * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setStories(allStories.slice(start, end));
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(allStories.length / ITEMS_PER_PAGE);

  if (selectedStory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header category={category} onCategoryChange={handleCategoryChange} />
        <NewsDetail story={selectedStory} onBack={() => setSelectedStory(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header category={category} onCategoryChange={handleCategoryChange} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  {error}
                </p>
                <button
                  onClick={() => loadStories(category)}
                  className="text-sm text-yellow-700 dark:text-yellow-300 underline hover:no-underline font-medium"
                >
                  🔄 再読み込み
                </button>
              </div>
            </div>
          </div>
        )}
        
        <NewsList
          stories={stories}
          loading={loading}
          onSelect={setSelectedStory}
        />
        
        {!loading && allStories.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-8 mb-6">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← 前へ
            </button>
            <span className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm">
              {page + 1} / {totalPages} ページ
            </span>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              次へ →
            </button>
          </div>
        )}

        {/* デバッグ情報（開発時のみ表示） */}
        {debugInfo.length > 0 && (
          <details className="mt-8 text-xs">
            <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              🔍 デバッグ情報
            </summary>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-gray-600 dark:text-gray-400">
              {debugInfo.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </details>
        )}
      </main>
      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700">
        <p>📰 Latest News - 日本語ニュースアグリゲーター</p>
        <p className="mt-1 text-xs">Powered by RSS Feeds | Render対応</p>
      </footer>
    </div>
  );
}

export default App;
