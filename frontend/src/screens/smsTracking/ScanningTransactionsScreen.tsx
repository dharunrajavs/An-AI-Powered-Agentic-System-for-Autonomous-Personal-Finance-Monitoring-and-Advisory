import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FileText, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmsTrackingStackParamList } from '../../navigation/types';
import { useScanSmsTransactions } from '../../hooks';
import { useSmsTrackingStore } from '../../store/smsTrackingStore';

type ScanStep = { label: string; status: 'done' | 'active' | 'pending' };

export function ScanningTransactionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SmsTrackingStackParamList>>();
  const scanMutation = useScanSmsTransactions();
  const setScanResults = useSmsTrackingStore((s) => s.setScanResults);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [dots, setDots] = useState('');
  const [steps, setSteps] = useState<ScanStep[]>([
    { label: 'Scanning bank transaction SMS...', status: 'active' },
    { label: 'Categorizing your expenses...', status: 'pending' },
    { label: 'Preparing your financial insights...', status: 'pending' },
  ]);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true,
      }),
    ).start();

    scanMutation.mutate(undefined, {
      onSuccess: (data) => {
        setScanResults(data.transactions, data.summary);
        setTimeout(() => {
          navigation.replace('ProcessingComplete');
        }, 600);
      },
      onError: (err) => {
        setHasError(true);
        setErrorMessage(err instanceof Error ? err.message : 'Failed to scan SMS');
      },
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: 'done' as const }
            : i === 1 ? { ...s, status: 'active' as const }
            : s
        ),
      );
    }, 1500);

    const t2 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((s, i) =>
          i === 1 ? { ...s, status: 'done' as const }
            : i === 2 ? { ...s, status: 'active' as const }
            : s
        ),
      );
    }, 3000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (hasError) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-alert/10 w-20 h-20 rounded-full items-center justify-center mb-6">
            <Text className="text-3xl">⚠️</Text>
          </View>
          <Text className="text-on-surface font-heading-bold text-xl text-center mb-2">Scan Failed</Text>
          <Text className="text-on-surface-variant font-body text-sm text-center mb-8 leading-5 px-4">
            {errorMessage}
          </Text>
          <View className="flex-col gap-3 w-full">
            <Pressable
              onPress={() => navigation.replace('ManualSmsImport')}
              className="w-full bg-primary py-4 rounded-full items-center active:opacity-90"
            >
              <Text className="text-on-primary font-heading-semibold text-base">Paste SMS Manually</Text>
            </Pressable>
            <Pressable
              onPress={() => { setHasError(false); scanMutation.mutate(); }}
              className="w-full py-4 rounded-full items-center border border-border active:opacity-80"
            >
              <Text className="text-on-surface font-heading-semibold text-base">Try Again</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View style={{ opacity: fadeAnim }} className="items-center w-full max-w-sm">
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Animated.View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-8">
              <FileText color="#005c55" size={40} />
            </Animated.View>
          </Animated.View>

          <Text className="text-on-surface font-heading-bold text-2xl mb-6 text-center">
            Analyzing your transactions{dots}
          </Text>

          <View className="w-full bg-surface-container-lowest rounded-2xl border border-border p-4 gap-4 shadow-sm">
            {steps.map((step, i) => (
              <View key={`scan-${i}`} className="flex-row items-center gap-3">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step.status === 'done'
                      ? 'bg-success/20'
                      : step.status === 'active'
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-surface-container'
                  }`}
                >
                  {step.status === 'done' ? (
                    <Text className="text-success font-heading-bold text-sm">✓</Text>
                  ) : step.status === 'active' ? (
                    <View className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <View className="w-2 h-2 rounded-full bg-surface-container-highest" />
                  )}
                </View>
                <Text
                  className={`font-body text-sm flex-1 ${
                    step.status === 'pending' ? 'text-on-surface-variant/50' : 'text-on-surface'
                  }`}
                >
                  {step.label}
                </Text>
                {step.status === 'active' && (
                  <Text className="text-primary font-body-medium text-xs">Scanning{dots}</Text>
                )}
              </View>
            ))}
          </View>

          <View className="mt-6 p-3 bg-secondary-container/10 border border-secondary-container/30 rounded-lg flex-row items-start gap-3 w-full">
            <Sparkles color="#006c49" size={16} />
            <Text className="text-on-surface-variant font-body text-xs flex-1">
              Your SMS data is processed on-device. No SMS content is stored on our servers.
            </Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
