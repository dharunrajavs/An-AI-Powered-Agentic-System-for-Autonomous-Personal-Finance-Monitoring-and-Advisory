import React from 'react';
import { Text, View } from 'react-native';
import { Budget } from '../../types';
import { formatCompactCurrency } from '../../utils';
import { Card } from '../ui';
import { DonutChart, DonutLegend, DonutSegment } from '../ui/charts';

// Fixed palette tuned to sit alongside the vault aesthetic's gold/positive/alert tones.
const PALETTE = ['#C9A44C', '#3FA96A', '#D9564B', '#7C8797', '#4C7A9B', '#8B7CF6', '#5FA8D3'];

interface CategoryBreakdownChartProps {
  budgets: Budget[];
}

export function CategoryBreakdownChart({ budgets }: CategoryBreakdownChartProps) {
  if (budgets.length === 0) return null;

  const segments: DonutSegment[] = budgets.map((budget, i) => ({
    label: budget.category,
    value: budget.spent,
    color: PALETTE[i % PALETTE.length],
  }));

  const total = budgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <Card className="gap-4">
      <Text className="text-white font-heading-semibold text-base">Spending by category</Text>
      <View className="flex-row items-center gap-6">
        <DonutChart data={segments} centerValue={formatCompactCurrency(total)} centerLabel="Spent" />
        <View className="flex-1">
          <DonutLegend data={segments} />
        </View>
      </View>
    </Card>
  );
}
