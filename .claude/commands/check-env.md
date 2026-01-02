環境変数とAPIキーの設定状況を確認する。

## 確認項目

### 必須環境変数
1. `FOOTBALL_DATA_API_KEY` - Football API
2. `NEXTAUTH_SECRET` - セッション暗号化
3. `NEXTAUTH_URL` - コールバックURL
4. `DATABASE_URL` - データベース接続

### OAuth（任意）
5. `GOOGLE_CLIENT_ID`
6. `GOOGLE_CLIENT_SECRET`
7. `GITHUB_CLIENT_ID`
8. `GITHUB_CLIENT_SECRET`

## チェック方法

`.env.local` ファイルが存在するか確認し、各環境変数が設定されているかチェックする。

**注意**: APIキーの値は絶対に表示しない。

## セキュリティ注意
- APIキーの値は絶対に表示しない
- `.env.local` は `.gitignore` に含まれているか確認

$ARGUMENTS
