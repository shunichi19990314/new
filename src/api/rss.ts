import type { Story, Category } from '../types';

// バックエンドAPIのURL（末尾の/を削除）
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

if (!API_BASE_URL) {
  console.error('❌ VITE_API_URL environment variable is not set!');
  console.error('Please set it in Render Dashboard -> Environment');
} else {
  console.log('✓ API Base URL:', API_BASE_URL);
}

export interface ArticleData {
  url: string;
  title: string;
  description: string;
  image: string;
  content: string;
  type: string;
}

export async function fetchStories(category: Category): Promise<Story[]> {
  if (!API_BASE_URL) {
    throw new Error('API URL is not configured. Please set VITE_API_URL environment variable.');
  }

  console.log(`Fetching from API: ${API_BASE_URL}/api/news/${category}`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/news/${category}`, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✓ Received ${data.count} stories from API`);

    return data.items.map((item: any, index: number) => ({
      id: `${category}-${index}-${item.link}`,
      title: item.title || 'タイトルなし',
      url: item.link,
      source: item.source,
      author: item.author || undefined,
      publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
      description: item.description || '',
      content: item.content || '',
      thumbnail: item.thumbnail || undefined,
      category,
    }));
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('リクエストがタイムアウトしました。APIがスリープ中の可能性があります。30秒待ってから再試行してください。');
      }
      throw error;
    }
    
    throw new Error('ニュースの取得に失敗しました。');
  }
}

export async function fetchArticle(url: string): Promise<ArticleData> {
  if (!API_BASE_URL) {
    throw new Error('API URL is not configured.');
  }

  console.log(`Fetching article: ${url}`);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/article?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(30000) }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✓ Article fetched successfully');
    return data;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    throw error;
  }
}

export interface SummaryData {
  summary: string;
  method: string;
}

// Gemini APIをフロントエンドから直接呼び出す
async function summarizeWithGeminiDirect(content: string, title: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('VITE_GEMINI_API_KEY not set');
    return null;
  }

  try {
    console.log('Calling Gemini API directly from frontend...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `以下のニュース記事を日本語で300字程度で要約してください。\n\nタイトル: ${title}\n\n記事内容:\n${content.substring(0, 3000)}\n\n要約:`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
        signal: AbortSignal.timeout(30000)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (summary) {
      console.log('✓ Gemini API direct call succeeded');
      return summary.trim();
    }
    
    return null;
  } catch (error) {
    console.error('Gemini direct call error:', error);
    return null;
  }
}

export async function fetchSummary(content: string, title: string): Promise<SummaryData> {
  console.log('Generating summary...');

  // 1. まずGemini APIをフロントエンドから直接試す
  const geminiSummary = await summarizeWithGeminiDirect(content, title);
  if (geminiSummary) {
    return {
      summary: geminiSummary,
      method: 'gemini-direct'
    };
  }

  // 2. バックエンドAPIを試す
  if (API_BASE_URL) {
    try {
      const params = new URLSearchParams({
        content,
        title,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/summarize?${params.toString()}`,
        { signal: AbortSignal.timeout(60000) }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✓ Summary generated via backend');
        return data;
      }
    } catch (error) {
      console.error('Backend API error:', error);
    }
  }

  // 3. 全て失敗した場合
  throw new Error('要約の生成に失敗しました。APIキーが設定されているか確認してください。');
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'たった今';
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;
  
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
