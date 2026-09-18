export type Category = 'top' | 'new' | 'best' | 'ask' | 'show' | 'job';

export interface Story {
  id: number;
  title: string;
  url?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number;
  type: string;
  text?: string;
}

export interface CategoryInfo {
  key: Category;
  label: string;
  icon: string;
  endpoint: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'top', label: 'トップ', icon: '🔥', endpoint: 'topstories' },
  { key: 'new', label: '新着', icon: '🆕', endpoint: 'newstories' },
  { key: 'best', label: 'ベスト', icon: '⭐', endpoint: 'beststories' },
  { key: 'ask', label: '質問', icon: '❓', endpoint: 'askstories' },
  { key: 'show', label: '紹介', icon: '🚀', endpoint: 'showstories' },
  { key: 'job', label: '求人', icon: '💼', endpoint: 'jobstories' },
];
