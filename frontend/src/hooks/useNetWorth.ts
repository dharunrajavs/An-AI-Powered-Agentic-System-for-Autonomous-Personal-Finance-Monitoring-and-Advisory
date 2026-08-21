import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { Transaction } from '../types';
import { computeNetWorthTimeline, currentNetWorth } from '../utils/netWorth';

export function useNetWorth() {
  const { data: transactions = [], isLoading, isError } = useTransactions();

  const timeline = useMemo(() => computeNetWorthTimeline(transactions as Transaction[]), [transactions]);
  const current = useMemo(() => currentNetWorth(transactions as Transaction[]), [transactions]);

  return {
    timeline,
    current,
    change: timeline.length >= 2
      ? timeline[timeline.length - 1].netWorth - timeline[0].netWorth
      : 0,
    isLoading,
    isError,
  };
}
