# Skills

## 概要

Skillsは特定のタスクやベストプラクティスをパッケージ化したもの。
トリガー条件に基づいて自動的に適用される。

## 利用可能なSkills

| Skill | トリガー | 用途 |
|-------|---------|------|
| nextjs-patterns | Next.js, React, routing | フロントエンド実装 |
| api-patterns | API, auth, REST | API実装、認証 |
| verification | 実装完了, verify, check | 検証ループ |

## 重要な原則

1. **仕様は記載しない** - 既存コードから調査して判断
2. **検証は必須** - すべての実装は検証ループを回す
3. **調査→実装→検証** - このフローを常に守る

## Skillsの構造

```
skills/
├── nextjs-patterns/
│   └── SKILL.md
├── api-patterns/
│   └── SKILL.md
└── verification/
    └── SKILL.md
```

## 使用方法

Skillsは自動的にトリガーされるが、明示的に呼び出すことも可能:
- `/skills` で一覧表示
- タスク内容に応じて自動適用
