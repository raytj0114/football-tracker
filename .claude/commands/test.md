テストを実行する。引数でテストの種類を指定可能。

## 使用方法
- `/test` - 全テスト実行
- `/test unit` - ユニットテストのみ
- `/test e2e` - E2Eテストのみ
- `/test coverage` - カバレッジ付きテスト

## テスト種別

### ユニットテスト
`npm run test`

### カバレッジ付き
`npm run test:coverage`

### E2Eテスト
`npm run test:e2e`

### 監視モード
`npm run test -- --watch`

## 引数
$ARGUMENTS

引数に応じて適切なテストコマンドを実行してください。
