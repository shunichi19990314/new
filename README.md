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

## 🚀 GitHubに公開する手順

### 1. GitHubで新規リポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `latest-news-app`）
4. 「Public」または「Private」を選択
5. 「Create repository」をクリック

### 2. ローカルでGitを初期化してプッシュ

ターミナルで以下のコマンドを実行：

```bash
# Gitを初期化
git init

# ファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: 日本語ニュースアグリゲーター"

# メインブランチを設定
git branch -M main

# GitHubリポジトリをリモートに追加（YOUR_USERNAMEとYOUR_REPOを変更）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# プッシュ
git push -u origin main
```

### 3. Renderでデプロイ

1. [Render Dashboard](https://dashboard.render.com/)にアクセス
2. 「New」→「Static Site」をクリック
3. GitHubリポジトリを接続（初回はRenderにGitHubアクセスを許可）
4. 先ほどプッシュしたリポジトリを選択
5. 設定を確認：
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
6. 「Create Static Site」をクリック
7. デプロイ完了後、表示されるURLでサイトにアクセス

### 4. 自動デプロイ

GitHubにプッシュするたびに、Renderが自動的に再デプロイします。

## 🌐 Renderへのデプロイ（詳細）

### render.yamlを使用（推奨）

`render.yaml`ファイルが既に設定されているので、GitHubリポジトリを接続するだけで自動デプロイされます。

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
