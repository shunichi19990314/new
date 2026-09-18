import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');
  const [filterSource, setFilterSource] = useState<string>('all');
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
    setSearchQuery(''); // カテゴリ変更時に検索をクリア
    setFilterSource('all'); // フィルタをリセット
    setSortBy('date'); // ソートをリセット
    setPage(0); // ページをリセット
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0); // 検索時にページをリセット
  };

  // ソート・フィルタ変更時にページをリセット
  useEffect(() => {
    setPage(0);
  }, [sortBy, filterSource]);

  // 利用可能なソースを取得
  const availableSources = useMemo(
    () => Array.from(new Set(allStories.map(story => story.source))).sort(),
    [allStories]
  );
  
  // 検索フィルタリング
  const filteredStories = useMemo(() => {
    return searchQuery
      ? allStories.filter(story => {
          const matchesQuery = 
            story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            story.source.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesSource = filterSource === 'all' || story.source === filterSource;
          
          return matchesQuery && matchesSource;
        })
      : allStories.filter(story => filterSource === 'all' || story.source === filterSource);
  }, [allStories, searchQuery, filterSource]);

  // ソート機能
  const sortedStories = useMemo(() => {
    return [...filteredStories].sort((a, b) => {
      if (sortBy === 'date') {
        return b.publishedAt - a.publishedAt; // 日付順（新しい順）
      } else {
        // 関連度順（検索キーワードの一致度でソート）
        if (!searchQuery) return b.publishedAt - a.publishedAt;
        
        const query = searchQuery.toLowerCase();
        const scoreA = 
          (a.title.toLowerCase().includes(query) ? 2 : 0) +
          (a.description.toLowerCase().includes(query) ? 1 : 0);
        const scoreB = 
          (b.title.toLowerCase().includes(query) ? 2 : 0) +
          (b.description.toLowerCase().includes(query) ? 1 : 0);
        
        return scoreB - scoreA;
      }
    });
  }, [filteredStories, sortBy, searchQuery]);
  // 表示するストーリーを更新
  useEffect(() => {
    if (searchQuery) {
      // 検索中は全結果を表示（ページネーションなし）
      setStories(sortedStories);
    } else {
      // 通常時はページネーション
      const start = page * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setStories(sortedStories.slice(start, end));
    }
  }, [searchQuery, sortedStories, page]);

  const handleNextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (page > 0) {
      const newPage = page - 1;
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(sortedStories.length / ITEMS_PER_PAGE);

  if (selectedStory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          category={category} 
          onCategoryChange={handleCategoryChange}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterSource={filterSource}
          onFilterChange={setFilterSource}
          availableSources={availableSources}
        />
        <NewsDetail story={selectedStory} onBack={() => setSelectedStory(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        category={category} 
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterSource={filterSource}
        onFilterChange={setFilterSource}
        availableSources={availableSources}
      />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  {error}
                </p>
                {error.includes('VITE_API_URL') && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded text-sm">
                    <p className="font-bold mb-2">🔧 設定方法：</p>
                    <ol className="list-decimal list-inside space-y-1 text-yellow-900 dark:text-yellow-100">
                      <li>Render Dashboardでフロントエンドサービスを開く</li>
                      <li>左メニューの「Environment」をクリック</li>
                      <li>「Add Environment Variable」をクリック</li>
                      <li>Key: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">VITE_API_URL</code></li>
                      <li>Value: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">https://あなたのAPIのURL</code></li>
                      <li>「Save Changes」→「Manual Deploy」で再デプロイ</li>
                    </ol>
                  </div>
                )}
                {error.includes('タイムアウト') && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded text-sm">
                    <p className="font-bold mb-2">💡 ヒント：</p>
                    <p className="text-yellow-900 dark:text-yellow-100">
                      無料プランは15分間アクセスがないとスリープします。<br />
                      初回アクセス時に30秒ほどお待ちください。
                    </p>
                  </div>
                )}
                <button
                  onClick={() => loadStories(category)}
                  className="mt-3 text-sm text-yellow-700 dark:text-yellow-300 underline hover:no-underline font-medium"
                >
                  🔄 再読み込み
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 検索結果の表示 */}
        {searchQuery && !loading && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              🔍 「<span className="font-bold">{searchQuery}</span>」の検索結果: {filteredStories.length}件
            </p>
          </div>
        )}

        <NewsList
          stories={stories}
          loading={loading}
          onSelect={setSelectedStory}
        />
        
        {/* 検索結果が0件の場合 */}
        {searchQuery && !loading && filteredStories.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">🔍</span>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              「{searchQuery}」に一致するニュースが見つかりませんでした
            </p>
            <button
              onClick={() => handleSearch('')}
              className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              検索をクリア
            </button>
          </div>
        )}
        
        {/* ページネーション（検索中は非表示） */}
        {!loading && allStories.length > 0 && !searchQuery && (
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
