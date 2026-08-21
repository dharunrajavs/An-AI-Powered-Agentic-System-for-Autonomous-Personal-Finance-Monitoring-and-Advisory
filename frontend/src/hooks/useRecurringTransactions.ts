import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { detectRecurring } from '../utils/detectRecurring';
import type { Transaction } from '../types';

export interface RecurringExpenseDetail {
  merchant: string;
  category: string;
  averageAmount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  confidence: number;
  lastDate: string;
  nextDate: string;
  occurrences: number;
  payments: Transaction[];
}

export function useRecurringTransactions() {
  const { data: transactions = [], isLoading, isError } = useTransactions();

  const patterns = useMemo(() => detectRecurring(transactions), [transactions]);

  const recurring = useMemo<RecurringExpenseDetail[]>(
    () =>
      patterns.map((p) => ({
        ...p,
        payments: transactions
          .filter((t) => t.merchant.toLowerCase().trim() === p.merchant.toLowerCase().trim())
          .sort((a, b) => `${b.date} ${b.time ?? ''}`.localeCompare(`${a.date} ${a.time ?? ''}`)),
      })),
    [patterns, transactions],
  );

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