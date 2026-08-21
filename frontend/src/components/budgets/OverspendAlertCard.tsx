import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils';

interface OverspendAlertCardProps {
  budget: Budget;
}

// Only renders anything when the budget is actually over its limit — the
// screen inserts one of these under any over-budget row.
export function OverspendAlertCard({ budget }: OverspendAlertCardProps) {
  if (budget.spent <= budget.limit) return null;

  const over = budget.spent - budget.limit;

  return (
    <View className="flex-row items-start gap-3 bg-alert/10 border border-alert/30 rounded-2xl p-3.5">
      <View className="w-8 h-8 rounded-full bg-alert/20 items-center justify-center">
        <AlertTriangle color="#D9564B" size={16} />
      </View>
      <Text className="flex-1 text-alert font-body text-xs leading-5">
        <Text className="font-body-semibold">{budget.category}</Text> is{' '}
        <Text className="font-mono-semibold">{formatCurrency(over)}</Text> over budget — mostly driven by a
        few larger purchases this month.
      </Text>
    </View>
  );
}
