import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Budget } from '../../types';
import { calcBudgetPercent, formatCurrency } from '../../utils';

interface BudgetProgressBarProps {
  budget: Budget;
  onPress?: () => void;
}

export function BudgetProgressBar({ budget, onPress }: BudgetProgressBarProps) {
  const percent = calcBudgetPercent(budget.spent, budget.limit);
  const isOver = percent > 100;
  const clampedPercent = Math.min(100, Math.max(0, percent));

  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clampedPercent,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedPercent, widthAnim]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${budget.category} budget, ${Math.round(percent)}% used`}
      className="bg-surface rounded-2xl border border-border p-4 gap-3 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-on-surface font-body-semibold text-sm">{budget.category}</Text>
        <Text className={`font-mono-semibold text-sm ${isOver ? 'text-alert' : 'text-on-surface-variant'}`}>
          {Math.round(percent)}%
        </Text>
      </View>
      <View className="h-2.5 rounded-full bg-border overflow-hidden">
        <Animated.View
          style={{ width: animatedWidth }}
          className={`h-full rounded-full ${isOver ? 'bg-alert' : 'bg-positive'}`}
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-on-surface-variant font-mono text-xs">{formatCurrency(budget.spent)} spent</Text>
        <Text className="text-on-surface-variant font-mono text-xs">of {formatCurrency(budget.limit)}</Text>
      </View>
    </Pressable>
  );
}
