import { CATEGORIES, type Category, type Story } from '../types';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export async function fetchStoryIds(category: Category): Promise<number[]> {
  const catInfo = CATEGORIES.find(c => c.key === category);
  if (!catInfo) throw new Error(`Unknown category: ${category}`);

  const response = await fetch(`${BASE_URL}/${catInfo.endpoint}.json`);
  if (!response.ok) throw new Error('Failed to fetch story IDs');

  return response.json();
}

export async function fetchStory(id: number): Promise<Story | null> {
  try {
    const response = await fetch(`${BASE_URL}/item/${id}.json`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export function getStoryUrl(story: Story): string {
  return story.url || `https://news.ycombinator.com/item?id=${story.id}`;
}

export function getCommentsUrl(story: Story): string {
  return `https://news.ycombinator.com/item?id=${story.id}`;
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return 'たった今';
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
  return new Date(timestamp * 1000).toLocaleDateString('ja-JP');
}
