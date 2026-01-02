#!/usr/bin/env node
/**
 * 編集されたファイルを自動フォーマットするスクリプト
 * Claude Code の PostToolUse hook で使用
 * 
 * 対象:
 *   - .ts, .tsx, .js, .jsx → prettier + eslint
 *   - .css, .scss, .json, .md → prettier のみ
 */

const { execSync } = require('child_process');
const path = require('path');

const codeExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const otherExtensions = ['.css', '.scss', '.json', '.md'];

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path;
    
    if (!filePath) {
      process.exit(0);
    }
    
    const ext = path.extname(filePath).toLowerCase();
    
    // コードファイル: prettier + eslint
    if (codeExtensions.includes(ext)) {
      try {
        execSync(`npx prettier --write "${filePath}"`, { 
          stdio: 'ignore',
          shell: true 
        });
      } catch (e) {
        // prettier失敗は無視
      }
      
      try {
        execSync(`npx eslint --fix "${filePath}"`, { 
          stdio: 'ignore',
          shell: true 
        });
      } catch (e) {
        // eslint失敗は無視
      }
    }
    // その他のファイル: prettier のみ
    else if (otherExtensions.includes(ext)) {
      try {
        execSync(`npx prettier --write "${filePath}"`, { 
          stdio: 'ignore',
          shell: true 
        });
      } catch (e) {
        // prettier失敗は無視
      }
    }
    
    process.exit(0);
  } catch (err) {
    // エラーは無視して終了
    process.exit(0);
  }
});
