import type { Story, Category } from '../types';
import { CATEGORIES } from '../types';

// バックエンドAPIのURL（RenderでデプロイしたAPIのURLに変更してください）
// 例: 'https://news-api.onrender.com'
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// バックエンドAPIを使うかどうか
const USE_BACKEND_API = API_BASE_URL !== '';

interface ParsedItem {
  title: string;
  link: string;
  description: string;
  content: string;
  pubDate: string;
  author: string;
  thumbnail: string;
  source: string;
}

// HTMLタグを除去してテキストのみ抽出
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// HTMLから最初の画像を抽出
function extractImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return match ? match[1] : undefined;
}

// 記事コンテンツをクリーンアップ
function cleanContent(html: string): string {
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  return cleaned;
}

// XMLからRSSアイテムをパース
function parseRSS(xmlText: string, sourceName: string): ParsedItem[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    console.error('XML parse error:', parseError.textContent);
    return [];
  }

  const items: ParsedItem[] = [];
  
  // RSS 2.0形式
  const rssItems = xmlDoc.querySelectorAll('item');
  rssItems.forEach((item) => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const content = item.querySelector('content\\:encoded, encoded')?.textContent || description;
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const author = item.querySelector('author, dc\\:creator, creator')?.textContent || '';
    
    const mediaContent = item.querySelector('media\\:content, content');
    const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
    const thumbnail = mediaContent?.getAttribute('url') || 
                     mediaThumbnail?.getAttribute('url') || 
                     extractImage(content || description) || '';

    items.push({
      title: stripHtml(title),
      link,
      description: stripHtml(description).slice(0, 300),
      content: cleanContent(content || description),
      pubDate,
      author: stripHtml(author),
      thumbnail,
      source: sourceName,
    });
  });

  // Atom形式
  if (items.length === 0) {
    const atomEntries = xmlDoc.querySelectorAll('entry');
    atomEntries.forEach((entry) => {
      const title = entry.querySelector('title')?.textContent || '';
      const linkEl = entry.querySelector('link[rel="alternate"], link');
      const link = linkEl?.getAttribute('href') || '';
      const summary = entry.querySelector('summary')?.textContent || '';
      const content = entry.querySelector('content')?.textContent || summary;
      const published = entry.querySelector('published, updated')?.textContent || '';
      const author = entry.querySelector('author name')?.textContent || '';

      items.push({
        title: stripHtml(title),
        link,
        description: stripHtml(summary).slice(0, 300),
        content: cleanContent(content || summary),
        pubDate: published,
        author: stripHtml(author),
        thumbnail: extractImage(content || summary) || '',
        source: sourceName,
      });
    });
  }

  return items;
}

// バックエンドAPIから取得
async function fetchFromBackend(category: Category): Promise<Story[]> {
  console.log(`Fetching from backend API: ${API_BASE_URL}/api/news/${category}`);
  
  const response = await fetch(`${API_BASE_URL}/api/news/${category}`, {
    signal: AbortSignal.timeout(15000),
  });
  
  if (!response.ok) {
    throw new Error(`Backend API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return data.items.map((item: any, index: number) => ({
    id: `${category}-${index}-${item.link}`,
    title: item.title || 'タイトルなし',
    url: item.link,
    source: item.source,
    author: item.author || undefined,
    publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
    description: item.description,
    content: item.content,
    thumbnail: item.thumbnail || undefined,
    category,
  }));
}

// フロントエンドのみで取得（CORSプロキシ使用）
async function fetchViaRss2Json(rssUrl: string): Promise<ParsedItem[] | null> {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20`;
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items || data.items.length === 0) {
      return null;
    }

    const sourceName = data.feed?.title || new URL(rssUrl).hostname.replace('www.', '');

    return data.items.map((item: any) => ({
      title: stripHtml(item.title || ''),
      link: item.link || '',
      description: stripHtml(item.description || '').slice(0, 300),
      content: cleanContent(item.content || item.description || ''),
      pubDate: item.pubDate || '',
      author: stripHtml(item.author || ''),
      thumbnail: item.thumbnail || extractImage(item.content || item.description || '') || '',
      source: sourceName,
    }));
  } catch (error) {
    console.warn('RSS2JSON failed:', error);
    return null;
  }
}

async function fetchViaCorsProxy(rssUrl: string): Promise<ParsedItem[] | null> {
  const proxies = [
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  const sourceName = new URL(rssUrl).hostname.replace('www.', '');

  for (const proxyFn of proxies) {
    try {
      const proxyUrl = proxyFn(rssUrl);
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
        },
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 100) {
          const items = parseRSS(text, sourceName);
          if (items.length > 0) {
            return items;
          }
        }
      }
    } catch (error) {
      console.warn(`CORS proxy failed:`, error);
      continue;
    }
  }
  
  return null;
}

async function fetchRSS(rssUrl: string): Promise<ParsedItem[]> {
  console.log(`Fetching RSS: ${rssUrl}`);
  
  let items = await fetchViaRss2Json(rssUrl);
  if (items && items.length > 0) {
    console.log(`✓ RSS2JSON succeeded: ${items.length} items`);
    return items;
  }
  
  items = await fetchViaCorsProxy(rssUrl);
  if (items && items.length > 0) {
    console.log(`✓ CORS proxy succeeded: ${items.length} items`);
    return items;
  }
  
  console.error(`✗ All methods failed for: ${rssUrl}`);
  return [];
}

async function fetchFromFrontend(category: Category): Promise<Story[]> {
  const catInfo = CATEGORIES.find(c => c.key === category);
  if (!catInfo) throw new Error(`Unknown category: ${category}`);

  console.log(`\n=== Fetching stories for category: ${category} (frontend) ===`);

  const allItems: ParsedItem[] = [];

  const results = await Promise.allSettled(
    catInfo.rssUrls.map(rssUrl => fetchRSS(rssUrl))
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      allItems.push(...result.value);
    }
  }

  console.log(`Total items fetched: ${allItems.length}\n`);

  const stories: Story[] = allItems.map((item, index) => ({
    id: `${category}-${index}-${item.link}`,
    title: item.title || 'タイトルなし',
    url: item.link,
    source: item.source,
    author: item.author || undefined,
    publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
    description: item.description,
    content: item.content,
    thumbnail: item.thumbnail || undefined,
    category,
  }));

  const seen = new Set<string>();
  const unique = stories.filter(story => {
    if (!story.url || seen.has(story.url)) return false;
    seen.add(story.url);
    return true;
  });

  return unique.sort((a, b) => b.publishedAt - a.publishedAt);
}

// メインのfetch関数
export async function fetchStories(category: Category): Promise<Story[]> {
  // バックエンドAPIが設定されている場合はそれを使う
  if (USE_BACKEND_API) {
    try {
      console.log('Using backend API');
      return await fetchFromBackend(category);
    } catch (error) {
      console.warn('Backend API failed, falling back to frontend:', error);
      // バックエンドが失敗した場合はフロントエンドにフォールバック
    }
  }
  
  // フロントエンドのみで取得
  return await fetchFromFrontend(category);
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
