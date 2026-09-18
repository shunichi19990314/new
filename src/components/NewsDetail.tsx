import { useState, useEffect } from 'react';
import type { Story } from '../types';
import { formatDate, fetchArticle, fetchSummary, type ArticleData, type SummaryData } from '../api/rss';

interface NewsDetailProps {
  story: Story;
  onBack: () => void;
}

export default function NewsDetail({ story, onBack }: NewsDetailProps) {
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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

  const handleSummarize = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    setSummaryLoading(true);
    try {
      const content = articleData?.content || story.content || story.description;
      const title = articleData?.title || story.title;
      const data = await fetchSummary(content, title);
      setSummary(data);
      setShowSummary(true);
      
      // 抽出型要約の場合、APIキーの確認を促す
      if (data.method === 'extractive') {
        console.warn('Using extractive summary. Please check if API keys are set correctly.');
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      alert(`要約の生成に失敗しました。\n\nエラー: ${errorMessage}\n\n以下の確認事項をチェックしてください：\n1. Render DashboardでAPIキーが設定されているか\n2. /healthエンドポイントでAPIキーが認識されているか\n3. /api/test-geminiエンドポイントでテストが成功するか`);
    } finally {
      setSummaryLoading(false);
    }
  };

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

          {/* 要約ボタン */}
          <div className="mt-4">
            <button
              onClick={handleSummarize}
              disabled={summaryLoading || loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {summaryLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>要約を生成中...</span>
                </>
              ) : summary ? (
                <>
                  <span>{showSummary ? '🔼' : '🔽'}</span>
                  <span>要約を{showSummary ? '隠す' : '表示'}</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>AI要約を生成</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 要約表示エリア */}
        {showSummary && summary && (
          <div className="mx-6 mt-4 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✨</span>
              <h3 className="font-bold text-purple-900 dark:text-purple-100">AI要約</h3>
              {summary.method === 'openrouter-direct' && (
                <span className="text-xs px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                  OpenRouter (Direct)
                </span>
              )}
              {summary.method === 'gemini-direct' && (
                <span className="text-xs px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                  Gemini (Direct)
                </span>
              )}
              {summary.method === 'openrouter' && (
                <span className="text-xs px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                  OpenRouter
                </span>
              )}
              {summary.method === 'openai' && (
                <span className="text-xs px-2 py-0.5 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                  OpenAI
                </span>
              )}
              {summary.method === 'claude' && (
                <span className="text-xs px-2 py-0.5 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full">
                  Claude
                </span>
              )}
              {summary.method === 'gemini' && (
                <span className="text-xs px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                  Gemini
                </span>
              )}
              {summary.method === 'extractive' && (
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  抽出型
                </span>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {summary.summary}
            </p>
            {summary.method === 'extractive' && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
                <p className="text-yellow-800 dark:text-yellow-200">
                  💡 <strong>ヒント:</strong> APIキーを設定すると、より高品質なAI要約が利用できます。
                  Render Dashboardの「Environment」でAPIキーを設定してください。
                </p>
              </div>
            )}
          </div>
        )}

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
