import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmsTrackingStackParamList } from '../../navigation/types';
import { useSmsTrackingStore } from '../../store/smsTrackingStore';

export function ProcessingCompleteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SmsTrackingStackParamList>>();
  const summary = useSmsTrackingStore((s) => s.summary);
  const transactions = useSmsTrackingStore((s) => s.transactions);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 4, tension: 100, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const txCount = transactions.length;
  const catCount = summary ? Object.values(summary.categorySpending).filter((v) => v > 0).length : 0;
  const tipCount = summary?.savingsSuggestions.length ?? 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="items-center">
            <View className="w-24 h-24 rounded-full bg-success/10 items-center justify-center mb-6">
              <View className="w-16 h-16 rounded-full bg-success items-center justify-center shadow-lg">
                <CheckCircle color="#ffffff" size={36} />
              </View>
            </View>

            <Text className="text-on-surface font-heading-bold text-2xl text-center mb-2">
              Processing Complete!
            </Text>
            <Text className="text-on-surface-variant font-body text-sm text-center leading-5 px-4">
              Your transaction history has been analyzed successfully. Your personalized expense dashboard is ready.
            </Text>
          </Animated.View>
        </View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="bg-surface-container-lowest rounded-2xl border border-border p-5 mb-8 shadow-sm gap-3"
        >
          <View className="flex-row items-center gap-3 py-2">
            <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center">
              <Text className="text-success font-heading-bold text-sm">✓</Text>
            </View>
            <Text className="text-on-surface font-body text-sm">{txCount} transaction{txCount !== 1 ? 's' : ''} scanned</Text>
          </View>
          <View className="flex-row items-center gap-3 py-2">
            <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center">
              <Text className="text-success font-heading-bold text-sm">✓</Text>
            </View>
            <Text className="text-on-surface font-body text-sm">{catCount} spending categor{catCount !== 1 ? 'ies' : 'y'} analyzed</Text>
          </View>
          <View className="flex-row items-center gap-3 py-2">
            <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center">
              <Text className="text-success font-heading-bold text-sm">✓</Text>
            </View>
            <Text className="text-on-surface font-body text-sm">{tipCount} savings suggestion{tipCount !== 1 ? 's' : ''} generated</Text>
          </View>
        </Animated.View>

        <Pressable
          onPress={() => navigation.navigate('ExpenseSummaryDashboard')}
          className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
        >
          <Text className="text-on-primary font-heading-semibold text-lg">View Your Dashboard</Text>
          <ChevronRight color="#ffffff" size={20} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
