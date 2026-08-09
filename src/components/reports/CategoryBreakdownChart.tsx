import React from 'react';
import { Text, View } from 'react-native';
import { Transaction } from '../../types';
import { formatCompactCurrency } from '../../utils';
import { Card } from '../ui';
import { DonutChart, DonutLegend, DonutSegment } from '../ui/charts';

// Fixed palette tuned to sit alongside the vault aesthetic's gold/positive/alert tones.
const PALETTE = ['#C9A44C', '#3FA96A', '#D9564B', '#7C8797', '#4C7A9B', '#8B7CF6', '#5FA8D3'];

interface CategoryBreakdownChartProps {
  transactions: Transaction[];
}

// Annual-report variant of the category donut, combining UPI and Cash spending.
// The mock data doesn't have real annual granularity, so this is labeled
// honestly as "this period" rather than implying a full year of history.
export function CategoryBreakdownChart({ transactions }: CategoryBreakdownChartProps) {
  const totalsByCategory = new Map<string, number>();
  transactions
    .filter((t) => t.amount < 0)
    .forEach((t) => totalsByCategory.set(t.category, (totalsByCategory.get(t.category) ?? 0) + Math.abs(t.amount)));

  const categories = [...totalsByCategory.entries()].sort((a, b) => b[1] - a[1]);
  if (categories.length === 0) return null;

  const segments: DonutSegment[] = categories.map(([category, value], i) => ({
    label: category,
    value,
    color: PALETTE[i % PALETTE.length],
  }));

  const total = categories.reduce((sum, [, value]) => sum + value, 0);

  return (
    <Card className="gap-4">
      <Text className="text-white font-heading-semibold text-base">Category breakdown — this period</Text>
      <View className="flex-row items-center gap-6">
        <DonutChart data={segments} centerValue={formatCompactCurrency(total)} centerLabel="Spent" />
        <View className="flex-1">
          <DonutLegend data={segments} />
        </View>
      </View>
      <Text className="text-muted font-body text-xs">Based on this month's activity</Text>
    </Card>
  );
}
