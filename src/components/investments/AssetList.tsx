import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Asset } from '../../types';
import { formatCurrency } from '../../utils';
import { Card } from '../ui';
import { AreaSparkline } from '../ui/charts';

const TYPE_LABEL: Record<Asset['type'], string> = {
  stock: 'Stock',
  bond: 'Bond',
  cash: 'Cash',
  crypto: 'Crypto',
};

interface AssetListProps {
  assets: Asset[];
  onSelect: (asset: Asset) => void;
}

function dailyChangePct(history: number[]): number {
  if (history.length < 2) return 0;
  const prev = history[history.length - 2];
  const last = history[history.length - 1];
  if (!prev) return 0;
  return ((last - prev) / prev) * 100;
}

export function AssetList({ assets, onSelect }: AssetListProps) {
  return (
    <View className="gap-3">
      {assets.map((asset) => {
        const change = dailyChangePct(asset.history);
        const isPositive = change >= 0;
        const trendColor = asset.returnPct >= 0 ? '#3FA96A' : '#D9564B';

        return (
          <Pressable
            key={asset.id}
            onPress={() => onSelect(asset)}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${asset.name}`}
          >
            <Card className="flex-row items-center gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-white font-body-semibold text-sm" numberOfLines={1}>
                  {asset.name}
                </Text>
                <Text className="text-muted font-body text-xs uppercase tracking-wide">{TYPE_LABEL[asset.type]}</Text>
              </View>

              <AreaSparkline data={asset.history} width={60} height={24} color={trendColor} />

              <View className="items-end gap-1">
                <Text className="text-white font-mono-semibold text-sm">{formatCurrency(asset.value)}</Text>
                <Text className={`font-mono text-xs ${isPositive ? 'text-positive' : 'text-alert'}`}>
                  {isPositive ? '+' : ''}
                  {change.toFixed(1)}%
                </Text>
              </View>
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}
