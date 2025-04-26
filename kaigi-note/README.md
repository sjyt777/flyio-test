# KaigiNote

勉強会の情報を一元管理するためのアプリケーション。

## 機能

- ユーザー認証（メールアドレス＋パスワード）
- 勉強会（イベント）の登録・更新・削除
- 勉強会の詳細画面での参加者登録（支払い金額含む）
- Discordへの通知（新規登録時）

## 技術スタック

### バックエンド

- FastAPI (Python)
- SQLAlchemy (ORM)
- PostgreSQL (データベース)
- JWT認証

### フロントエンド

- React
- React Router
- Axios (HTTP クライアント)
- date-fns (日付操作)

## 開発環境のセットアップ

### 前提条件

- Docker と Docker Compose がインストールされていること

### 手順

1. リポジトリをクローン

```bash
git clone <repository-url>
cd kaigi-note
```

2. 環境変数の設定

`.env` ファイルを編集して必要な環境変数を設定します。

```
# Discord Webhook URL を設定（オプション）
DISCORD_WEBHOOK_URL=your-discord-webhook-url
```

3. Docker Compose でアプリケーションを起動

```bash
docker-compose up -d
```

4. アプリケーションにアクセス

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

## 開発

### バックエンド

バックエンドのコードは `backend` ディレクトリにあります。

```
backend/
├── app/
│   ├── core/       # 設定、DB接続、認証など
│   ├── models/     # SQLAlchemyモデル
│   ├── routers/    # APIエンドポイント
│   ├── schemas/    # Pydanticスキーマ
│   ├── services/   # ビジネスロジック
│   └── main.py     # アプリケーションのエントリーポイント
└── requirements.txt # 依存関係
```

### フロントエンド

フロントエンドのコードは `frontend` ディレクトリにあります。

```
frontend/
├── public/         # 静的ファイル
└── src/
    ├── components/ # 再利用可能なコンポーネント
    ├── pages/      # ページコンポーネント
    ├── services/   # API通信などのサービス
    └── App.js      # メインアプリケーション
```

## API エンドポイント

主要なAPIエンドポイントは以下の通りです：

- 認証
  - `POST /api/auth/register` - ユーザー登録
  - `POST /api/auth/login` - ログイン
  - `POST /api/auth/logout` - ログアウト

- イベント
  - `GET /api/events` - イベント一覧取得
  - `POST /api/events` - イベント作成
  - `GET /api/events/{id}` - イベント詳細取得
  - `PUT /api/events/{id}` - イベント更新
  - `DELETE /api/events/{id}` - イベント削除

- 参加者
  - `GET /api/events/{event_id}/participants` - 参加者一覧取得
  - `POST /api/events/{event_id}/participants` - 参加者追加
  - `PUT /api/events/{event_id}/participants/{p_id}` - 参加者情報更新
  - `DELETE /api/events/{event_id}/participants/{p_id}` - 参加者削除

詳細なAPIドキュメントは、バックエンドサーバー起動後に http://localhost:8000/docs で確認できます。
