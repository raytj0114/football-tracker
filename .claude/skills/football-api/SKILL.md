---
name: football-api
description: Football-Data.org APIとの連携を支援。試合情報、順位表、チーム情報の取得が必要な場合に使用。
---

# Football-Data.org API連携

## 概要

Football-Data.org (v4) を使用したサッカーデータ取得を支援する。

## 基本情報

- **Base URL**: `https://api.football-data.org/v4`
- **認証**: `X-Auth-Token` ヘッダーに `process.env.FOOTBALL_DATA_API_KEY` を設定
- **レート制限**: 無料プランは 10 req/min

## 対応リーグ（無料プラン）

PL, BL1, SA, PD, FL1, CL, EC, WC

## 主要エンドポイント

| 用途 | エンドポイント |
|------|--------------|
| 試合一覧 | `GET /v4/competitions/{code}/matches` |
| 順位表 | `GET /v4/competitions/{code}/standings` |
| チーム一覧 | `GET /v4/competitions/{code}/teams` |
| チーム詳細 | `GET /v4/teams/{id}` |

## 実装時の指針

1. **型安全**: Zodスキーマでレスポンスをバリデーション
2. **キャッシュ**: React Query または Next.js fetch キャッシュを活用
3. **レート制限**: 10 req/min を超えないよう注意
4. **エラー処理**: 429/403/404 を適切にハンドリング

詳細な型定義やコード例が必要な場合は `types.md` を参照。
実装パターンの詳細は `examples.md` を参照。
