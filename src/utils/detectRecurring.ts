import { Transaction } from '../types';

export interface RecurringPattern {
  merchant: string;
  category: string;
  averageAmount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  confidence: number;
  lastDate: string;
  nextDate: string;
  occurrences: number;
}

function datesToIntervals(dates: string[]): number[] {
  const sorted = dates.map((d) => new Date(d).getTime()).sort((a, b) => a - b);
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(sorted[i] - sorted[i - 1]);
  }
  return intervals;
}

function mostFrequentInterval(intervals: number[]): { interval: number; score: number } {
  if (intervals.length === 0) return { interval: 0, score: 0 };

  const DAY_MS = 86400000;
  const counts: Record<string, number> = {};
  for (const i of intervals) {
    const key = Math.round(i / DAY_MS).toString();
    counts[key] = (counts[key] ?? 0) + 1;
  }

  let bestKey = '0';
  let bestCount = 0;
  for (const [k, c] of Object.entries(counts)) {
    if (c > bestCount) {
      bestCount = c;
      bestKey = k;
    }
  }

  const intervalDays = parseInt(bestKey, 10);
  const score = bestCount / intervals.length;
  return { interval: intervalDays * DAY_MS, score };
}

function classifyFrequency(intervalMs: number): 'weekly' | 'monthly' | 'yearly' {
  const days = intervalMs / 86400000;
  if (days >= 330 && days <= 400) return 'yearly';
  if (days >= 25 && days <= 35) return 'monthly';
  return 'weekly';
}

function amountsSimilar(values: number[], tolerance = 0.3): boolean {
  if (values.length <= 1) return true;
  const avg = values.reduce((s, v) => s + Math.abs(v), 0) / values.length;
  const maxDev = Math.max(...values.map((v) => Math.abs(Math.abs(v) - avg)));
  return maxDev / avg <= tolerance;
}

function estimateNextDate(lastDate: string, intervalMs: number): string {
  const next = new Date(new Date(lastDate).getTime() + intervalMs);
  return next.toISOString().split('T')[0];
}

export function detectRecurring(transactions: Transaction[]): RecurringPattern[] {
  const debits = transactions.filter((t) => t.amount < 0);
  const grouped: Record<string, Transaction[]> = {};

  for (const t of debits) {
    const key = t.merchant.toLowerCase().trim();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }

  const results: RecurringPattern[] = [];

  for (const [merchant, txns] of Object.entries(grouped)) {
    if (txns.length < 2) continue;
    if (!amountsSimilar(txns.map((t) => t.amount))) continue;

    const dates = txns.map((t) => t.date);
    const intervals = datesToIntervals(dates);
    if (intervals.length === 0) continue;

    const { interval, score } = mostFrequentInterval(intervals);
    if (score < 0.5 || interval < 6 * 86400000) continue;

    const avgAmount =
      txns.reduce((s, t) => s + Math.abs(t.amount), 0) / txns.length;
    const sortedDates = dates.sort();
    const lastDate = sortedDates[sortedDates.length - 1];
    const frequency = classifyFrequency(interval);

    results.push({
      merchant: txns[0].merchant,
      category: txns[0].category,
      averageAmount: avgAmount,
      frequency,
      confidence: Math.round(score * 100),
      lastDate,
      nextDate: estimateNextDate(lastDate, interval),
      occurrences: txns.length,
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}
