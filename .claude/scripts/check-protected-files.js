#!/usr/bin/env node
/**
 * 保護されたファイルへの編集をブロックするスクリプト
 * Claude Code の PreToolUse hook で使用
 * 
 * 終了コード:
 *   0 = 許可
 *   2 = ブロック（保護ファイル）
 */

const protectedPatterns = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'secrets',
  '.git/config',
];

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data?.tool_input?.file_path || '';
    
    const isProtected = protectedPatterns.some((pattern) => 
      filePath.includes(pattern)
    );
    
    if (isProtected) {
      console.error(`Blocked: ${filePath} is a protected file`);
      process.exit(2);
    }
    
    process.exit(0);
  } catch (err) {
    // JSONパースエラーは許可（安全側に倒す）
    process.exit(0);
  }
});
