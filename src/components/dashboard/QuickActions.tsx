import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Banknote, MessageCircle, Plus } from 'lucide-react-native';
import type { MainTabParamList } from '../../navigation/types';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface QuickActionsProps {
  onCashPress: () => void;
}

export function QuickActions({ onCashPress }: QuickActionsProps) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  return (
    <View className="flex-row gap-3">
      <Pressable
        onPress={() => navigation.navigate('Transactions')}
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        className="flex-1 flex-row items-center justify-center gap-2 bg-surface border border-border rounded-xl py-3.5 active:opacity-80"
      >
        <Plus color="#005c55" size={18} />
        <Text className="text-on-surface font-body-semibold text-sm">UPI</Text>
      </Pressable>
      <Pressable
        onPress={onCashPress}
        accessibilityRole="button"
        accessibilityLabel="Add cash expense"
        className="flex-1 flex-row items-center justify-center gap-2 bg-surface border border-border rounded-xl py-3.5 active:opacity-80"
      >
        <Banknote color="#005c55" size={18} />
        <Text className="text-on-surface font-body-semibold text-sm">Cash</Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate('Advisor')}
        accessibilityRole="button"
        accessibilityLabel="Ask advisor"
        className="flex-1 flex-row items-center justify-center gap-2 bg-surface border border-border rounded-xl py-3.5 active:opacity-80"
      >
        <MessageCircle color="#005c55" size={18} />
        <Text className="text-on-surface font-body-semibold text-sm">Advisor</Text>
      </Pressable>
    </View>
  );
}
