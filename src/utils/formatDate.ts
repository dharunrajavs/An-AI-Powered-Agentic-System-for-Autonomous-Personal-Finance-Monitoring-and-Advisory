export function formatDate(iso: string, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = new Date(iso);

  if (style === 'short') {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  }
  if (style === 'long') {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso);
  const diffMinutes = Math.round(diffMs / 60000);
  const abs = Math.abs(diffMinutes);

  if (abs < 1) return 'just now';
  if (abs < 60) return `${abs} min ago`;
  const diffHours = Math.round(abs / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function daysUntil(iso: string): number {
  const target = Date.parse(iso);
  const now = Date.parse(new Date().toISOString());
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
