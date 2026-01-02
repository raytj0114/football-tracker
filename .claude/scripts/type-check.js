#!/usr/bin/env node
/**
 * TypeScript型チェックを実行するスクリプト
 * Claude Code の Stop hook で使用
 * 
 * tsconfig.json が存在する場合のみ実行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

if (!fs.existsSync(tsconfigPath)) {
  // tsconfig.json がなければスキップ
  process.exit(0);
}

try {
  const result = execSync('npx tsc --noEmit', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
  });
  
  if (result) {
    // 最初の20行のみ表示
    const lines = result.split('\n').slice(0, 20);
    console.log(lines.join('\n'));
  }
} catch (err) {
  // tscがエラーを返した場合（型エラーがある場合）
  if (err.stdout) {
    const lines = err.stdout.split('\n').slice(0, 20);
    console.log(lines.join('\n'));
  }
  if (err.stderr) {
    const lines = err.stderr.split('\n').slice(0, 20);
    console.error(lines.join('\n'));
  }
}

// 型チェックの結果に関わらず終了コード0で終了
// （hooksがビルドを止めないように）
process.exit(0);
