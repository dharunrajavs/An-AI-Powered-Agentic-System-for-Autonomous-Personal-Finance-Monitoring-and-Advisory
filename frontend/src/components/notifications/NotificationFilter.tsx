import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { AlertType } from '../../types';

export type NotificationFilterValue = 'all' | AlertType;

const FILTERS: { value: NotificationFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'overspend', label: 'Overspend' },
  { value: 'bill_due', label: 'Bills' },
  { value: 'unusual_transaction', label: 'Unusual' },
  { value: 'goal_milestone', label: 'Milestones' },
  { value: 'weekly_digest', label: 'Digest' },
];

interface NotificationFilterProps {
  value: NotificationFilterValue;
  onChange: (value: NotificationFilterValue) => void;
}

export function NotificationFilter({ value, onChange }: NotificationFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 8 }}
    >
      {FILTERS.map((filter) => {
        const active = filter.value === value;
        return (
          <Pressable
            key={filter.value}
            onPress={() => onChange(filter.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${filter.label}`}
            className={`px-3.5 py-2 rounded-full border ${active ? 'bg-gold border-gold' : 'bg-surface border-border'}`}
          >
            <Text className={`font-body-semibold text-xs ${active ? 'text-background' : 'text-muted'}`}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
