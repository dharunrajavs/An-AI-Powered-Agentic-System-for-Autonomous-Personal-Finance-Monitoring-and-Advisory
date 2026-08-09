import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessageCircle, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { RootStackParamList } from '../../navigation/types';

export function SmsTrackingSettings() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="gap-3">
      <Text className="text-on-surface-variant font-body text-sm leading-5">
        Automatically detect bank transaction SMS to track expenses, categorize spending, and get AI-powered insights.
      </Text>

      <Pressable
        onPress={() => navigation.navigate('SmsTracking', { screen: 'AutomaticExpense' })}
        className="flex-row items-center justify-between bg-primary/5 rounded-xl px-4 py-3.5 border border-primary/20 active:opacity-80"
      >
        <View className="flex-row items-center gap-2">
          <MessageCircle color="#005c55" size={18} />
          <Text className="text-primary font-body-semibold text-sm">Configure SMS Tracking</Text>
        </View>
        <ChevronRight color="#005c55" size={18} />
      </Pressable>

      <View className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/30">
        <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider mb-2">Privacy</Text>
        <Text className="text-on-surface-variant font-body text-xs leading-4">
          Reads only bank transaction SMS. Personal messages and OTPs are never accessed. Disable anytime.
        </Text>
      </View>
    </View>
  );
}