# 📰 Latest News - 日本語ニュースアグリゲーター

日本語の最新ニュースをサイト内で閲覧できるニュースアプリです。

## ✨ 主な機能

### 📰 カテゴリ別ニュース
- 🔥 **トップ** - NHK、Google News JPから総合ニュース
- 💻 **テクノロジー** - IT・テクノロジー関連ニュース
- 💼 **ビジネス** - 経済・ビジネスニュース
- 🎬 **エンタメ** - エンターテインメントニュース
- ⚽ **スポーツ** - スポーツニュース
- 🔬 **科学** - 科学・テクノロジーニュース

### 📖 記事閲覧機能
- 📰 **記事本文取得** - 元サイトのHTMLから記事本文を自動抽出して表示
- 🖼️ **画像表示** - Open Graph画像や記事内の画像を大きく表示
- 📝 **リッチコンテンツ** - 見出し、リスト、テーブル、コードブロックなど対応
- ✨ **AI要約** - Gemini APIで記事を要約（APIキー未設定時は抽出型要約）
- ↗ **元サイトリンク** - 外部リンクで元記事を開く
- 📄 **ページネーション** - 15件ずつページ送り
- 🎨 **レスポンシブデザイン** - スマホ・タブレット・PC対応

---

## 🚀 GitHub公開 → Renderデプロイ 完全ガイド

> ⏱️ 所要時間：約10分
> 💰 費用：無料

---

### 📋 必要なもの（事前準備）

| 用意するもの | 無料？ | 取得先 |
|---|---|---|
| GitHub アカウント | ✅ 無料 | [github.com](https://github.com/signup) |
| Render アカウント | ✅ 無料 | [render.com](https://dashboard.render.com/register) |
| Git（PCにインストール） | ✅ 無料 | [git-scm.com](https://git-scm.com/downloads) |

---

## ステップ 1️⃣ GitHubでリポジトリを作る

> 「リポジトリ」＝ ファイルを保管するオンラインのフォルダ

1. [github.com](https://github.com) にログイン
2. 画面右上の **「＋」** ボタンをクリック
3. **「New repository」** をクリック
4. 以下のように入力：

```
Repository name:  latest-news-app    ← 好きな名前でOK
Description:      日本語ニュースアプリ  ← 空欄でもOK
● Public          ← 「Public」を選んでください
☑ Add a README   ← チェックを入れる
```

5. 一番下の **「Create repository」** ボタンをクリック

✅ これでリポジトリができました！

---

## ステップ 2️⃣ 自分のPCのファイルをGitHubに送る

### ターミナル（コマンドプロンプト）を開く

- **Mac**: `Command + Space` → 「ターミナル」と入力
- **Windows**: `Windowsキー` → 「cmd」または「PowerShell」と入力

### 以下のコマンドを1行ずつコピー＆ペーストして実行

```bash
# ① プロジェクトのフォルダに移動
cd プロジェクトのフォルダのパス

# ② Gitを始める宣言
git init

# ③ ファイルを全部追加
git add .

# ④ 「最初のバージョン」として保存
git commit -m "日本語ニュースアプリの初回公開"

# ⑤ ブランチ名をmainに
git branch -M main
```

### GitHubのリポジトリURLを接続

GitHubのリポジトリページで **「<> Code」** ボタン → URLをコピーして、以下のように実行：

```bash
# ⑥ GitHubと接続（YOUR_USERNAME を自分のユーザー名に置き換えてください）
git remote add origin https://github.com/YOUR_USERNAME/latest-news-app.git

# ⑦ ファイルをGitHubに送信！
git push -u origin main
```

> 💡 GitHubからユーザー名とパスワード（トークン）を聞かれたら入力してください

✅ これでGitHubにファイルが公開されました！

---

## ステップ 3️⃣ Renderでサイトに公開する

1. [render.com](https://dashboard.render.com) にログイン
2. 画面右上の **「New +」** をクリック
3. **「Static Site」** をクリック
4. **「Connect a repository」** をクリック
   - 初回はGitHubとの連携許可を求められます → **「Authorize Render」** をクリック
5. 先ほど作った **`latest-news-app`** を探して **「Connect」** をクリック
6. 以下の設定を確認（自動で入力されています）：

| 項目 | 値 |
|---|---|
| **Name** | `latest-news-app`（好きな名前でOK） |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

7. 一番下の **「Create Static Site」** ボタンをクリック
8. 2〜3分待つとデプロイ完了！

✅ 表示されたURL（例: `latest-news-app.onrender.com`）があなたのサイトです！

---

## 🎉 完成！

おめでとうございます！あなたのサイトがインターネット上に公開されました。

---

## 📌 よくある質問

### Q. もう一度デプロイするには？
GitHubにファイルをプッシュするだけで**自動で再デプロイ**されます。

```bash
git add .
git commit -m "変更内容の説明"
git push
```

### Q. サイトのURLを変更したい
Renderダッシュボード → 該当のサイト → 「Settings」→ 「Change name」で変更可能

### Q. デプロイに失敗した
- Renderのダッシュボードで「Logs」を確認
- Build Commandが正しいか確認
- `npm run build` がローカルで成功するか確認

### Q. 無料プランの制限は？
- 15分間アクセスがないとスリープする（初回アクセス時に30秒ほど待たされる）
- 月100GBの帯域幅まで無料

---

## ✨ アプリの機能

- 🔥 トップ / 💻 テクノロジー / 💼 ビジネス / 🎬 エンタメ / ⚽ スポーツ / 🔬 科学
- 📝 要約表示 / 🌐 サイト内閲覧 / ↗ 元サイトリンク
- 📱 スマホ対応 / 🖼️ サムネイル表示

## 🔧 技術スタック

React + TypeScript + Vite + Tailwind CSS + RSS API

## 📡 データソース

NHKニュース / Google News 日本語版 / ITmedia

## ✨ AI要約機能について

記事詳細画面で「✨ AI要約を生成」ボタンをクリックすると、記事の内容を要約できます。

### 対応API（優先順位順）

1. **OpenAI API**（推奨・日本からアクセス可能）
   - [OpenAI Platform](https://platform.openai.com/api-keys)でAPIキーを取得
   - 環境変数: `OPENAI_API_KEY`
   - モデル: GPT-3.5 Turbo

2. **Anthropic Claude API**（日本からアクセス可能）
   - [Anthropic Console](https://console.anthropic.com/)でAPIキーを取得
   - 環境変数: `ANTHROPIC_API_KEY`
   - モデル: Claude 3 Haiku

3. **Google Gemini API**（⚠️ 地域制限あり）
   - [Google AI Studio](https://aistudio.google.com/apikey)でAPIキーを取得
   - 環境変数: `GEMINI_API_KEY`
   - モデル: Gemini 1.5 Flash
   - **注意**: 日本からはアクセスできない場合があります

### APIキーの設定方法

1. Render Dashboardで`news-api`サービスの「Environment」を開く
2. 「Add Environment Variable」をクリック
3. 以下のいずれかを設定：

| API | Key | Value |
|-----|-----|-------|
| OpenAI | `OPENAI_API_KEY` | `sk-...` |
| Claude | `ANTHROPIC_API_KEY` | `sk-ant-...` |
| Gemini | `GEMINI_API_KEY` | `AI...` |

4. 「Save Changes」をクリック
5. バックエンドAPIを再デプロイ（「Manual Deploy」→「Deploy latest commit」）

### APIキー未設定の場合

記事の重要な部分を抽出する「抽出型要約」が自動的に使用されます。
