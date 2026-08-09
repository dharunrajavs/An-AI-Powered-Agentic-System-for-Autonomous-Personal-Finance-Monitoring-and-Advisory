import React from 'react';
import { Text, View } from 'react-native';
import { Goal } from '../../types';
import { calcProgress, OnTrackStatus } from '../../utils';

// The date-based calcGoalStatus util needs a real "created date" to compare
// elapsed vs. expected progress, which Goal doesn't track. Standing in
// "today" as the created date collapses the math to "always on track", so we
// derive status from progress thresholds instead (explicitly allowed by spec).
function deriveGoalStatus(goal: Goal): OnTrackStatus {
  const progress = calcProgress(goal.currentAmount, goal.targetAmount);
  if (progress >= 90) return 'on-track';
  if (progress >= 60) return 'slightly-behind';
  return 'off-track';
}

const STATUS_STYLES: Record<OnTrackStatus, { bg: string; text: string; label: string }> = {
  'on-track': { bg: 'bg-positive/20', text: 'text-positive', label: 'On track' },
  'slightly-behind': { bg: 'bg-gold/20', text: 'text-gold', label: 'Slightly behind' },
  'off-track': { bg: 'bg-alert/20', text: 'text-alert', label: 'Off track' },
};

interface OnTrackIndicatorProps {
  goal: Goal;
}

export function OnTrackIndicator({ goal }: OnTrackIndicatorProps) {
  const status = deriveGoalStatus(goal);
  const style = STATUS_STYLES[status];

  return (
    <View className={`self-start px-2.5 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-body-semibold ${style.text}`}>{style.label}</Text>
    </View>
  );
}
