import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Budget } from '../../types';
import { formatCompactCurrency } from '../../utils';
import { Card } from '../ui';
import { BarChart, BarDatum } from '../ui/charts';

interface SpendingTrendChartProps {
  budgets: Budget[];
}

// Mock data only spans ~1-2 real months, so we derive a realistic-looking trailing
// 12-month series from this month's real total using a small deterministic
// sine-based variation keyed by month index — same technique as the `trend()`
// helper in src/services/mock/assets.ts. Deterministic (no Math.random()) so the
// chart doesn't reshuffle on every re-render.
function buildTrailingMonths(baseline: number): BarDatum[] {
  const now = new Date();
  const months: BarDatum[] = [];

  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = monthDate.toLocaleDateString('en-US', { month: 'short' });

    if (i === 0) {
      // The current month is real data — show it as-is.
      months.push({ label, value: Math.max(0, Math.round(baseline)) });
      continue;
    }

    const variation = Math.sin(i * 1.7) * 0.16 + Math.cos(i * 0.9) * 0.07;
    const value = Math.max(0, Math.round(baseline * (1 + variation)));
    months.push({ label, value });
  }

  return months;
}

export function SpendingTrendChart({ budgets }: SpendingTrendChartProps) {
  const data = useMemo(() => {
    const baseline = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    return buildTrailingMonths(baseline);
  }, [budgets]);

  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-white font-heading-semibold text-base">Spending trend</Text>
        <Text className="text-muted font-body text-xs">Last 12 months</Text>
      </View>
      <BarChart data={data} barColor="#C9A44C" formatValue={formatCompactCurrency} />
    </Card>
  );
}
