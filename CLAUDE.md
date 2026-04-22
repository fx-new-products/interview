# interview — 面談管理ツール

## Overview

インターン候補者の面談を管理するツール。Googleカレンダーから `[recruit]` タグ付きの面談予定を取り込み、面談時のインタビューシート（質問集 + スコア入力）を提供し、PDF出力できる。

社内のみで利用する管理ツールのため、候補者名（フルネーム）をそのまま DB に保存する。併せてイニシャル（例：`I.Y.`）と SHA-256 ハッシュも保持し、PDF 出力時に名前表記 / イニシャル表記を選べる。人事からの「イニシャルだと誰か分かりにくい／誤変換があり使いにくい」というフィードバックを受けた運用判断。

## Tech Stack

- Framework: Nuxt 3.21 (compatibility v4)
- UI: Tailwind CSS（shadcn/ui は使わず、提示された HTML ベースの独自CSS）
- DB: SQLite + drizzle-orm + better-sqlite3
- Auth: oauth2-proxy の `X-User` / `X-Email` ヘッダ（test-manager と同パターン）
- Calendar: `googleapis` + OAuth2 リフレッシュトークン方式

## Directory Structure

```
interview/
├── app/
│   ├── app.vue
│   ├── assets/css/main.css
│   ├── layouts/default.vue
│   ├── pages/
│   │   ├── index.vue          # 面談一覧
│   │   └── [id].vue           # チートシート（スコア入力 + PDF出力）
│   └── components/
│       └── ScoreRadio.vue     # 1-4段階スコア入力
├── server/
│   ├── api/
│   │   ├── me.get.ts
│   │   ├── questions.get.ts
│   │   └── interviews/
│   │       ├── index.get.ts / index.post.ts
│   │       ├── [id].get.ts / .patch.ts / .delete.ts
│   │       ├── [id]/scores/[questionKey].put.ts  # 個別スコア upsert
│   │       └── sync-calendar.post.ts             # カレンダー取込
│   ├── constants/questions.ts  # 7カテゴリ / ~20問の定義
│   ├── database/
│   │   ├── schema.ts
│   │   └── migrations/
│   ├── middleware/auth.ts
│   ├── plugins/migrate.ts      # 起動時に自動migrate
│   └── utils/
│       ├── db.ts
│       ├── initials.ts         # 氏名→イニシャル変換（kuroshiro）
│       ├── event-parser.ts     # カレンダータイトル解析
│       └── google-calendar.ts
└── data/interview.db           # SQLite
```

## Environment Variables & Secrets

- `.env.local` に以下を設定（`.env.example` 参照）：
  - `BASE_URL` — 本番: `/interview/`、ローカル単独: `/` でも可
  - `NUXT_GOOGLE_CLIENT_ID` / `NUXT_GOOGLE_CLIENT_SECRET` / `NUXT_GOOGLE_REFRESH_TOKEN` — **`~/work/ai-degico/.env` の同名キーをそのままコピー**して使う（freedom.co.jp の共有トークン。新規取得不要）
  - `NUXT_CALENDAR_ID` — **`k.uesawa@freedom.co.jp`**（上澤さんのカレンダーに `[recruit]` 予定が入る運用のため、`primary` ではなくメールアドレス直指定。ai-degico のトークン所有アカウントに上澤さんのカレンダーが共有済みである前提）

AI キー等は Portal 経由ではなく、ここは ai-degico 踏襲で .env 直配置。

## Database & Migrations

- DB: `data/interview.db`（SQLite + WAL）
- ORM: drizzle-orm
- 起動時に `server/plugins/migrate.ts` が自動で `migrate()` を実行するので手動実行は不要。
- スキーマ変更時：

  ```bash
  # 1. server/database/schema.ts を編集
  # 2. マイグレーションファイル生成
  npx drizzle-kit generate
  # 3. 次回起動時に自動適用
  ```

### 主要テーブル

