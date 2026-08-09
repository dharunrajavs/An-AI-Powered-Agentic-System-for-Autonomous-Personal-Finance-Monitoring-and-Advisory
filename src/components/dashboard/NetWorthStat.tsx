import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { ConnectedAccount } from '../../types';
import { formatCurrency } from '../../utils';
import { Card } from '../ui';

// No real historical net-worth series exists in the mock data, so we derive a
// small, stable "monthly change" from the current total using a fixed rate
// rather than Math.random() — this keeps the figure consistent across renders.
const MONTHLY_DELTA_RATE = 0.024;

interface NetWorthStatProps {
  accounts: ConnectedAccount[];
}

export function NetWorthStat({ accounts }: NetWorthStatProps) {
  const total = accounts.reduce((sum, account) => sum + account.balance, 0);
  const deltaAmount = total * MONTHLY_DELTA_RATE;
  const isPositive = deltaAmount >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const deltaPercentLabel = `${Math.abs(MONTHLY_DELTA_RATE * 100).toFixed(1)}%`;

  return (
    <Card className="gap-1.5">
      <Text className="text-on-surface-variant font-body text-xs uppercase tracking-wide">Net worth</Text>
      <Text className="text-primary font-mono-semibold text-4xl">{formatCurrency(total)}</Text>
      <View className="flex-row items-center gap-1.5 mt-1">
        <TrendIcon color={isPositive ? '#3FA96A' : '#D9564B'} size={16} />
        <Text className={`font-mono-semibold text-sm ${isPositive ? 'text-positive' : 'text-alert'}`}>
          {formatCurrency(deltaAmount, { showSign: true })}
        </Text>
        <Text className={`font-body text-sm ${isPositive ? 'text-positive' : 'text-alert'}`}>
          ({isPositive ? '+' : '-'}
          {deltaPercentLabel}) this month
        </Text>
      </View>
    </Card>
  );
}
