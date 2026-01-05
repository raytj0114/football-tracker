---
name: nextjs-patterns
description: Next.js App Router開発のベストプラクティス。Server Components、データフェッチ、キャッシュ、エラーハンドリング。Next.js実装時に使用。
---

# Next.js App Router パターン

## 概要

Next.js 16+ App Routerでのモダンなフルスタック開発パターン。

## ファイル規約

| ファイル        | 用途                       |
| --------------- | -------------------------- |
| `page.tsx`      | ルートUI                   |
| `layout.tsx`    | 共有レイアウト             |
| `loading.tsx`   | ローディングUI（Suspense） |
| `error.tsx`     | エラーUI（Error Boundary） |
| `not-found.tsx` | 404ページ                  |
| `route.ts`      | API Route Handler          |

## データフェッチ

Server Componentで直接fetchを使用。キャッシュ戦略を適切に設定。

```typescript
// 再検証（推奨）
fetch(url, { next: { revalidate: 60 } });

// 静的
fetch(url, { cache: 'force-cache' });

// 動的
fetch(url, { cache: 'no-store' });
```

## 実装時の指針

1. **Server優先**: デフォルトはServer Component
2. **'use client'**: インタラクションが必要な場合のみ
3. **データフェッチ**: Server Componentで行い、propsで渡す
4. **エラー処理**: error.tsx と loading.tsx を各ルートに配置

詳細なコード例は `examples.md` を参照。
Server Actions や Route Handler の例は `patterns.md` を参照。
