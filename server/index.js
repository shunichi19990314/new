// Render用バックエンドAPIサーバー
// このファイルをサーバーサイドで実行することで、CORSの問題を回避できます

import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

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
    const allItems = [];

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
    const seen = new Set();
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

// 記事本文取得API
app.get('/api/article', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`Fetching article: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      },
      timeout: 15000,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Open Graphメタデータを取得
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const ogType = $('meta[property="og:type"]').attr('content') || '';
    
    // Twitter Cardメタデータ
    const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
    const twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';
    const twitterImage = $('meta[name="twitter:image"]').attr('content') || '';

    // 記事タイトル
    const title = ogTitle || twitterTitle || $('title').text() || $('h1').first().text() || '';
    
    // 記事説明
    const description = ogDescription || twitterDescription || $('meta[name="description"]').attr('content') || '';

    // 記事画像
    const image = ogImage || twitterImage || '';

    // 記事本文を抽出
    // 一般的な記事本文のセレクター
    const articleSelectors = [
      'article',
      '.article-body',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.story-body',
      '.news-article',
      'main',
      '#article-body',
      '.content-body',
    ];

    let articleContent = '';
    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // 不要な要素を削除
        element.find('script, style, nav, header, footer, .ad, .advertisement, .social-share, .related-articles').remove();
        articleContent = element.html() || '';
        break;
      }
    }

    // 記事本文が見つからない場合は、bodyから抽出
    if (!articleContent) {
      $('body').find('script, style, nav, header, footer, .ad, .advertisement').remove();
      articleContent = $('body').html() || '';
    }

    // 画像URLを絶対パスに変換
    const baseUrl = new URL(url);
    articleContent = articleContent.replace(
      /src=["']([^"']+)["']/g,
      (match, src) => {
        if (src.startsWith('http') || src.startsWith('data:')) {
          return match;
        }
        const absoluteUrl = new URL(src, baseUrl).toString();
        return `src="${absoluteUrl}"`;
      }
    );

    // リンクURLを絶対パスに変換
    articleContent = articleContent.replace(
      /href=["']([^"']+)["']/g,
      (match, href) => {
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
          return match;
        }
        const absoluteUrl = new URL(href, baseUrl).toString();
        return `href="${absoluteUrl}"`;
      }
    );

    res.json({
      url,
      title,
      description,
      image,
      content: articleContent,
      type: ogType || 'article',
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ 
      error: 'Failed to fetch article',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 News API server running on port ${PORT}`);
});
