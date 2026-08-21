import { useEffect, useMemo, useRef } from 'react';
import { useBudgets } from './useBudgets';
import { useTransactions } from './useTransactions';
import { useSpendingAlertStore, SpendingAlert } from '../store/spendingAlertStore';

export function useSpendingAlerts() {
  const { data: budgets = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();
  const { alerts, setAlerts, dismissAlert } = useSpendingAlertStore();

  const activeAlerts = useMemo(
    () => alerts.filter((a) => !a.dismissed).sort((a, b) => b.percentage - a.percentage),
    [alerts],
  );

  const prevAlertsRef = useRef<string>('');

  useEffect(() => {
    if (!budgets.length || !transactions.length) {
      setAlerts([]);
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spentByCategory: Record<string, number> = {};
    for (const t of transactions) {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.amount < 0) {
        const cat = t.category || 'Other';
        spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(t.amount);
      }
    }

    const currentAlerts = useSpendingAlertStore.getState().alerts;
    const newAlerts: SpendingAlert[] = [];

    for (const budget of budgets) {
      const spent = spentByCategory[budget.category] ?? 0;
      if (spent <= 0 || budget.limit <= 0 || spent <= budget.limit) continue;

      const existing = currentAlerts.find((a) => a.category === budget.category);
      newAlerts.push({
        id: `alert_${budget.category}`,
        category: budget.category,
        spent,
        limit: budget.limit,
        percentage: Math.round((spent / budget.limit) * 100),
        threshold: 100,
        dismissed: existing?.dismissed ?? false,
        createdAt: existing?.createdAt ?? now.toISOString(),
      });
    }

    const newAlertsKey = JSON.stringify(newAlerts.map(a => ({ c: a.category, s: a.spent, l: a.limit, p: a.percentage, d: a.dismissed })));
    if (newAlertsKey !== prevAlertsRef.current) {
      prevAlertsRef.current = newAlertsKey;
      setAlerts(newAlerts);
    }
  }, [budgets, transactions, setAlerts]);

  return {
    alerts: activeAlerts,
    count: activeAlerts.length,
    criticalAlerts: activeAlerts.filter((a) => a.percentage >= 90),
    dismissAlert,
  };
}