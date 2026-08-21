import type { Transaction } from '../types';
import { formatCurrency } from './formatCurrency';

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function generateSavingsSuggestions(transactions: Transaction[]): string[] {
  const monthKey = currentMonthKey();
  const monthTxns = transactions.filter((t) => t.date?.startsWith(monthKey));
  const expenses = monthTxns.filter((t) => t.amount < 0);
  const income = monthTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const byCategory = new Map<string, number>();
  let totalSpent = 0;
  for (const t of expenses) {
    const cat = t.category || 'Other';
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + Math.abs(t.amount));
    totalSpent += Math.abs(t.amount);
  }

  const suggestions: string[] = [];

  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] > 0) {
    const savings = Math.round(top[1] * 0.2);
    suggestions.push(
      `You spent ${formatCurrency(top[1])} on ${top[0]} this month — consider reducing by 20% to save ${formatCurrency(savings)}.`,
    );
  }

  const avgPerCat = byCategory.size > 0 ? totalSpent / byCategory.size : 0;
  const outliers = [...byCategory.entries()]
    .filter(([, v]) => avgPerCat > 0 && v > avgPerCat * 2 && v > 0)
    .sort((a, b) => b[1] - a[1]);
  if (outliers.length > 0) {
    suggestions.push(
      `${outliers.map(([c]) => c).join(', ')} is spending ${Math.round(
        (outliers[0][1] / avgPerCat) * 100,
      )}% above your per-category average — try a 30-day waitlist for non-essential purchases.`,
    );
  }

  const flagged = transactions.filter((t) => t.flagged);
  if (flagged.length > 0) {
    const f = flagged[0];
    suggestions.push(
      `Unusual ${formatCurrency(Math.abs(f.amount))} charge at ${f.merchant} was flagged — review it to avoid surprises.`,
    );
  }

  const largest = [...expenses].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
  if (largest && Math.abs(largest.amount) >= 500) {
    suggestions.push(
      `${formatCurrency(Math.abs(largest.amount))} at ${largest.merchant} is your biggest expense this month — see if it can be reduced or postponed.`,
    );
  }

  const subscriptions = byCategory.get('Subscriptions');
  if (subscriptions && subscriptions > 0) {
    suggestions.push(
      `You're paying ${formatCurrency(subscriptions)} for subscriptions this month — annual billing could save 15–20%.`,
    );
  }

  if (income > 0) {
    const savingsRate = Math.round(((income - totalSpent) / income) * 100);
    if (savingsRate < 20) {
      suggestions.push(
        `Your savings rate is ${savingsRate}% — an auto-sweep to a savings account could earn ~4.5% on your idle balance.`,
      );
    }
  }

  if (suggestions.length === 0) {
    if (expenses.length === 0 && income > 0) {
      suggestions.push(
        `You earned ${formatCurrency(income)} with no expenses this month — move the surplus into a savings fund.`,
      );
    } else if (totalSpent > 0 && top) {
      suggestions.push(
        `You've spent ${formatCurrency(totalSpent)} across ${byCategory.size} categories this month — ${top[0]} is your largest at ${formatCurrency(top[1])}.`,
      );
    } else if (transactions.length > 0) {
      suggestions.push('Add a few transactions this month to get personalized savings tips.');
    }
  }

  return suggestions.slice(0, 3);
}