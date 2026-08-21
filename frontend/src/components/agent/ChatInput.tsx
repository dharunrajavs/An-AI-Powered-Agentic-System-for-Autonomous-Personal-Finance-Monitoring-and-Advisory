import { Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useSendChatMessage } from '../../hooks';

export function ChatInput() {
  const [text, setText] = useState('');
  const sendMessage = useSendChatMessage();
  const isDisabled = text.trim().length === 0 || sendMessage.isPending;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage.mutate(trimmed);
    setText('');
  };

  return (
    <View className="border-t border-outline-variant/30">
      <View className="flex-row items-end gap-2 py-3">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask your advisor..."
          placeholderTextColor="#6e7977"
          multiline
          className="flex-1 max-h-28 bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-on-surface font-body text-sm"
        />
        <Pressable
          onPress={handleSend}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          className={`w-11 h-11 rounded-full items-center justify-center ${
            isDisabled ? 'bg-surface-container-low border border-outline-variant/30' : 'bg-primary active:opacity-80'
          }`}
        >
          <Send color={isDisabled ? '#6e7977' : '#ffffff'} size={18} />
        </Pressable>
      </View>
      <Text className="text-on-surface-variant font-body text-[10px] text-center pb-2 px-4">
        FinSense gives general guidance only — not professional financial or tax advice.
      </Text>
    </View>
  );
}
