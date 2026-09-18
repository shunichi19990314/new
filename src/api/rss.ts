import type { Story, Category } from '../types';

// バックエンドAPIのURL
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error('❌ VITE_API_URL environment variable is not set!');
  console.error('Please set it in Render Dashboard -> Environment');
}

export async function fetchStories(category: Category): Promise<Story[]> {
  if (!API_BASE_URL) {
    throw new Error('API URL is not configured. Please set VITE_API_URL environment variable.');
  }

  console.log(`Fetching from API: ${API_BASE_URL}/api/news/${category}`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/news/${category}`, {
      signal: AbortSignal.timeout(30000), // 30秒タイムアウト
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✓ Received ${data.count} stories from API`);

    // APIのレスポンスをStory型に変換
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
