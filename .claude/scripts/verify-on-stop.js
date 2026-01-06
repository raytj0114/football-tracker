#!/usr/bin/env node
/**
 * セッション終了時に検証を実行するスクリプト
 * Claude Code の Stop hook で使用
 *
 * 検証結果をサマリーとして出力し、問題があれば警告する
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const results = {
  typeCheck: { passed: false, output: '' },
  lint: { passed: false, output: '' },
};

// tsconfig.json が存在する場合のみ型チェック
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  try {
    execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe', shell: true });
    results.typeCheck.passed = true;
    console.log('✓ Type check passed');
  } catch (err) {
    results.typeCheck.passed = false;
    results.typeCheck.output = (err.stdout || err.stderr || '').split('\n').slice(0, 10).join('\n');
    console.log('✗ Type check failed');
    if (results.typeCheck.output) {
      console.log(results.typeCheck.output);
    }
  }
}

// package.json が存在する場合のみリント
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (pkg.scripts && pkg.scripts.lint) {
      execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe', shell: true });
      results.lint.passed = true;
      console.log('✓ Lint passed');
    }
  } catch (err) {
    results.lint.passed = false;
    results.lint.output = (err.stdout || err.stderr || '').split('\n').slice(0, 10).join('\n');
    console.log('✗ Lint failed');
    if (results.lint.output) {
      console.log(results.lint.output);
    }
  }
}

// サマリー
console.log('\n--- Verification Summary ---');
if (!results.typeCheck.passed || !results.lint.passed) {
  console.log('⚠ Some checks failed. Please fix before completing.');
} else {
  console.log('✓ All checks passed');
}

// 検証結果に関わらず終了コード0で終了（フローを止めない）
process.exit(0);
