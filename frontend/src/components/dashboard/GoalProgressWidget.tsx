import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useGoals } from '../../hooks/useGoals';
import type { MoreStackParamList } from '../../navigation/types';

export function GoalProgressWidget() {
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const { data: goals = [] } = useGoals();

  if (goals.length === 0) return null;

  const completed = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const active = goals.filter((g) => g.currentAmount < g.targetAmount);

  return (
    <Pressable
      onPress={() => navigation.navigate('Goals')}
      className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm active:opacity-80"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">🎯</Text>
          <Text className="text-on-surface font-heading-semibold text-sm">Goal Progress</Text>
        </View>
        <Text className="text-on-surface-variant font-body text-xs">{completed}/{goals.length} done</Text>
      </View>

      <View className="gap-3">
        {active.slice(0, 3).map((goal) => {
          const pct = goal.targetAmount > 0 ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100) : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000);
          const isClose = pct >= 80;

          return (
            <View key={goal.id} className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-on-surface font-body-medium text-sm flex-1" numberOfLines={1}>
                  {goal.name}
                </Text>
                <Text className={`font-heading-semibold text-xs ${isClose ? 'text-success' : 'text-on-surface'}`}>
                  {pct}%
                </Text>
              </View>
              <View className="h-2 bg-surface-container rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${pct >= 100 ? 'bg-success' : isClose ? 'bg-success' : 'bg-primary'}`}
                  style={{ width: `${pct}%` }}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-on-surface-variant font-body text-[9px]">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(goal.currentAmount)} / {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(goal.targetAmount)}
                </Text>
                <Text className={`font-body text-[9px] ${daysLeft <= 0 ? 'text-alert' : daysLeft <= 30 ? 'text-warning' : 'text-on-surface-variant'}`}>
                  {daysLeft <= 0 ? 'Past due' : `${remaining > 0 ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(remaining) + ' — ' : ''}${daysLeft}d left`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {active.length > 3 && (
        <Text className="text-on-surface-variant font-body text-[10px] mt-2">+{active.length - 3} more goals</Text>
      )}
    </Pressable>
  );
}
