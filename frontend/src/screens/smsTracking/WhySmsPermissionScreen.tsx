import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, FileText, Lock, MessageCircle, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmsTrackingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

export function WhySmsPermissionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SmsTrackingStackParamList>>();
  const completeSmsTracking = useAuthStore((s) => s.completeSmsTracking);

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
        <Text className="text-on-surface font-heading-bold text-2xl text-center mb-2">
          Why We Need SMS Access
        </Text>
        <Text className="text-on-surface-variant font-body text-sm text-center mb-8">
          We value your privacy. Here's exactly what we access and why.
        </Text>

        <View className="bg-surface-container-lowest rounded-2xl border border-border p-5 mb-8 shadow-sm gap-5">
          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center mt-0.5">
              <FileText color="#3FA96A" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-on-surface font-heading-semibold text-sm">Read Only Bank Transaction SMS</Text>
              <Text className="text-on-surface-variant font-body text-xs mt-1 leading-4">
                We scan only SMS messages from your bank containing transaction alerts — credits, debits, and payment confirmations.
              </Text>
            </View>
          </View>

          <View className="h-px bg-border" />

          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-alert/10 items-center justify-center mt-0.5">
              <MessageCircle color="#ba1a1a" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-on-surface font-heading-semibold text-sm">Personal Chats Are Never Accessed</Text>
              <Text className="text-on-surface-variant font-body text-xs mt-1 leading-4">
                We never read personal conversations, OTP messages, or any non-bank SMS. Our filter identifies only transactional SMS patterns.
              </Text>
            </View>
          </View>

          <View className="h-px bg-border" />

          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mt-0.5">
              <Lock color="#005c55" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-on-surface font-heading-semibold text-sm">Data Is Encrypted & Private</Text>
              <Text className="text-on-surface-variant font-body text-xs mt-1 leading-4">
                All transaction data is encrypted with bank-grade AES-256 encryption. Used only for expense analysis within this app.
              </Text>
            </View>
          </View>

          <View className="h-px bg-border" />

          <View className="flex-row items-start gap-3">
            <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center mt-0.5">
              <ShieldCheck color="#3FA96A" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-on-surface font-heading-semibold text-sm">Full Control — Disable Anytime</Text>
              <Text className="text-on-surface-variant font-body text-xs mt-1 leading-4">
                You can revoke SMS access at any time from Settings. Your data remains yours.
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('RequestSmsPermission')}
          className="w-full bg-primary py-4.5 rounded-full items-center justify-center shadow-md active:opacity-90"
        >
          <Text className="text-on-primary font-heading-semibold text-lg">Allow SMS Access</Text>
        </Pressable>

        <Pressable
          onPress={completeSmsTracking}
          className="py-4 mt-2"
        >
          <Text className="text-on-surface-variant font-body-medium text-sm text-center">Not Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}