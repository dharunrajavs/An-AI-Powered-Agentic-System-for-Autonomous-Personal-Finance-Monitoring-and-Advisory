import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, CheckCircle, Clipboard, Settings, Smartphone, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmsTrackingStackParamList } from '../../navigation/types';
import { useRequestSmsPermission } from '../../hooks';
import { useSmsTrackingStore } from '../../store/smsTrackingStore';
import { useAuthStore } from '../../store/authStore';

export function RequestSmsPermissionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SmsTrackingStackParamList>>();
  const permissionMutation = useRequestSmsPermission();
  const setPermissionStatus = useSmsTrackingStore((s) => s.setPermissionStatus);
  const completeSmsTracking = useAuthStore((s) => s.completeSmsTracking);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [platformUnsupported, setPlatformUnsupported] = useState(Platform.OS !== 'android');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();
  }, [permissionDenied]);

  const handleRequestPermission = () => {
    permissionMutation.mutate(undefined, {
      onSuccess: (status) => {
        setPermissionStatus(status);
        if (status.granted) {
          navigation.replace('ScanningTransactions');
        } else {
          setPermissionDenied(true);
        }
      },
      onError: () => {
        setPermissionDenied(true);
      },
    });
  };

  if (permissionDenied || platformUnsupported) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
        <View className="flex-1 px-6 justify-center">
          <Animated.View
            className="items-center"
            style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
          >
            <View className="w-20 h-20 rounded-full bg-alert/10 items-center justify-center mb-6">
              <XCircle color="#ba1a1a" size={40} />
            </View>
            <Text className="text-on-surface font-heading-bold text-2xl text-center mb-2">
              {platformUnsupported ? 'Auto-Scan Unavailable' : 'Permission Required'}
            </Text>
            <Text className="text-on-surface-variant font-body text-sm text-center mb-8 leading-5 px-4">
              {platformUnsupported
                ? 'Automatic SMS scanning is only available on Android. You can still import transactions manually.'
                : 'You can enable SMS permission later from Settings, or paste your SMS messages manually.'}
            </Text>

            <View className="w-full gap-3 mb-6">
              <Pressable
                onPress={() => navigation.navigate('ManualSmsImport')}
                className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
              >
                <Clipboard color="#ffffff" size={20} />
                <Text className="text-on-primary font-heading-semibold text-base">
                  Paste SMS Manually
                </Text>
              </Pressable>

              <Pressable
                onPress={completeSmsTracking}
                className="w-full py-4 rounded-full items-center flex-row justify-center gap-2 border border-border active:opacity-80"
              >
                <Settings color="#131b2e" size={18} />
                <Text className="text-on-surface font-heading-semibold text-base">
                  Skip for now
                </Text>
              </Pressable>
            </View>

            {!platformUnsupported && (
              <Pressable onPress={() => setPermissionDenied(false)} className="py-2">
                <Text className="text-primary font-body-semibold text-sm text-center">Try Again</Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-surface-container-lowest border border-border items-center justify-center"
        >
          <ArrowLeft color="#131b2e" size={18} />
        </Pressable>
      </View>

      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
            <Smartphone color="#005c55" size={40} />
          </View>
          <Text className="text-on-surface font-heading-bold text-2xl text-center mb-2">
            Enable SMS Permission
          </Text>
          <Text className="text-on-surface-variant font-body text-sm text-center leading-5 px-4">
            Allow FinAdvisor to read SMS messages from your bank to automatically track expenses.
          </Text>
        </View>

        <View className="bg-surface-container-lowest rounded-2xl border border-border p-5 mb-8 shadow-sm gap-3">
          <View className="flex-row items-center gap-3 py-2">
            <CheckCircle color="#3FA96A" size={18} />
            <Text className="text-on-surface font-body text-sm">Read only bank transaction SMS</Text>
          </View>
          <View className="flex-row items-center gap-3 py-2">
            <CheckCircle color="#3FA96A" size={18} />
            <Text className="text-on-surface font-body text-sm">Never access personal chats</Text>
          </View>
          <View className="flex-row items-center gap-3 py-2">
            <CheckCircle color="#3FA96A" size={18} />
            <Text className="text-on-surface font-body text-sm">Data encrypted & stored securely</Text>
          </View>
          <View className="flex-row items-center gap-3 py-2">
            <CheckCircle color="#3FA96A" size={18} />
            <Text className="text-on-surface font-body text-sm">Disable anytime from Settings</Text>
          </View>
        </View>

        <Pressable
          onPress={handleRequestPermission}
          disabled={permissionMutation.isPending}
          className="w-full bg-primary py-4.5 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90 disabled:opacity-50"
        >
          <Smartphone color="#ffffff" size={20} />
          <Text className="text-on-primary font-heading-semibold text-lg">
            {permissionMutation.isPending ? 'Requesting...' : 'Allow SMS Access'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('ManualSmsImport')}
          className="w-full py-4 mt-1 rounded-full items-center flex-row justify-center gap-2 active:opacity-80"
        >
          <Clipboard color="#6e7977" size={18} />
          <Text className="text-on-surface-variant font-body-medium text-sm">
            Paste SMS manually instead
          </Text>
        </Pressable>

        <Pressable onPress={completeSmsTracking} className="py-3 mt-1">
          <Text className="text-on-surface-variant font-body-medium text-sm text-center">
            Skip — I'll do this later
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
