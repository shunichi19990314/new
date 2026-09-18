// Render用バックエンドAPIサーバー
// このファイルをサーバーサイドで実行することで、CORSの問題を回避できます

import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import iconv from 'iconv-lite';

const app = express();
const PORT = process.env.PORT || 3001;

// CORSを許可
app.use(cors());
app.use(express.json());

// エンコーディングを検出する関数
function detectEncoding(buffer, contentType) {
  // Content-Typeヘッダーからcharsetを取得
  const charsetMatch = contentType?.match(/charset=([^\s;]+)/i);
  if (charsetMatch) {
    return charsetMatch[1].toLowerCase();
  }

  // HTML/XMLの先頭部分からcharsetを検出
  const htmlSnippet = buffer.toString('ascii', 0, Math.min(buffer.length, 4096));
  
  // <?xml version="1.0" encoding="..."?>
  const xmlEncodingMatch = htmlSnippet.match(/<\?xml[^>]+encoding=["']?([^"'\s;>]+)/i);
  if (xmlEncodingMatch) {
    return xmlEncodingMatch[1].toLowerCase();
  }

  // <meta charset="...">
  const metaCharsetMatch = htmlSnippet.match(/<meta[^>]+charset=["']?([^"'\s;>]+)/i);
  if (metaCharsetMatch) {
    return metaCharsetMatch[1].toLowerCase();
  }

  // <meta http-equiv="Content-Type" content="...charset=...">
  const metaContentTypeMatch = htmlSnippet.match(/<meta[^>]+content=["'][^"']*charset=([^"'\s;>]+)/i);
  if (metaContentTypeMatch) {
    return metaContentTypeMatch[1].toLowerCase();
  }

  // デフォルトはUTF-8
  return 'utf-8';
}

// RSSフィードを取得してエンコーディングを処理する関数
async function fetchRSSFeed(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
    timeout: 10000,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const nodeBuffer = Buffer.from(buffer);
  const contentType = response.headers.get('content-type');
  
  // エンコーディングを検出
  let encoding = detectEncoding(nodeBuffer, contentType);
  const encodingMap = {
    'shift_jis': 'shiftjis',
    'shift-jis': 'shiftjis',
    'sjis': 'shiftjis',
    'x-sjis': 'shiftjis',
    'euc-jp': 'eucjp',
    'euc_jp': 'eucjp',
    'x-euc-jp': 'eucjp',
    'iso-2022-jp': 'iso2022jp',
    'utf-8': 'utf8',
    'utf8': 'utf8',
  };

  const normalizedEncoding = encodingMap[encoding] || encoding;
  
  if (iconv.encodingExists(normalizedEncoding)) {
    return iconv.decode(nodeBuffer, normalizedEncoding);
  }
  
  return iconv.decode(nodeBuffer, 'utf8');
}

// RSSパーサーを初期化
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
  },
});

// RSSフィードをパースするラッパー関数
async function parseRSSFeed(url) {
  const xmlString = await fetchRSSFeed(url);
  return await parser.parseString(xmlString);
}

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
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKeys: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      openrouterKeyPrefix: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) + '...' : null,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      geminiKeyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : null,
    }
  });
});

// OpenRouter APIテストエンドポイント
app.get('/api/test-openrouter', async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return res.status(400).json({ 
      error: 'OPENROUTER_API_KEY is not set',
      message: 'Please set OPENROUTER_API_KEY in Render Dashboard -> Environment'
    });
  }

  try {
    console.log('=== Testing OpenRouter API ===');
    console.log('API Key prefix:', apiKey.substring(0, 10) + '...');
    
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://latest-news-app.onrender.com',
        'X-OpenRouter-Title': 'Latest News App',
      },
    });

    const prompt = '「こんにちは」と言ってください。';
    
    console.log('Sending test request to OpenRouter API...');
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
    });
    
    const text = response.choices[0].message.content;
    console.log('✓ OpenRouter API test succeeded');
    
    res.json({
      status: 'ok',
      message: 'OpenRouter API is working correctly',
      response: text,
      model: 'google/gemini-2.0-flash-exp:free',
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });
  } catch (error) {
    console.error('✗ OpenRouter API test failed:', error.message);
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'OpenRouter API test failed',
      error: error.message,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });
  }
});

// Gemini APIテストエンドポイント
app.get('/api/test-gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(400).json({ 
      error: 'GEMINI_API_KEY is not set',
      message: 'Please set GEMINI_API_KEY in Render Dashboard -> Environment'
    });
  }

  try {
    console.log('=== Testing Gemini API ===');
    console.log('API Key prefix:', apiKey.substring(0, 10) + '...');
    
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = '「こんにちは」と言ってください。';
    
    console.log('Sending test request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✓ Gemini API test succeeded');
    
    res.json({
      status: 'ok',
      message: 'Gemini API is working correctly',
      response: text,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });
  } catch (error) {
    console.error('✗ Gemini API test failed:', error.message);
    console.error('Error details:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Gemini API test failed',
      error: error.message,
      statusCode: error.status || null,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });
  }
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
          const feed = await parseRSSFeed(url);
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

    // レスポンスをバッファとして取得
    const buffer = await response.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);
    
    // エンコーディングを検出
    const contentType = response.headers.get('content-type');
    let encoding = detectEncoding(nodeBuffer, contentType);
    console.log(`Detected encoding: ${encoding}`);

    // エンコーディングのエイリアスを正規化
    const encodingMap = {
      'shift_jis': 'shiftjis',
      'shift-jis': 'shiftjis',
      'sjis': 'shiftjis',
      'x-sjis': 'shiftjis',
      'euc-jp': 'eucjp',
      'euc_jp': 'eucjp',
      'x-euc-jp': 'eucjp',
      'iso-2022-jp': 'iso2022jp',
      'utf-8': 'utf8',
      'utf8': 'utf8',
    };

    const normalizedEncoding = encodingMap[encoding] || encoding;
    
    // iconv-liteでデコード
    let html;
    if (iconv.encodingExists(normalizedEncoding)) {
      html = iconv.decode(nodeBuffer, normalizedEncoding);
      console.log(`Decoded with encoding: ${normalizedEncoding}`);
    } else {
      console.warn(`Unknown encoding: ${normalizedEncoding}, falling back to UTF-8`);
      html = iconv.decode(nodeBuffer, 'utf8');
    }

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

