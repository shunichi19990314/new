import type { Story, Category } from '../types';
import { CATEGORIES } from '../types';

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';

interface Rss2JsonItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  categories: string[];
}

interface Rss2JsonResponse {
  status: string;
  feed: {
    title: string;
    link: string;
    description: string;
  };
  items: Rss2JsonItem[];
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function extractImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : undefined;
}

function cleanContent(html: string): string {
  // Remove script and style tags
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove iframes
  cleaned = cleaned.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  return cleaned;
}

export async function fetchStories(category: Category): Promise<Story[]> {
  const catInfo = CATEGORIES.find(c => c.key === category);
  if (!catInfo) throw new Error(`Unknown category: ${category}`);

  const allStories: Story[] = [];

  // Fetch from all RSS sources for this category
  const results = await Promise.allSettled(
    catInfo.rssUrls.map(async (rssUrl) => {
      const apiUrl = `${RSS2JSON_API}?rss_url=${encodeURIComponent(rssUrl)}&api_key=&count=20`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch RSS');
      const data: Rss2JsonResponse = await response.json();
      
      if (data.status !== 'ok') throw new Error('RSS feed error');

      return data.items.map((item, index) => ({
        id: `${category}-${rssUrl}-${index}-${item.guid || item.link}`,
        title: item.title || 'タイトルなし',
        url: item.link,
        source: data.feed.title || new URL(rssUrl).hostname,
        author: item.author || undefined,
        publishedAt: new Date(item.pubDate).getTime(),
        description: stripHtml(item.description || '').slice(0, 200),
        content: cleanContent(item.content || item.description || ''),
        thumbnail: item.thumbnail || extractImage(item.content || item.description || ''),
        category,
      }));
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allStories.push(...result.value);
    }
  }

  // Sort by published date (newest first) and remove duplicates by URL
  const seen = new Set<string>();
  const unique = allStories.filter(story => {
    if (seen.has(story.url)) return false;
    seen.add(story.url);
    return true;
  });

  return unique.sort((a, b) => b.publishedAt - a.publishedAt);
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
