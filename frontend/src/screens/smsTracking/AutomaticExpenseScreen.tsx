import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarChart3, Shield, Smartphone } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmsTrackingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

export function AutomaticExpenseScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SmsTrackingStackParamList>>();
  const completeSmsTracking = useAuthStore((s) => s.completeSmsTracking);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-2xl bg-primary items-center justify-center mb-6 shadow-lg">
            <BarChart3 color="#ffffff" size={40} />
          </View>
          <Text className="text-on-surface font-heading-bold text-3xl text-center mb-3">
            Track Expenses{'\n'}Automatically
          </Text>
          <Text className="text-on-surface-variant font-body text-base text-center leading-6 px-2">
            Allow SMS access to automatically detect your bank transaction alerts and provide personalized spending insights. We never read personal messages.
          </Text>
        </View>

        <View className="bg-surface-container-lowest rounded-2xl border border-border p-5 mb-8 gap-4 shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center">
              <Smartphone color="#3FA96A" size={20} />
            </View>
            <Text className="text-on-surface font-body-medium text-sm flex-1">
              Reads only bank transaction SMS alerts
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <Shield color="#005c55" size={20} />
            </View>
            <Text className="text-on-surface font-body-medium text-sm flex-1">
              End-to-end encrypted & secure
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center">
              <BarChart3 color="#3FA96A" size={20} />
            </View>
            <Text className="text-on-surface font-body-medium text-sm flex-1">
              AI-powered spending insights
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('WhySmsPermission')}
          className="w-full bg-primary py-4.5 rounded-full items-center justify-center shadow-md active:opacity-90"
        >
          <Text className="text-on-primary font-heading-semibold text-lg">Continue</Text>
        </Pressable>

        <Pressable
          onPress={completeSmsTracking}
          className="py-4 mt-2"
        >
          <Text className="text-on-surface-variant font-body-medium text-sm text-center">
            Not now
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}