// 簡易抽出要約関数
function extractiveSummary(text, maxSentences = 5) {
  if (!text) return '';
  
  // HTMLタグを除去
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // 文に分割（日本語の句点、感嘆符、疑問符で分割）
  const sentences = cleanText.split(/(?<=[。！？])/g).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) return '';
  if (sentences.length <= maxSentences) return sentences.join('');
  
  // 最初の数文を抽出
  return sentences.slice(0, maxSentences).join('');
}

// OpenAI APIを使った要約関数
async function summarizeWithOpenAI(text, title) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('OPENAI_API_KEY not set');
    return null;
  }

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'あなたはニュース記事の要約を行うアシスタントです。日本語で300字程度で要約してください。'
        },
        {
          role: 'user',
          content: `タイトル: ${title}\n\n記事内容:\n${text.substring(0, 3000)}\n\n要約:`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return null;
  }
}

// OpenRouter APIを使った要約関数
async function summarizeWithOpenRouter(text, title) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.log('OPENROUTER_API_KEY not set');
    return null;
  }

  try {
    const { OpenAI } = await import('openai');
    
    // OpenRouterはOpenAI SDKと互換性がある
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://latest-news-app.onrender.com', // 任意
        'X-OpenRouter-Title': 'Latest News App', // 任意
      },
    });

    // 無料モデルを使用（例: google/gemini-flash-1.5）
    // 利用可能なモデル: https://openrouter.ai/models
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free', // 無料のGeminiモデル
      messages: [
        {
          role: 'system',
          content: 'あなたはニュース記事の要約を行うアシスタントです。日本語で300字程度で要約してください。'
        },
        {
          role: 'user',
          content: `タイトル: ${title}\n\n記事内容:\n${text.substring(0, 3000)}\n\n要約:`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenRouter API error:', error.message);
    return null;
  }
}

// Anthropic Claude APIを使った要約関数
async function summarizeWithClaude(text, title) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('ANTHROPIC_API_KEY not set');
    return null;
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `以下のニュース記事を日本語で300字程度で要約してください。\n\nタイトル: ${title}\n\n記事内容:\n${text.substring(0, 3000)}\n\n要約:`
        }
      ],
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    return null;
  }
}

// Gemini APIを使った要約関数
async function summarizeWithGemini(text, title) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('GEMINI_API_KEY not set');
    return null;
  }

  try {
    console.log('Initializing Gemini API...');
    console.log('API Key prefix:', apiKey.substring(0, 10) + '...');
    
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `以下のニュース記事を日本語で300字程度で要約してください。

タイトル: ${title}

記事内容:
${text.substring(0, 3000)}

要約:`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summaryText = response.text();
    console.log('✓ Gemini API succeeded, summary length:', summaryText.length);
    return summaryText;
  } catch (error) {
    console.error('✗ Gemini API error:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error.status) {
      console.error('HTTP Status:', error.status);
    }
    return null;
  }
}

// 記事要約API
app.get('/api/summarize', async (req, res) => {
  const { content, title } = req.query;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    console.log('=== Generating summary ===');
    console.log('Available API keys:');
    console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✓' : '✗');
    console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓' : '✗');
    console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✓' : '✗');
    console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓' : '✗');
    
    let summary = null;
    let method = 'extractive';
    
    // 1. OpenRouter APIを試す（推奨・地域制限なし）
    if (process.env.OPENROUTER_API_KEY) {
      console.log('Trying OpenRouter API...');
      summary = await summarizeWithOpenRouter(content, title || '');
      if (summary) {
        method = 'openrouter';
        console.log('✓ OpenRouter API succeeded');
      }
    }
    
    // 2. OpenAI APIを試す
    if (!summary && process.env.OPENAI_API_KEY) {
      console.log('Trying OpenAI API...');
      summary = await summarizeWithOpenAI(content, title || '');
      if (summary) {
        method = 'openai';
        console.log('✓ OpenAI API succeeded');
      }
    }
    
    // 3. Anthropic Claude APIを試す
    if (!summary && process.env.ANTHROPIC_API_KEY) {
      console.log('Trying Anthropic Claude API...');
      summary = await summarizeWithClaude(content, title || '');
      if (summary) {
        method = 'claude';
        console.log('✓ Anthropic Claude API succeeded');
      }
    }
    
    // 4. Gemini APIを試す
    if (!summary && process.env.GEMINI_API_KEY) {
      console.log('Trying Gemini API...');
      summary = await summarizeWithGemini(content, title || '');
      if (summary) {
        method = 'gemini';
        console.log('✓ Gemini API succeeded');
      }
    }
    
    // 5. 全てのAPIが失敗した場合は抽出型要約
    if (!summary) {
      console.log('Using extractive summary (fallback)');
      summary = extractiveSummary(content, 5);
    }
    
    res.json({
      summary,
      method,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 News API server running on port ${PORT}`);
});
