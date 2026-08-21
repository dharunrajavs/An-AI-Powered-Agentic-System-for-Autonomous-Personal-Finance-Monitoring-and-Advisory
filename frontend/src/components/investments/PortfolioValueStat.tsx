import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { Asset } from '../../types';
import { formatCurrency } from '../../utils';
import { Card } from '../ui';

interface PortfolioValueStatProps {
  assets: Asset[];
}

export function PortfolioValueStat({ assets }: PortfolioValueStatProps) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  const weightedReturnPct =
    totalValue > 0
      ? assets.reduce((sum, asset) => sum + asset.returnPct * (asset.value / totalValue), 0)
      : 0;

  const isPositive = weightedReturnPct >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="gap-2">
      <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Portfolio value</Text>
      <Text className="text-gold font-mono-semibold text-3xl">{formatCurrency(totalValue)}</Text>
      <View className="flex-row items-center gap-1.5">
        <TrendIcon color={isPositive ? '#3FA96A' : '#D9564B'} size={16} />
        <Text className={`font-mono-semibold text-sm ${isPositive ? 'text-positive' : 'text-alert'}`}>
          {isPositive ? '+' : ''}
          {weightedReturnPct.toFixed(2)}%
        </Text>
        <Text className="text-muted font-body text-xs">weighted return</Text>
      </View>
    </Card>
  );
}
