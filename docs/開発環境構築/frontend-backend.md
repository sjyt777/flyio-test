# 前提条件

- Windows 10/11 + WSL2 を利用、または macOS/Linux 環境など、Docker がインストールされている環境。  
- **Docker Desktop** もしくは **Docker Engine** が動作し、`docker compose` コマンドが使用できる。

---

# 1. ディレクトリ構成の用意

最終的に下記のようなフォルダ構成を想定します。  
（あくまで一例ですので、プロジェクトに合わせて調整可能）

```
my-project/
├── docker-compose.yml
├── .env (任意)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   └── ... (FastAPI関連ソース)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json (自動生成)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── reportWebVitals.ts
│   │   └── ...
│   └── ... (React関連ソース)
```

---

# 2. バックエンド：FastAPI のセットアップ

1. **requirements.txt** (FastAPI + ORM + DBドライバ等)

   ```txt
   fastapi==0.95.0
   uvicorn[standard]==0.21.1
   SQLAlchemy==2.0.9
   psycopg2-binary==2.9.6
   alembic==1.10.3
   python-dotenv==1.0.0
   pyjwt==2.6.0
   passlib[bcrypt]==1.7.4
   ```

2. **main.py** (最小限のFastAPI起動例)

   ```python
   from fastapi import FastAPI

   app = FastAPI()

   @app.get("/")
   def read_root():
       return {"message": "Hello, FastAPI!"}
   ```

3. **backend/Dockerfile**

   ```dockerfile
   # backend/Dockerfile
   FROM python:3.10-slim

   WORKDIR /usr/src/app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . /usr/src/app

   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

---

# 3. フロントエンド：React のセットアップ

1. **最初にローカル or コンテナで Create React App**  
   - 例: プロジェクトルートの `frontend` ディレクトリに移動して、  
     ```bash
     # (ホストにNode.jsがある場合)
     npx create-react-app . --template typescript
     ```
   - **ホストにNode.jsを入れたくない場合**、以下のように一時コンテナで生成し、結果を `frontend` に落とす。  
     ```bash
     docker run --rm -v $(pwd)/frontend:/usr/src/app -w /usr/src/app node:18-alpine \
       npx create-react-app . --template typescript
     ```

2. **package.json** / **public/index.html** / **src/App.tsx** などが生成される

   - 典型的な `create-react-app` 構成（`public/`, `src/`, `node_modules/` etc.）が揃います。

3. **frontend/Dockerfile**

   ```dockerfile
   # frontend/Dockerfile
   FROM node:18-alpine

   WORKDIR /usr/src/app

   # 依存パッケージのインストール
   COPY package*.json ./
   RUN npm install

   # ソースコードをコピー
   COPY . /usr/src/app

   # 開発用: npm start で起動
   CMD ["npm", "start"]
   ```

---

# 4. docker-compose.yml

プロジェクトルート (`my-project/`) に配置します。  
以下では **PostgreSQL** も含む3サービスを起動するサンプルです。

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: fastapi_app
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/usr/src/app
    env_file:
      - .env
    depends_on:
      - db

  db:
    image: postgres:15
    container_name: postgres_db
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypass
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  frontend:
    build: ./frontend
    container_name: react_app
    ports:
      - "3000:3000"
    # 以下はnode_modulesをホスト側と分けるための例
    # srcとpublicだけマウントしてホットリロードを行う
    volumes:
      - ./frontend/src:/usr/src/app/src
      - ./frontend/public:/usr/src/app/public
    env_file:
      - .env
    depends_on:
      - backend

volumes:
  db_data:
```

### ポイント

1. **backend**  
   - `/usr/src/app` にソースをCOPYし、`uvicorn` で起動  
   - `volumes: ./backend:/usr/src/app` を記載すると、ホスト上のコード変更が即時反映  
   - Pythonライブラリはコンテナビルド時にインストールされる

