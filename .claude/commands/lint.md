コードのLintとフォーマットを実行する。

## 実行内容

### 1. ESLint
`npm run lint` でコードチェック

### 2. Prettier
`npm run format:check` でフォーマットチェック

### 3. 型チェック
`npm run type-check` で型チェック

## 自動修正
問題が見つかった場合、自動修正を試みる：

- `npm run lint:fix` - ESLint自動修正
- `npm run format` - Prettier自動修正

## 引数
$ARGUMENTS

- `fix` - 自動修正を実行
- `check` - チェックのみ（デフォルト）
