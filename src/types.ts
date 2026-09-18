export type Category = 'top' | 'tech' | 'business' | 'entertainment' | 'sports' | 'science';

export interface Story {
  id: string;
  title: string;
  url: string;
  source: string;
  author?: string;
  publishedAt: number;
  description: string;
  content: string;
  thumbnail?: string;
  category: Category;
}

export interface CategoryInfo {
  key: Category;
  label: string;
  icon: string;
  rssUrls: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'top',
    label: 'トップ',
    icon: '🔥',
    rssUrls: [
      'https://www3.nhk.or.jp/rss/news/cat0.xml',
      'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    ],
  },
  {
    key: 'tech',
    label: 'テクノロジー',
    icon: '💻',
    rssUrls: [
      'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
      'https://rss.itmedia.co.jp/rss/2.0/topstory.xml',
    ],
  },
  {
    key: 'business',
    label: 'ビジネス',
    icon: '💼',
    rssUrls: [
      'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    ],
  },
  {
    key: 'entertainment',
    label: 'エンタメ',
    icon: '🎬',
    rssUrls: [
      'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    ],
  },
  {
    key: 'sports',
    label: 'スポーツ',
    icon: '⚽',
    rssUrls: [
      'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    ],
  },
  {
    key: 'science',
    label: '科学',
    icon: '🔬',
    rssUrls: [
      'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
    ],
  },
];
