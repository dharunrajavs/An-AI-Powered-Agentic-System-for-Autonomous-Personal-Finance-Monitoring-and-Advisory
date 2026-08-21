import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSendChatMessage } from '../../hooks';

const PROMPTS = [
  'Where should I invest?',
  'How much can I invest monthly?',
  'Why did my spending spike?',
  'Am I on track for retirement?',
  'Summarize last month',
];

export function SuggestedPromptChips() {
  const sendMessage = useSendChatMessage();

  return (
    <View className="flex-row flex-wrap gap-2 py-3">
      {PROMPTS.map((prompt) => (
        <Pressable
          key={prompt}
          onPress={() => sendMessage.mutate(prompt)}
          disabled={sendMessage.isPending}
          accessibilityRole="button"
          accessibilityLabel={prompt}
          className="px-3.5 py-2 rounded-full bg-surface border border-border active:opacity-80"
        >
          <Text className="text-white font-body-medium text-xs">{prompt}</Text>
        </Pressable>
      ))}
    </View>
  );
}
