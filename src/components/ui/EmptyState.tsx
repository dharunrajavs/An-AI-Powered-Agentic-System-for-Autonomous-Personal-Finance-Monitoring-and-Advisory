import { LucideIcon, Inbox } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = Inbox, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-12 gap-3">
      <View className="w-16 h-16 rounded-full bg-surface-container-lowest items-center justify-center mb-2 border border-border">
        <Icon color="#6e7977" size={28} />
      </View>
      <Text className="text-on-surface font-heading-semibold text-base text-center">{title}</Text>
      {message ? <Text className="text-on-surface-variant font-body text-sm text-center leading-5">{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="mt-3 bg-primary px-5 py-3 rounded-xl active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text className="text-on-primary font-body-semibold text-sm">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
