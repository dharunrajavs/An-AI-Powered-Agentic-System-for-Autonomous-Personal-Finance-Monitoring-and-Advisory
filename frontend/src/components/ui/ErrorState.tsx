import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }: ErrorStateProps) {
  return (
    <View className="items-center justify-center px-8 py-12 gap-3">
      <View className="w-16 h-16 rounded-full bg-surface-container-lowest items-center justify-center mb-2 border border-border">
        <AlertTriangle color="#D9564B" size={28} />
      </View>
      <Text className="text-on-surface font-heading-semibold text-base text-center">Couldn't load this</Text>
      <Text className="text-on-surface-variant font-body text-sm text-center leading-5">{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          className="mt-3 bg-surface-container-lowest border border-border px-5 py-3 rounded-xl active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text className="text-on-surface font-body-semibold text-sm">Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