2. **db**  
   - `postgres:15` でポート5432公開  
   - `db_data` ボリュームにデータを永続化  
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` を `.env` ファイルで設定する場合は env_file を調整

3. **frontend**  
   - ソースを Dockerfile でビルド → `npm start` でポート3000公開  
   - `volumes: - ./frontend/src:/usr/src/app/src` など部分マウントすることで **`node_modules` は上書きされず**、ソースコードのホットリロードだけ行える  

---

# 5. 起動手順

1. **docker compose build**  
   ```bash
   docker compose build
   ```
   - 初回ビルド時は Dockerfile に従ってイメージを作成。

2. **コンテナ起動**  
   ```bash
   docker compose up -d
   ```
   - `-d` はデタッチモード。コンテナがバックグラウンドで起動。

3. **ログ確認**  
   ```bash
   docker compose logs -f
   ```
   - 全サービスのリアルタイムログを表示。  
   - 特定サービスだけ見る場合: `docker compose logs -f frontend`

4. **ブラウザアクセス**  
   - **バックエンド**: `http://localhost:8000/docs` で FastAPI の Swagger UI 確認  
   - **フロントエンド**: `http://localhost:3000` で React の開発ページ確認

---

# 6. トラブルシューティング

1. **`react-scripts: not found` エラー**  
   - `Dockerfile` 内で `package.json` → `npm install` → `COPY .` の順序が正しいか確認。  
   - ボリュームマウントのせいで `node_modules` が上書き/消去されていないか。  
   - 対処: `volumes:` 設定を外す or ホスト側で `npm install` してからマウントするなど。

2. **`Could not find a required file: index.html in public/`**  
   - `public/index.html` が存在しない（削除/リネーム）  
   - Create React App の初期構成を崩しているためエラー。`public/index.html` を用意する。

3. **`Module not found: Can't resolve './App'` など**  
   - `src/index.tsx` のインポートパスとファイル名が一致していない (`App.tsx` vs `app.tsx`)。  
   - Windows vs Linux で大文字小文字が異なる場合もエラーに。

4. **古いイメージやボリュームが残っている**  
   - `docker compose down -v` でコンテナとボリュームをすべて削除 → `docker compose up --build -d` で再ビルドすると解決することが多い。

5. **PostgreSQL への接続が失敗**  
   - `DATABASE_URL` が不正（例: `postgresql://myuser:mypass@db:5432/mydb`）  
   - FastAPI側の `depends_on` で db を指定していても、初回起動時にDBが起動しきる前に接続しようとするケースがある → リトライロジックを入れるorWait-for-itスクリプトを使うなどの対処。

---

# 7. 運用のポイント

1. **ホットリロード vs 本番ビルド**  
   - 開発中は `npm start` でホットリロード、Python側も `volumes:` でコードマウントしてuvicornの自動リロードを有効にすると便利。  
   - 本番運用ではホットリロード不要なので、`docker-compose.prod.yml` など別ファイルにして最適化ビルド（`npm run build` → Nginxなどで配信）やGunicornなどを採用するのが一般的。

2. **データ永続化**  
   - PostgreSQLの `db_data` ボリュームはローカル環境であれば良いが、本番では AWS RDS など外部DBを使うことも多い。  
   - 開発用データを何度もリセットしたいなら `docker compose down -v` が便利。

3. **CI/CD**  
   - GitHub Actions などで自動ビルド・テスト → デプロイ。  
   - ローカル構成と同じ Dockerfile / docker-compose を使えば、開発環境と本番環境の整合性を保ちやすい。

---

## まとめ

1. **プロジェクト構成**: `docker-compose.yml` で **backend(FastAPI) + frontend(React) + db(PostgreSQL)** を一括管理。  
2. **Dockerfile** でビルド → `npm install` / `pip install` を行い、アプリ起動コマンドを指定。  
3. **ホットリロード** をしたい場合はボリュームマウントを活用。ただし `node_modules` の扱いに注意。  
4. **トラブル時** は `docker compose down -v` → `docker compose up --build -d` でキャッシュやボリュームをリセットして再試行すると解決することが多い。  

これらの手順を踏めば、**Docker Compose** を使った **フロントエンド(React) + バックエンド(FastAPI) + DB(PostgreSQL)** の開発環境をスムーズに構築できます。
