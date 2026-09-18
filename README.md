# Latest News - ニュースアグリゲーター

Hacker News APIを使用した最新ニュース取得アプリです。

## 機能

- 🔥 トップニュース
- 🆕 新着ニュース
- ⭐ ベストストーリー
- ❓ 質問（Ask HN）
- 🚀 紹介（Show HN）
- 💼 求人
- ページネーション
- 記事詳細表示
- レスポンシブデザイン

## 技術スタック

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Hacker News API（APIキー不要）

## ローカル開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## Renderへのデプロイ方法

### 方法1: render.yamlを使用（推奨）

1. このリポジトリをGitHubにプッシュ
2. [Render Dashboard](https://dashboard.render.com/)にアクセス
3. 「New」→「Static Site」を選択
4. GitHubリポジトリを接続
5. render.yamlが自動検出されるので確認してデプロイ

### 方法2: 手動設定

1. Render Dashboardで「New」→「Static Site」
2. リポジトリを接続
3. 以下を設定：
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. デプロイ

## API

このアプリは[Hacker News API](https://github.com/HackerNews/API)を使用しています。
APIキーは不要で、CORSにも対応しています。
