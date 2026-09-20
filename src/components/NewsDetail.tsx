import { useState, useEffect } from 'react';
import type { Story } from '../types';
import { formatDate, fetchArticle, fetchSummary, fetchChatResponse, AVAILABLE_MODELS, type ArticleData, type SummaryData, type ChatMessage } from '../api/rss';
import { ArrowLeftIcon, SourceIcon, UserIcon, ClockIcon, ExternalLinkIcon, SparklesIcon, MessageIcon, SpinnerIcon, SendIcon, BookOpenIcon, AlertIcon } from './Icons';

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
  const [selectedModel, setSelectedModel] = useState<string>('openrouter/free');
  
  // チャット機能の状態
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  let domain = '';
  try {
    domain = new URL(story.url).hostname.replace('www.', '');
  } catch {
    domain = story.source;
  }

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
    
    // 記事が変わったらチャットと要約をリセット
    setSummary(null);
    setShowSummary(false);
    setChatMessages([]);
    setChatInput('');
  }, [story.url]);

  const handleSummarize = async () => {
    if (summary && !summaryLoading) {
      setShowSummary(!showSummary);
      return;
    }

    setSummaryLoading(true);
    setShowSummary(true);
    try {
      const content = articleData?.content || story.content || story.description;
      const title = articleData?.title || story.title;
      const data = await fetchSummary(content, title, selectedModel);
      setSummary(data);
      
      // 要約後にチャットメッセージを初期化
      const titleText = articleData?.title || story.title;
      setChatMessages([
        {
          role: 'system',
          content: `あなたはニュース記事のアシスタントです。以下の記事について質問に答えてください。\n\nタイトル: ${titleText}\n\n要約:\n${data.summary}\n\n記事内容:\n${(content || '').substring(0, 2000)}`
        }
      ]);
      
      if (data.method === 'extractive') {
        console.warn('Using extractive summary. Please check if API keys are set correctly.');
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      alert(`要約の生成に失敗しました。\n\nエラー: ${errorMessage}`);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput.trim() };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetchChatResponse(newMessages, selectedModel);
      setChatMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages([...newMessages, { 
        role: 'assistant', 
        content: '申し訳ありません。回答の生成に失敗しました。もう一度お試しください。' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-6 transition-colors"
      >
        <ArrowLeftIcon size={18} />
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
              <SourceIcon size={14} />
              {domain}
            </span>
            {story.author && (
              <span className="inline-flex items-center gap-1">
                <UserIcon size={14} />
                {story.author}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={14} />
              {formatDate(story.publishedAt)}
            </span>
          </div>

          {(articleData?.description || story.description) && (
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              {articleData?.description || story.description}
            </p>
          )}

          {/* モデル選択と要約ボタン */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <label htmlFor="model-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                <SparklesIcon size={14} className="inline mr-1" />
                モデル:
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setSummary(null);
                  setShowSummary(false);
                }}
                className="flex-1 max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleSummarize}
              disabled={summaryLoading || loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {summaryLoading ? (
                <>
                  <SpinnerIcon size={16} />
                  <span>要約を生成中...</span>
                </>
              ) : summary ? (
                <>
                  <SparklesIcon size={16} />
                  <span>別のモデルで再生成</span>
                </>
              ) : (
                <>
                  <SparklesIcon size={16} />
                  <span>AI要約を生成</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 画像 */}
        {(articleData?.image || story.thumbnail) && (
          <div className="border-b border-gray-100 dark:border-gray-700">
            <img
              src={articleData?.image || story.thumbnail}
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
              <SpinnerIcon size={32} className="mx-auto text-orange-500" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">記事を読み込んでいます...</p>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertIcon size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
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
              <BookOpenIcon size={48} className="mx-auto text-gray-400 dark:text-gray-600" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                記事本文を取得できませんでした
              </p>
            </div>
          )}
        </div>

        {/* 要約表示エリア */}
        {showSummary && summary && (
          <div className="mx-6 mt-4 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon size={20} className="text-purple-600 dark:text-purple-400" />
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
                  <AlertIcon size={14} className="inline mr-1" />
                  <strong>ヒント:</strong> APIキーを設定すると、より高品質なAI要約が利用できます。
                </p>
              </div>
            )}
          </div>
        )}

        {/* チャット機能 */}
        {summary && showSummary && (
          <div className="mx-6 mt-4 mb-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageIcon size={18} />
                  この記事について質問
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  要約内容や記事について質問できます
                </p>
              </div>
              
              <div className="max-h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                {chatMessages.filter(m => m.role !== 'system').map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                    placeholder="質問を入力してください..."
                    disabled={chatLoading}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <SendIcon size={14} />
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <SourceIcon size={12} />
              <span>出典: {story.source}</span>
            </div>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLinkIcon size={14} />
              元サイトで読む
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
