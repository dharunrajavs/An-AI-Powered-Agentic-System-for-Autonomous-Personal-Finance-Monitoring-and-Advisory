import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { detectRecurring } from '../utils/detectRecurring';

export function useRecurringTransactions() {
  const { data: transactions = [], isLoading, isError } = useTransactions();

  const recurring = useMemo(() => detectRecurring(transactions), [transactions]);
  const upcoming = useMemo(
    () =>
      recurring
        .filter((r) => new Date(r.nextDate) >= new Date())
        .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()),
    [recurring],
  );

  return {
    recurring,
    upcoming,
    totalMonthly: recurring
      .filter((r) => r.frequency === 'monthly')
      .reduce((s, r) => s + r.averageAmount, 0),
    isLoading,
    isError,
  };
}
