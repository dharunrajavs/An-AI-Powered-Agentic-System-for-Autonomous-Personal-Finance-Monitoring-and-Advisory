import React from 'react';
import { Switch, Text, View } from 'react-native';
import { useAgentPreferences, useUpdateAgentPreferences } from '../../hooks';
import { AgentPreferences } from '../../types';

type NotificationField = Extract<
  keyof AgentPreferences,
  'notifyOverspend' | 'notifyBillDue' | 'notifyUnusualTransaction' | 'notifyGoalMilestone' | 'notifyWeeklyDigest'
>;

const NOTIFICATION_ROWS: { field: NotificationField; label: string }[] = [
  { field: 'notifyOverspend', label: 'Overspend alerts' },
  { field: 'notifyBillDue', label: 'Bill due reminders' },
  { field: 'notifyUnusualTransaction', label: 'Unusual transaction alerts' },
  { field: 'notifyGoalMilestone', label: 'Goal milestones' },
  { field: 'notifyWeeklyDigest', label: 'Weekly digest' },
];

export function NotificationPreferences() {
  const { data: preferences } = useAgentPreferences();
  const updatePreferences = useUpdateAgentPreferences();

  if (!preferences) {
    return null;
  }

  return (
    <View className="gap-4">
      {NOTIFICATION_ROWS.map(({ field, label }, index) => (
        <View
          key={field}
          className={`flex-row items-center justify-between ${index > 0 ? 'border-t border-border pt-4' : ''}`}
        >
          <Text className="flex-1 pr-3 font-body-medium text-sm text-on-surface">{label}</Text>
          <Switch
            value={preferences[field]}
            onValueChange={(value) => updatePreferences.mutate({ [field]: value })}
            trackColor={{ false: '#232B3D', true: '#C9A44C' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#232B3D"
            accessibilityLabel={label}
          />
        </View>
      ))}
    </View>
  );
}
