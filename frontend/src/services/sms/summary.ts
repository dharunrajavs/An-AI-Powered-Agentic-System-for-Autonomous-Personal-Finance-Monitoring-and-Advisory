import type { ParsedSmsTransaction, MonthlySummary, SmsTrackingCategory } from '../../types';

export function calculateMonthlySummary(transactions: ParsedSmsTransaction[]): MonthlySummary {
  const debits = transactions.filter((t) => t.type === 'debit');
  const credits = transactions.filter((t) => t.type === 'credit');
  const totalIncome = credits.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = debits.reduce((s, t) => s + t.amount, 0);

  const categorySpending = {} as Record<SmsTrackingCategory, number>;
  (['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Healthcare', 'Others'] as SmsTrackingCategory[]).forEach(
    (cat) => {
      categorySpending[cat] = debits
        .filter((t) => t.category === cat)
        .reduce((s, t) => s + t.amount, 0);
    },
  );

  const budgetScore = Math.max(0, Math.min(100, Math.round(100 - (totalExpenses / (totalIncome || 1)) * 50)));

  const suggestions: string[] = [];
  const topCat = (Object.entries(categorySpending) as [SmsTrackingCategory, number][])
    .sort((a, b) => b[1] - a[1])[0];

  if (topCat && topCat[1] > 0) {
    suggestions.push(`You spent ₹${topCat[1].toLocaleString('en-IN')} on ${topCat[0]} this month — consider reducing by 20% to save ₹${Math.round(topCat[1] * 0.2).toLocaleString('en-IN')}.`);
  }

  const highCategories = (Object.entries(categorySpending) as [SmsTrackingCategory, number][])
    .filter(([, v]) => v > 5000);
  if (highCategories.length > 0) {
    suggestions.push(`${highCategories.map(([c]) => c).join(', ')} expenses are significant this month. Try a 30-day waitlist for non-essential purchases.`);
  }

  if (totalIncome > 0) {
    const savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);
    if (savingsRate < 20) {
      suggestions.push(`Your savings rate is ${savingsRate}%. Setting up an auto-sweep to a savings account could earn you ~4.5% on your idle balance.`);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('Great job managing your finances this month! Keep it up.');
  }

  suggestions.push('Switch to annual billing for subscriptions to save 15-20%.');
  suggestions.push('Review your recurring payments — you might be paying for unused services.');

  return {
    totalIncome,
    totalExpenses,
    remainingBalance: totalIncome - totalExpenses,
    categorySpending,
    budgetScore,
    savingsSuggestions: suggestions,
    recentTransactions: transactions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
  };
}
