import React from 'react';
import { Text, View } from 'react-native';
import { useNetWorth } from '../../hooks/useNetWorth';
import { SparklineChart } from '../ui/SparklineChart';

export function NetWorthCard() {
  const { timeline, current, change, isLoading } = useNetWorth();

  if (isLoading) return null;

  const chartData = timeline.map((p) => p.netWorth);
  const isPositive = change >= 0;

  return (
    <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-on-surface font-heading-semibold text-sm">Net Worth</Text>
        <View className="items-end">
          <Text className="text-on-surface font-heading-bold text-lg">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(Math.abs(current))}
          </Text>
          {timeline.length >= 2 && (
            <Text className={`font-body-semibold text-xs ${isPositive ? 'text-success' : 'text-alert'}`}>
              {isPositive ? '▲' : '▼'} {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(Math.abs(change))}
            </Text>
          )}
        </View>
      </View>

      {chartData.length >= 2 && (
        <SparklineChart
          data={chartData}
          width={280}
          height={80}
          lineColor={isPositive ? '#005c55' : '#d32f2f'}
          fillColor={isPositive ? 'rgba(0,92,85,0.06)' : 'rgba(211,47,47,0.06)'}
          showLabels
        />
      )}

      {timeline.length >= 2 && (
        <View className="flex-row justify-between mt-2 pt-2 border-t border-border/50">
          <View>
            <Text className="text-on-surface-variant font-body text-[10px]">Assets</Text>
            <Text className="text-on-surface font-body-semibold text-xs">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(timeline[timeline.length - 1].assets)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-on-surface-variant font-body text-[10px]">Liabilities</Text>
            <Text className="text-on-surface font-body-semibold text-xs">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(timeline[timeline.length - 1].liabilities)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
