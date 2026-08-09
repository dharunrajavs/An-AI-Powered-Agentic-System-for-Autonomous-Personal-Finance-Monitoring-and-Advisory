import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { sendOtp, signUp, verifyOtp } from '../../services';

export function OtpVerificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'OtpVerification'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'OtpVerification'>>();
  const { phone, email, password, name, devOtp } = route.params;

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.trim().length < 4) return;
    setIsVerifying(true);
    setError('');
    try {
      const result = await verifyOtp(phone, otp.trim(), name, email);
      if (result.success) {
        await signUp(email, password, name);
        useAuthStore.getState().signUpWithPhone(email, name);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await sendOtp(phone);
      setCountdown(60);
      setCanResend(false);
      setOtp('');
      setError('');
    } catch {
      setError('Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-surface-container-lowest border border-border items-center justify-center"
        >
          <ArrowLeft color="#131b2e" size={18} />
        </Pressable>
      </View>

      <Animated.View style={{ opacity: fadeAnim }} className="flex-1 px-6">
        <Text className="text-on-surface font-heading-bold text-2xl mb-2">Verify Phone Number</Text>
        <Text className="text-on-surface-variant font-body text-sm mb-8">
          An OTP has been sent to <Text className="text-primary font-body-semibold">+91 {phone}</Text>
        </Text>

        <View className="gap-4">
          <View className="items-center">
            <TextInput
              value={otp}
              onChangeText={(v) => { setOtp(v); setError(''); }}
              placeholder="000000"
              placeholderTextColor="#bdc9c6"
              keyboardType="number-pad"
              maxLength={6}
              className="w-full bg-[#F3F4F6] rounded-2xl px-4 py-4 text-on-surface font-body text-xl text-center tracking-[10px]"
            />
            <Text className="text-on-surface-variant font-body text-xs mt-3">
              {countdown > 0
                ? `Resend OTP in ${countdown}s`
                : 'Didn\'t receive the OTP?'}
            </Text>
            {canResend && (
              <Pressable onPress={handleResend} className="py-2">
                <Text className="text-primary font-body-semibold text-sm">Resend OTP</Text>
              </Pressable>
            )}
          </View>

          {error ? (
            <View className="bg-alert/10 border border-alert/30 rounded-2xl p-3">
              <Text className="text-alert font-body-medium text-sm text-center">{error}</Text>
            </View>
          ) : null}

          {devOtp ? (
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-3">
              <Text className="text-primary font-body-medium text-sm text-center">
                Dev mode — OTP: <Text className="font-heading-bold">{devOtp}</Text>
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleVerify}
            disabled={otp.trim().length < 4 || isVerifying}
            className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90 disabled:opacity-50"
          >
            <CheckCircle color="#ffffff" size={18} />
            <Text className="text-on-primary font-heading-semibold text-base">
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}