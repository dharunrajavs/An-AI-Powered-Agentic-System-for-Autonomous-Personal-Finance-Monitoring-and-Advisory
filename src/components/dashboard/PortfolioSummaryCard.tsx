import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAssets } from '../../hooks/useAssets';
import type { MainTabParamList } from '../../navigation/types';
import { Asset } from '../../types';

function weightedReturn(assets: Asset[]): number {
  const total = assets.reduce((s, a) => s + a.value, 0);
  if (total === 0) return 0;
  return assets.reduce((s, a) => s + a.returnPct * (a.value / total), 0);
}

export function PortfolioSummaryCard() {
  const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList>>();
  const { data: assets = [] } = useAssets();

  if (assets.length === 0) return null;

  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const wReturn = weightedReturn(assets);
  const isPositive = wReturn >= 0;

  const topAssets = [...assets].sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <Pressable
      onPress={() => navigation.navigate('More', { screen: 'Investments' } as any)}
      className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm active:opacity-80"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">📈</Text>
          <Text className="text-on-surface font-heading-semibold text-sm">Portfolio</Text>
        </View>
        <View className="items-end">
          <Text className="text-on-surface font-heading-bold text-lg">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(totalValue)}
          </Text>
          <Text className={`font-body-semibold text-xs ${isPositive ? 'text-success' : 'text-alert'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(wReturn).toFixed(1)}% weighted return
          </Text>
        </View>
      </View>

      <View className="gap-1.5">
        {topAssets.map((asset) => (
          <View key={asset.id} className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1">
              <View className={`w-2 h-2 rounded-full ${asset.type === 'stock' ? 'bg-primary' : asset.type === 'bond' ? 'bg-warning' : asset.type === 'cash' ? 'bg-success' : 'bg-alert'}`} />
              <Text className="text-on-surface font-body-medium text-sm flex-1" numberOfLines={1}>
                {asset.name}
              </Text>
            </View>
            <Text className="text-on-surface font-mono-semibold text-xs">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(asset.value)}
            </Text>
          </View>
        ))}
      </View>

      {assets.length > 3 && (
        <Text className="text-on-surface-variant font-body text-[10px] mt-1.5">+{assets.length - 3} more holdings</Text>
      )}
    </Pressable>
  );
}
