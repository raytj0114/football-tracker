import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDate(date: string | Date): string {
  const targetDate = new Date(date);
  const today = new Date();

  // 日付部分のみを比較するため、時刻をリセット
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffDays = Math.round((targetDay.getTime() - todayDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '明日';
  if (diffDays === -1) return '昨日';

  return formatDate(date);
}

export function formatRelativeDateWithWeekday(date: string | Date): string {
  const relative = formatRelativeDate(date);

  // 「今日」「明日」「昨日」の場合はそのまま返す
  if (relative === '今日' || relative === '明日' || relative === '昨日') {
    return relative;
  }

  // それ以外は曜日を追加
  const weekday = new Date(date).toLocaleDateString('ja-JP', { weekday: 'short' });
  return `${relative}（${weekday}）`;
}
