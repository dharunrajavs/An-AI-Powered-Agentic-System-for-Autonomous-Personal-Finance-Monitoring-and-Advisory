import { Transaction } from '../types';

export interface NetWorthPoint {
  date: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

export function computeNetWorthTimeline(
  transactions: Transaction[],
  interval: 'daily' | 'weekly' | 'monthly' = 'monthly',
): NetWorthPoint[] {
  if (transactions.length === 0) return [];

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const groups: Record<string, Transaction[]> = {};

  for (const t of sorted) {
    const d = new Date(t.date);
    let key: string;
    if (interval === 'daily') {
      key = t.date;
    } else if (interval === 'weekly') {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }

  const sortedKeys = Object.keys(groups).sort();
  const result: NetWorthPoint[] = [];
  let runningAssets = 0;
  let runningLiabilities = 0;

  for (const key of sortedKeys) {
    const txns = groups[key];
    for (const t of txns) {
      if (t.amount >= 0) runningAssets += t.amount;
      else runningLiabilities += Math.abs(t.amount);
    }
    result.push({
      date: key,
      netWorth: runningAssets - runningLiabilities,
      assets: runningAssets,
      liabilities: runningLiabilities,
    });
  }

  return result;
}

export function currentNetWorth(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}