- `interviews` — 1面談 = 1行。候補者名（フルネーム, `candidate_name`）、イニシャル（`candidate_initials`）、SHA-256ハッシュ（`candidate_hash`）を保持。
- `interview_scores` — (interviewId, questionKey) ユニーク。1問題 = 1行。

## Branch Strategy & Deployment

- ブランチ: `main` のみ（POC 段階）
- デプロイ: Unified Platform EC2 (54.95.105.90) で systemd 管理、`git pull && systemctl restart interview`
- ポート: **3119**（3100-3118 は既存アプリ使用中）
- 本番 URL: `https://54.95.105.90.nip.io/interview/`

## External Service Integrations

### Google Calendar

- タイトル規約: `{候補者名}様｜{段階}＠{場所}[recruit]（{ポジション}）`
  - 例: `井伊勇斗様｜一次面接＠web[recruit]（FX_生成AI活用インターン）`
- 正規表現: [server/utils/event-parser.ts](server/utils/event-parser.ts)
- `[recruit]` タグを含まないイベントは全てスキップ
- 取込範囲: 過去7日〜未来30日（`sync-calendar.post.ts` で調整可能）

### 候補者名 → イニシャル変換

- ライブラリ: `kuroshiro` + `kuroshiro-analyzer-kuromoji`
- 仕様: [server/utils/initials.ts](server/utils/initials.ts)
  - ASCII名: スペース区切り先頭文字（`Taro Yamada` → `T.Y.`）
  - 漢字名: 2+残り文字に分割して姓名扱い（`山田太郎` → `Y.T.`）
  - 失敗時はハッシュ先頭6文字で代替
- kuroshiro は CJS のため `nitro.externals.external` に登録済み（nuxt.config.ts）

## Testing

```bash
npm run test         # vitest (event-parser のユニットテスト)
```

## Documentation Rules

- 本プロジェクト関連ドキュメント: `docs/new-products/interview/` に置く（現在このディレクトリは未作成、初回ドキュメント作成時に `~/work/docs/new-products/` 配下へ）。

## .gitignore Rules

- `data/*.db*` — SQLite ファイルは絶対コミットしない（候補者ハッシュが含まれる）
- `.env*.local` — OAuth シークレット漏洩防止

## Prohibited Actions

- 候補者名は DB には保存するが、**ログ・標準出力には書き出さない**（sync 等の `console.log`/`console.error` で候補者名を出さない）。
- 本ツールは社内管理限定。オンライン公開・社外共有用途に流用する場合は、候補者名の取り扱い方針を再検討すること。
- Google OAuth リフレッシュトークンを .env 以外（コード、コミット、ログ）に書かない。
- `interview_scores` テーブルへの手動 INSERT/UPDATE は避け、必ず API 経由で更新する（updated_at 管理のため）。

## Coding Guidelines

- Vue SFC は `<template>` → `<script setup lang="ts">` → `<style>` 順。
- スコア入力は 1〜4 のみ許可（サーバ側でバリデーション）。
- チートシート UI は提示HTMLの見た目を維持。`@media print` CSS を壊さないよう注意。
- 自動保存は 1.2秒 debounce。`saveStatus` で UI フィードバック表示。

## Implementation Plan

### v1（実装済み）

- [x] 面談一覧ページ + カレンダー取込ボタン
- [x] チートシート入力（全質問スコア + メモ自動保存）
- [x] 総合評価 + 合否判定
- [x] PDF出力（`window.print()`）

### v2（検討中）

- [ ] 面談音声の録音 + 文字起こし（MediaRecorder + Gemini/Whisper）
- [ ] 文字起こしから AI で各質問のスコア下書きを生成
- [ ] 候補者ごとの横断ビュー（1候補 = 複数回面談）

## TODO

- [ ] 本番 EC2 への systemd サービス登録
- [ ] Unified Platform nginx への `location /interview/` 追加
- [ ] Portal ランディングページに「面談管理」タイルを追加
