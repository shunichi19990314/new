// Render用バックエンドAPIサーバー
// このファイルをサーバーサイドで実行することで、CORSの問題を回避できます

import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';

const app = express();
const PORT = process.env.PORT || 3001;

// CORSを許可
app.use(cors());
app.use(express.json());

// RSSパーサーを初期化
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
  },
});

// カテゴリ定義
const CATEGORIES = {
  top: [
    'https://www3.nhk.or.jp/rss/news/cat0.xml',
    'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
  ],
  tech: [
    'https://rss.itmedia.co.jp/rss/2.0/topstory.xml',
    'https://gigazine.net/news/rss_atom10/',
  ],
  business: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  ],
  entertainment: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  ],
  sports: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  ],
  science: [
    'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=ja&gl=JP&ceid=JP:ja',
  ],
};

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ニュース取得API
app.get('/api/news/:category', async (req, res) => {
  const category = req.params.category;
  
  if (!CATEGORIES[category]) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const rssUrls = CATEGORIES[category];
    const allItems: any[] = [];

    // 各RSSフィードを並列取得
    const results = await Promise.allSettled(
      rssUrls.map(async (url) => {
        try {
          const feed = await parser.parseURL(url);
          return feed.items.map((item) => ({
            title: item.title || '',
            link: item.link || '',
            description: item.contentSnippet || item.content || '',
            content: item.content || item.contentSnippet || '',
            pubDate: item.pubDate || item.isoDate || '',
            author: item.creator || item.author || '',
            thumbnail: item.enclosure?.url || '',
            source: feed.title || new URL(url).hostname,
          }));
        } catch (error) {
          console.error(`Failed to fetch ${url}:`, error);
          return [];
        }
      })
    );

    // 成功した結果を収集
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        allItems.push(...result.value);
      }
    }

    // 重複を除去し、日付順にソート
    const seen = new Set<string>();
    const unique = allItems.filter(item => {
      if (!item.link || seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });

    const sorted = unique.sort((a, b) => {
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    res.json({
      category,
      count: sorted.length,
      items: sorted,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 News API server running on port ${PORT}`);
});
