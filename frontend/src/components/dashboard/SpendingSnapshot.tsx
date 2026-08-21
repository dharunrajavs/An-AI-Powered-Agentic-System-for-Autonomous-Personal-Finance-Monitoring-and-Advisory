import React from 'react';
import { Text, View } from 'react-native';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils';
import { Card } from '../ui';
import { DonutChart } from '../ui/charts';

interface SpendingSnapshotProps {
  budgets: Budget[];
}

export function SpendingSnapshot({ budgets }: SpendingSnapshotProps) {
  const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const limit = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const remaining = Math.max(limit - spent, 0);
  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  return (
    <Card className="flex-row items-center gap-4">
      <DonutChart
        size={64}
        strokeWidth={9}
        centerValue={`${percent}%`}
        data={[
          { label: 'Spent', value: spent, color: '#005c55' },
          { label: 'Remaining', value: remaining, color: '#dae2fd' },
        ]}
      />
      <View className="flex-1 gap-1.5">
        <Text className="text-on-surface-variant font-body text-xs uppercase tracking-wide">This month's spend</Text>
        <Text className="text-on-surface font-body text-sm leading-5">
          <Text className="font-mono-semibold text-on-surface">{formatCurrency(spent)}</Text>
          <Text className="font-body text-on-surface"> of </Text>
          <Text className="font-mono-semibold text-on-surface">{formatCurrency(limit)}</Text>
          <Text className="font-body text-on-surface"> spent</Text>
        </Text>
      </View>
    </Card>
  );
}
