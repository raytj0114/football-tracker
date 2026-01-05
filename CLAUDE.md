# Football App

## プロジェクト概要

サッカー情報を表示するフルスタックWebアプリケーション。
Football-Data.org APIからデータを取得し、試合情報、順位表、チーム情報をユーザーに提供。

## 技術スタック

### フロントエンド

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**:
  - Server: React Query (@tanstack/react-query)
  - Client: Zustand

### バックエンド

- **API**: Next.js Route Handlers
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)

### 外部API

- **Football-Data.org**: https://api.football-data.org/v4/
  - 認証: `X-Auth-Token` ヘッダー
  - レート制限: 10 req/min (無料プラン)

## 主要コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run lint         # ESLint実行
npm run lint:fix     # ESLint自動修正
npm run type-check   # TypeScriptチェック
npm run test         # テスト実行
npm run test:coverage # カバレッジ付きテスト
npm run format       # Prettier実行
npx prisma generate  # Prismaクライアント生成
npx prisma db push   # DBスキーマ同期
npx prisma studio    # Prisma GUI
```

## ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証ページグループ
│   ├── (main)/            # メインページグループ
│   ├── api/               # API Routes
│   └── providers.tsx      # グローバルProviders
├── components/
│   ├── ui/                # 汎用UIコンポーネント
│   ├── features/          # 機能別コンポーネント
│   └── layout/            # レイアウトコンポーネント
├── hooks/                 # カスタムフック
├── lib/
│   ├── football-api/      # Football API クライアント
│   ├── prisma.ts          # Prismaクライアント
│   └── utils.ts           # ユーティリティ
├── stores/                # Zustandストア
└── types/                 # TypeScript型定義

prisma/
└── schema.prisma          # DBスキーマ
```

## コーディング規約

### TypeScript

- `strict: true` 必須
- `any` 禁止、明示的な型定義
- Zodでランタイムバリデーション

### React

- Server Components をデフォルトで使用
- `'use client'` は必要な場合のみ
- Props は interface で定義

### スタイリング

- Tailwind CSS のユーティリティクラス使用
- `cn()` ヘルパーでクラス結合
- コンポーネント固有スタイルは同ファイル内

### API

- 全レスポンスはZodでバリデーション
- エラーは適切なHTTPステータスで返却
- レート制限を考慮したキャッシュ戦略

## 環境変数

```bash
# 必須
FOOTBALL_DATA_API_KEY=    # Football-Data.org APIキー
NEXTAUTH_SECRET=          # セッション暗号化キー
NEXTAUTH_URL=             # アプリのベースURL
DATABASE_URL=             # PostgreSQL接続文字列

# Supabase本番環境用（マイグレーション）
DIRECT_URL=               # 直接接続URL（ポート5432）

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 認証フロー

1. 未認証ユーザー: 公開ページ（試合一覧、順位表）のみアクセス可
2. ログイン: Google OAuth
3. 認証済みユーザー: お気に入りチーム登録、通知設定などが可能

## Football-Data.org API

### 利用可能リーグ（無料プラン）

- `PL` - Premier League
- `BL1` - Bundesliga
- `SA` - Serie A
- `PD` - La Liga
- `FL1` - Ligue 1
- `CL` - Champions League

### 主要エンドポイント

- `GET /v4/competitions/{code}/matches` - 試合一覧
- `GET /v4/competitions/{code}/standings` - 順位表
- `GET /v4/teams/{id}` - チーム詳細

## CI/CD

- **CI**: GitHub Actions (lint, type-check, test, build)
- **Deploy**: Vercel Git Integration（mainプッシュで自動デプロイ）
- **DB**: Supabase PostgreSQL（本番環境）

## トラブルシューティング

### APIレート制限エラー (429)

- 60秒待機してリトライ
- キャッシュ戦略を見直す

### 認証エラー

- `NEXTAUTH_SECRET` が設定されているか確認
- OAuth コールバックURLが正しいか確認

### DB接続エラー

- `DATABASE_URL` の形式確認
- Prismaクライアント再生成: `npx prisma generate`
