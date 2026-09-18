# 📰 Latest News - 日本語ニュースアグリゲーター

日本語の最新ニュースをサイト内で閲覧できるニュースアプリです。

## ✨ 機能

### ニュースカテゴリ
- 🔥 **トップ** - NHK、Google News JPから総合ニュース
- 💻 **テクノロジー** - IT・テクノロジー関連ニュース
- 💼 **ビジネス** - 経済・ビジネスニュース
- 🎬 **エンタメ** - エンターテインメントニュース
- ⚽ **スポーツ** - スポーツニュース
- 🔬 **科学** - 科学・テクノロジーニュース

### 閲覧機能
- 📝 **要約表示** - RSSフィードの記事本文をサイト内で直接表示
- 🌐 **サイト内閲覧** - iframeで元サイトをサイト内に表示
- ↗ **元サイトリンク** - 外部リンクで元記事を開く
- 📄 **ページネーション** - 15件ずつページ送り
- 🖼️ **サムネイル表示** - 記事のサムネイル画像を自動取得

### UI/UX
- 📱 レスポンシブデザイン（モバイル対応）
- 🌙 ダークモード対応
- ⚡ スケルトンローディング
- 🎨 モダンなカードデザイン

## 🔧 技術スタック

- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Tailwind CSS** (スタイリング)
- **RSS 2 JSON API** (CORS対応のRSS取得)

## 📡 データソース

- NHKニュース RSS
- Google News 日本語版 RSS
- ITmedia RSS

## 🚀 ローカル開発

```bash
npm install
npm run dev
```

## 📦 ビルド

```bash
npm run build
```

## 🌐 Renderへのデプロイ

### render.yamlを使用（推奨）

1. このリポジトリをGitHubにプッシュ
2. [Render Dashboard](https://dashboard.render.com/)にアクセス
3. 「New」→「Static Site」を選択
4. GitHubリポジトリを接続
5. render.yamlが自動検出されるので確認してデプロイ

### 手動設定

1. Render Dashboardで「New」→「Static Site」
2. リポジトリを接続
3. 以下を設定：
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. デプロイ

## 📋 注意事項

- RSSフィードのコンテンツは各メディアの著作権に帰属します
- 一部のサイトはiframeでの表示に対応していない場合があります（X-Frame-Options制限）
- APIキー不要で動作します
