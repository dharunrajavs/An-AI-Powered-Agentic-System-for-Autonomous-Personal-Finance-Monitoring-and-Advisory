import React from 'react';
import { Text, View } from 'react-native';
import { Goal } from '../../types';
import { calcProgress, daysUntil } from '../../utils';
import { DonutChart } from '../ui/charts';

interface GoalProgressRingProps {
  goal: Goal;
}

function shortenLabel(name: string): string {
  if (name.length <= 14) return name;
  return `${name.slice(0, 13)}…`;
}

export function GoalProgressRing({ goal }: GoalProgressRingProps) {
  const progress = calcProgress(goal.currentAmount, goal.targetAmount);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const days = daysUntil(goal.targetDate);
  const isComplete = progress >= 100;

  return (
    <View className="flex-row items-center gap-5">
      <DonutChart
        size={96}
        strokeWidth={12}
        centerValue={`${Math.round(progress)}%`}
        centerLabel={isComplete ? 'Complete' : shortenLabel(goal.name)}
        data={[
          { label: goal.name, value: goal.currentAmount, color: '#C9A44C' },
          { label: 'Remaining', value: remaining, color: '#232B3D' },
        ]}
      />
      <View className="flex-1 gap-1">
        <Text className="text-muted font-body text-xs uppercase tracking-wide">Target date</Text>
        <Text className="text-white font-body-medium text-sm">{days < 0 ? 'Past due' : `${days} days left`}</Text>
      </View>
    </View>
  );
}
