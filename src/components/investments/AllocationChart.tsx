import React from 'react';
import { Text, View } from 'react-native';
import { Asset } from '../../types';
import { formatCompactCurrency } from '../../utils';
import { Card } from '../ui';
import { DonutChart, DonutLegend, DonutSegment } from '../ui/charts';

const TYPE_COLOR: Record<Asset['type'], string> = {
  stock: '#C9A44C',
  bond: '#5FA8D3',
  cash: '#3FA96A',
  crypto: '#8B7CF6',
};

const TYPE_LABEL: Record<Asset['type'], string> = {
  stock: 'Stocks',
  bond: 'Bonds',
  cash: 'Cash',
  crypto: 'Crypto',
};

interface AllocationChartProps {
  assets: Asset[];
}

export function AllocationChart({ assets }: AllocationChartProps) {
  if (assets.length === 0) return null;

  const totalsByType = assets.reduce<Partial<Record<Asset['type'], number>>>((totals, asset) => {
    totals[asset.type] = (totals[asset.type] ?? 0) + asset.value;
    return totals;
  }, {});

  const segments: DonutSegment[] = (Object.keys(totalsByType) as Asset['type'][])
    .sort((a, b) => (totalsByType[b] ?? 0) - (totalsByType[a] ?? 0))
    .map((type) => ({
      label: TYPE_LABEL[type],
      value: totalsByType[type] ?? 0,
      color: TYPE_COLOR[type],
    }));

  const total = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <Card className="gap-4">
      <Text className="text-white font-heading-semibold text-base">Allocation</Text>
      <View className="flex-row items-center gap-6">
        <DonutChart data={segments} centerValue={formatCompactCurrency(total)} centerLabel="Total" />
        <View className="flex-1">
          <DonutLegend data={segments} />
        </View>
      </View>
    </Card>
  );
}
