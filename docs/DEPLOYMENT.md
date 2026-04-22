# interview — デプロイ手順（Unified Platform 統合）

## 前提

- EC2: 54.95.105.90 (Unified Platform)
- ポート: **3119**（新規割当）
- ベースURL: `/interview/`

## 1. 初回デプロイ

### EC2 に clone

```bash
ssh ubuntu@54.95.105.90
cd ~  # or /home/ec2-user/ に応じて
git clone <repo-url> interview
cd interview
npm ci --legacy-peer-deps
npm run build
```

### 環境変数ファイル（`/etc/interview.env`）

```
BASE_URL=/interview/
NODE_ENV=production
PORT=3119
# ai-degico の .env から 3つをそのままコピー
NUXT_GOOGLE_CLIENT_ID=...
NUXT_GOOGLE_CLIENT_SECRET=...
NUXT_GOOGLE_REFRESH_TOKEN=...
# 上澤さんのカレンダーから [recruit] を拾う
NUXT_CALENDAR_ID=k.uesawa@freedom.co.jp
```

権限:

```bash
sudo chmod 600 /etc/interview.env
sudo chown ubuntu:ubuntu /etc/interview.env
```

### systemd ユニット（`/etc/systemd/system/interview.service`）

`test-manager.service` をコピーして以下を書き換え：

```ini
[Unit]
Description=Interview (面談管理)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/interview
EnvironmentFile=/etc/interview.env
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

起動:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now interview
sudo systemctl status interview
```

## 2. nginx 設定追加

`~/work/unified-platform/infra/nginx/tools.conf`（EC2上の対応ファイル）に以下 location ブロックを追加。既存の `/test-manager/` ブロックをコピーしてパスとポートだけ書き換える。

```nginx
location /interview/ {
    proxy_pass http://127.0.0.1:3119;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-User $user;
    proxy_set_header X-Email $email;
}
```

適用:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 3. oauth2-proxy

Unified Platform の oauth2-proxy はホスト全体をカバーしている想定。追加設定は不要。
もし path allowlist を使っているなら、そこに `/interview/*` を追加する。

## 4. Portal への追加

`~/work/unified-platform/portal/app/pages/index.vue` 等のランディングページに、既存の他アプリタイルと同じ形式で以下を追加：

- タイトル: 面談管理
- URL: `/interview/`
- 説明: インターン候補者の面談スケジュール管理とチートシート

## 5. Google OAuth リフレッシュトークン

**ai-degico の .env に既に存在するトークンを流用する**。新規取得は不要。

`~/work/ai-degico/.env` から以下3つの値をコピーし、interview の .env.local（またはEC2の `/etc/interview.env`）に貼り付け：

- `GOOGLE_CLIENT_ID` → `NUXT_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` → `NUXT_GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN` → `NUXT_GOOGLE_REFRESH_TOKEN`

カレンダーIDは上澤さんのメール（`k.uesawa@freedom.co.jp`）を指定。ai-degico ではすでに上澤さんのカレンダーを参照する運用があるため、カレンダー共有は済んでいる想定。

### 共有が未設定だった場合

上澤さんに、ai-degico のトークン所有アカウントに対してカレンダーを共有してもらう：

> Google カレンダー → 上澤さんの面談カレンダー設定 → 特定のユーザーと共有
> → ai-degico トークンの所有メールアドレスを追加、権限は「予定の表示（すべての予定の詳細）」

## 6. 動作確認

```bash
# ローカル起動テスト
curl https://54.95.105.90.nip.io/interview/api/me

# カレンダー取込テスト（oauth2-proxy 認証後）
curl -X POST https://54.95.105.90.nip.io/interview/api/interviews/sync-calendar
```

## 7. 日常運用

```bash
# コード更新
cd ~/interview
git pull
npm ci --legacy-peer-deps
npm run build
sudo systemctl restart interview

# ログ確認
sudo journalctl -u interview -f

# DB バックアップ（候補者ハッシュ含むので扱い注意）
cp data/interview.db ~/backups/interview-$(date +%Y%m%d).db
```
