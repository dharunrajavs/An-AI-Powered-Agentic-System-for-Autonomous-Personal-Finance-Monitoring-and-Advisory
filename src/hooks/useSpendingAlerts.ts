import { useEffect, useMemo } from 'react';
import { useBudgets } from './useBudgets';
import { useTransactions } from './useTransactions';
import { useSpendingAlertStore, SpendingAlert } from '../store/spendingAlertStore';

const THRESHOLDS = [50, 75, 90, 100] as const;

export function useSpendingAlerts() {
  const { data: budgets = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();
  const { alerts, setAlerts, dismissAlert } = useSpendingAlertStore();

  const activeAlerts = useMemo(
    () => alerts.filter((a) => !a.dismissed).sort((a, b) => b.percentage - a.percentage),
    [alerts],
  );

  useEffect(() => {
    if (!budgets.length || !transactions.length) return;

    const newAlerts: SpendingAlert[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTxns = transactions.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const spentByCategory: Record<string, number> = {};
    for (const t of monthTxns) {
      if (t.amount < 0) {
        const cat = t.category || 'Other';
        spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(t.amount);
      }
    }

    for (const budget of budgets) {
      const spent = budget.spent ?? spentByCategory[budget.category] ?? 0;
      const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

      for (const threshold of THRESHOLDS) {
        if (percentage >= threshold) {
          const existing = alerts.find(
            (a) => a.category === budget.category && a.threshold === threshold,
          );
          if (!existing) {
            newAlerts.push({
              id: `alert_${budget.category}_${threshold}`,
              category: budget.category,
              spent,
              limit: budget.limit,
              percentage,
              threshold,
              dismissed: false,
              createdAt: now.toISOString(),
            });
          }
        }
      }
    }

    if (newAlerts.length > 0) {
      setAlerts([...alerts, ...newAlerts]);
    }
  }, [budgets, transactions]);

  return {
    alerts: activeAlerts,
    count: activeAlerts.length,
    criticalAlerts: activeAlerts.filter((a) => a.percentage >= 90),
    dismissAlert,
  };
}
