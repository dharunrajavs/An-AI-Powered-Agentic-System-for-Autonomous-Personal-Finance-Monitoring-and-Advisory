import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type Step = { label: string; icon: string; status: 'done' | 'active' | 'pending' };

const STEPS: Step[] = [
  { label: 'Fetching transactions', icon: '🏦', status: 'done' },
  { label: 'Categorizing spending', icon: '📂', status: 'done' },
  { label: 'Detecting subscriptions...', icon: '🔔', status: 'active' },
  { label: 'Preparing your first insights...', icon: '💡', status: 'pending' },
];

export function SyncingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const completeSyncing = useAuthStore((s) => s.completeSyncing);
  const [steps, setSteps] = useState<Step[]>(STEPS);
  const [showSuccess, setShowSuccess] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === 2 ? { ...s, status: 'done' as const } : i === 3 ? { ...s, status: 'active' as const } : s
        )
      );
    }, 2000));

    timers.push(setTimeout(() => {
      setSteps((prev) => prev.map((s) => ({ ...s, status: 'done' as const })));
    }, 4000));

    timers.push(setTimeout(() => {
      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 4500));

    return () => timers.forEach(clearTimeout);
  }, []);

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      {/* Top progress bar */}
      <View className="h-1.5 bg-surface-container">
        <Animated.View
          className="h-full bg-primary"
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      {!showSuccess ? (
        <View className="flex-1 items-center justify-center px-5">
          <View className="w-full max-w-md items-center">
            {/* Circular Progress */}
            <View className="relative w-48 h-48 mb-6 items-center justify-center">
              <Animated.View
                className="w-44 h-44 rounded-full border-[6px] border-surface-container-high"
                style={{ position: 'absolute' }}
              />
              <Animated.View
                className="w-44 h-44 rounded-full border-[6px] border-primary"
                style={{
                  position: 'absolute',
                  borderLeftColor: 'transparent',
                  borderBottomColor: 'transparent',
                  borderRightColor: 'transparent',
                  transform: [{ rotate: '-90deg' }],
                  opacity: progressAnim,
                }}
              />
              <View className="w-20 h-20 rounded-full bg-tertiary-container items-center justify-center">
                <Sparkles color="#ffffff" size={36} />
              </View>
            </View>

            <Text className="text-on-surface font-heading-bold text-2xl mb-1">Setting things up</Text>
            <Text className="text-on-surface-variant font-body text-sm mb-6 text-center">
              Our AI is synchronizing your accounts and generating personalized insights.
            </Text>

            {/* Checklist */}
            <View className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 gap-4 shadow-sm">
              {steps.map((step, i) => (
                <View key={`sync-${i}`} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        step.status === 'done'
                          ? 'bg-primary-container/20'
                          : step.status === 'active'
                          ? 'bg-tertiary-container/10 border border-tertiary-container/30'
                          : 'bg-surface-container-highest'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          step.status === 'done'
                            ? 'text-primary'
                            : step.status === 'active'
                            ? 'text-tertiary'
                            : 'text-outline'
                        }`}
                      >
                        {step.status === 'done' ? '✓' : step.icon}
                      </Text>
                    </View>
                    <Text
                      className={`font-body text-sm ${
                        step.status === 'pending' ? 'text-on-surface-variant/60' : 'text-on-surface'
                      }`}
                    >
                      {step.label}
                    </Text>
                  </View>
                  <View>
                    {step.status === 'active' ? (
                      <View className="w-4 h-4 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />
                    ) : step.status === 'done' ? (
                      <Text className="text-primary font-heading-bold">✓</Text>
                    ) : (
                      <Text className="text-outline-variant">○</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Security note */}
            <View className="mt-4 p-3 bg-secondary-container/10 border border-secondary-container rounded-lg flex-row items-start gap-3">
              <Text className="text-secondary text-lg">🛡️</Text>
              <Text className="text-on-secondary-container font-body text-xs flex-1">
                Your data is encrypted with bank-grade 256-bit AES protection. We never store your login credentials.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <Animated.View
          className="flex-1 items-center justify-center px-5"
          style={{ opacity: fadeAnim }}
        >
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-secondary-container items-center justify-center mb-4">
              <Text className="text-4xl">✅</Text>
            </View>
            <Text className="text-on-surface font-heading-bold text-2xl mb-1">Sync Complete!</Text>
            <Text className="text-on-surface-variant font-body text-sm mb-6 text-center">
              Your financial world is now at your fingertips.
            </Text>
            <Pressable
              onPress={() => {
                completeSyncing();
              }}
              className="px-8 py-4 bg-primary rounded-full"
            >
              <Text className="text-on-primary font-body-semibold text-base">Go to Dashboard</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
