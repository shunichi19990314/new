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
      'https://news.yahoo.co.jp/rss/topics/domestic.xml',
      'https://www.asahi.com/rss/index.html',
      'https://mainichi.jp/rss/etc/mainichi-top.rss',
    ],
  },
  {
    key: 'tech',
    label: 'テクノロジー',
    icon: '💻',
    rssUrls: [
      'https://rss.itmedia.co.jp/rss/2.0/topstory.xml',
      'https://gigazine.net/news/rss_atom10/',
      'https://www.publickey1.jp/atom.xml',
      'https://news.yahoo.co.jp/rss/topics/pc.xml',
    ],
  },
  {
    key: 'business',
    label: 'ビジネス',
    icon: '💼',
    rssUrls: [
      'https://news.yahoo.co.jp/rss/topics/business.xml',
      'https://r.nikkei.com/rss/business.xml',
      'https://toyokeizai.net/list/rss/newlist',
      'https://www.asahi.com/rss/business.html',
    ],
  },
  {
    key: 'entertainment',
    label: 'エンタメ',
    icon: '🎬',
    rssUrls: [
      'https://news.yahoo.co.jp/rss/topics/entertainment.xml',
      'https://www.oricon.co.jp/special/rss/oricon.xml',
      'https://eiga.com/news/rss/',
      'https://www.cinematoday.jp/rss/news.xml',
    ],
  },
  {
    key: 'sports',
    label: 'スポーツ',
    icon: '⚽',
    rssUrls: [
      'https://news.yahoo.co.jp/rss/topics/sports.xml',
      'https://www.nikkansports.com/rss/index.xml',
      'https://www.sanspo.com/rss/sports/sports_top.xml',
      'https://www3.nhk.or.jp/rss/news/cat06.xml',
    ],
  },
  {
    key: 'science',
    label: '科学',
    icon: '🔬',
    rssUrls: [
      'https://news.yahoo.co.jp/rss/topics/science.xml',
      'https://r.nikkei.com/rss/science.xml',
      'https://natgeo.nikkeibp.co.jp/rss/index.xml',
      'https://www.asahi.com/rss/science.html',
    ],
  },
];
