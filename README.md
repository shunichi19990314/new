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

1. **OpenRouter (Direct)**（🌟 最も推奨・フロントエンドから直接呼び出し・無料モデル利用可能）
   - [OpenRouter](https://openrouter.ai/)でAPIキーを取得
   - 環境変数: `VITE_OPENROUTER_API_KEY`（フロントエンド）
   - モデル: `openrouter/free`（自動ルーター）、NVIDIA Nemotron、Inkling Smallなど（全て無料）
   - **特徴**: 500以上のAIモデルに統一APIでアクセス、Renderの制限なし

2. **Gemini (Direct)**（フォールバック・フロントエンドから直接呼び出し）
   - [Google AI Studio](https://aistudio.google.com/apikey)でAPIキーを取得
   - 環境変数: `VITE_GEMINI_API_KEY`（フロントエンド）
   - モデル: Gemini 1.5 Flash

3. **OpenRouter**（バックエンド経由・Renderの制限を受ける可能性）
   - 環境変数: `OPENROUTER_API_KEY`（バックエンド）

4. **OpenAI API**（バックエンド経由）
   - [OpenAI Platform](https://platform.openai.com/api-keys)でAPIキーを取得
   - 環境変数: `OPENAI_API_KEY`（バックエンド）
   - モデル: GPT-3.5 Turbo

5. **Anthropic Claude API**（バックエンド経由）
   - [Anthropic Console](https://console.anthropic.com/)でAPIキーを取得
   - 環境変数: `ANTHROPIC_API_KEY`（バックエンド）
   - モデル: Claude 3 Haiku

6. **Google Gemini API**（バックエンド経由・⚠️ 地域制限あり）
   - 環境変数: `GEMINI_API_KEY`（バックエンド）
   - **注意**: 日本からはアクセスできない場合があります

### APIキーの設定方法

1. Render Dashboardで`news-api`サービスの「Environment」を開く
2. 「Add Environment Variable」をクリック
3. 以下のいずれかを設定：

| API | 設定場所 | Key | Value |
|-----|---------|-----|-------|
| **OpenRouter (Direct)** | フロントエンド | `VITE_OPENROUTER_API_KEY` | `sk-or-...` |
| Gemini (Direct) | フロントエンド | `VITE_GEMINI_API_KEY` | `AI...` |
| OpenRouter | バックエンド | `OPENROUTER_API_KEY` | `sk-or-...` |
| OpenAI | バックエンド | `OPENAI_API_KEY` | `sk-...` |
| Claude | バックエンド | `ANTHROPIC_API_KEY` | `sk-ant-...` |
| Gemini | バックエンド | `GEMINI_API_KEY` | `AI...` |

4. 「Save Changes」をクリック
5. バックエンドAPIを再デプロイ（「Manual Deploy」→「Deploy latest commit」）

### OpenRouter APIの設定方法（🌟 推奨）

OpenRouterは500以上のAIモデルに統一APIでアクセスできるサービスです。フロントエンドから直接呼び出すため、Renderのネットワーク制限を受けません。

#### 1. APIキーの取得

1. [OpenRouter](https://openrouter.ai/)にアクセス
2. 「Sign In」→ Googleアカウントでログイン
3. 右上のアイコン → 「Keys」をクリック
4. 「Create Key」をクリック
5. APIキーをコピー（`sk-or-...`で始まる）

#### 2. Renderでの設定（フロントエンド）

**重要**: フロントエンドの環境変数は`VITE_`で始める必要があります！

1. Render Dashboardで**フロントエンドサービス**（latest-news-app）の「Environment」を開く
2. 「Add Environment Variable」をクリック
3. 以下を入力：
   - **Key**: `VITE_OPENROUTER_API_KEY`（`VITE_`で始める！）
   - **Value**: `sk-or-v1-...`（コピーしたAPIキー）
4. 「Save Changes」をクリック
5. フロントエンドを再デプロイ（「Manual Deploy」→「Deploy latest commit」）

#### 3. 動作確認

1. ニュース記事を開く
2. 「✨ AI要約を生成」ボタンをクリック
3. 「OpenRouter (Direct)」の青色のバッジが表示されれば成功！

**注意**: 
- 環境変数名は`VITE_OPENROUTER_API_KEY`（`VITE_`で始める）
- フロントエンドの環境変数に設定（バックエンドではない）
- 再デプロイ後にブラウザのキャッシュをクリア（Ctrl+Shift+R）

#### 利用可能なモデル（自動フォールバック）

アプリは以下の無料モデルを自動的に試します（2026年9月現在）：

1. `openrouter/free` - 自動ルーター（最も簡単、自動的に最適な無料モデルを選択）
2. `nvidia/nemotron-3.5-lightning:free` - NVIDIA Nemotron 3.5 Lightning
3. `nvidia/nemotron-3-super-120b-a12b:free` - NVIDIA Nemotron 3 Super
4. `thinkingmachines/inkling-small:free` - Thinking Machines Inkling Small
5. `cohere/north-mini-code:free` - Cohere North Mini Code

有料モデルも利用可能：
- `openai/gpt-4o` - GPT-4o
- `anthropic/claude-3.5-sonnet` - Claude 3.5 Sonnet

完全なリストは https://openrouter.ai/models を参照してください。

---

### Gemini APIの設定方法（フォールバック）

OpenRouterが利用できない場合の代替手段です。

#### 1. APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. APIキーをコピー（`AI...`で始まる）

#### 2. Renderでの設定（フロントエンド）

1. Render Dashboardで**フロントエンドサービス**（latest-news-app）の「Environment」を開く
2. 「Add Environment Variable」をクリック
3. 以下を入力：
   - **Key**: `VITE_GEMINI_API_KEY`（`VITE_`で始める）
   - **Value**: コピーしたAPIキー
4. 「Save Changes」をクリック
5. フロントエンドを再デプロイ

#### 3. 動作確認

ニュース記事を開いて「✨ AI要約を生成」ボタンをクリック。
「Gemini (Direct)」の紫色のバッジが表示されれば成功です！

### APIキー未設定の場合

記事の重要な部分を抽出する「抽出型要約」が自動的に使用されます。

### 🔍 Gemini APIのトラブルシューティング

**重要**: 日本はGemini APIの利用可能な地域に含まれています！

#### 1. APIキーが正しく設定されているか確認

ブラウザで以下にアクセス：
```
https://あなたのAPIのURL/health
```

以下のように表示されればOK：
```json
{
  "status": "ok",
  "apiKeys": {
    "gemini": true,
    "geminiKeyPrefix": "AQ.Ab8RN6L..."
  }
}
```

#### 2. Gemini APIが動作するかテスト

ブラウザで以下にアクセス：
```
https://あなたのAPIのURL/api/test-gemini
```

成功した場合：
```json
{
  "status": "ok",
  "message": "Gemini API is working correctly",
  "response": "こんにちは"
}
```

失敗した場合、エラーメッセージを確認してください。

#### 3. よくある問題

**「GEMINI_API_KEY is not set」エラー**
- Render Dashboardで環境変数名が`GEMINI_API_KEY`（大文字・アンダースコア）になっているか確認
- 値にスペースや改行が含まれていないか確認

**「401 Unauthorized」エラー**
- APIキーが無効または期限切れの可能性があります
- [Google AI Studio](https://aistudio.google.com/apikey)で新しいAPIキーを生成してください

**「403 Forbidden」エラー**
- APIキーにGemini APIのアクセス権限がない可能性があります
- Google Cloud ConsoleでGemini APIが有効になっているか確認

**「429 Too Many Requests」エラー**
- 無料プランのレート制限に達しています
- しばらく待ってから再試行してください
