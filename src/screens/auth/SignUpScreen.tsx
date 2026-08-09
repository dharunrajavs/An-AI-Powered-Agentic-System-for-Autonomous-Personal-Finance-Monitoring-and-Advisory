import AsyncStorage from '@react-native-async-storage/async-storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, Smartphone, Sparkles, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/types';
import { sendOtp } from '../../services';

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'SignUp'>>();
  const login = useAuthStore((state) => state.login);
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const handleDevReset = () => {
    Alert.alert(
      'Reset app state',
      'This will clear all data and restart the onboarding flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('finance-advisor-auth');
            useAuthStore.setState({
              hasSeenCarousel: false,
              isAuthenticated: false,
              hasCompletedOnboarding: false,
              hasCompletedSyncing: false,
            hasCompletedSmsTracking: false,
              email: null,
            });
          },
        },
      ]
    );
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      setIsSendingOtp(true);
      const result = await sendOtp(values.phone);
      const code = result.message ?? '';
      if (code.length === 6) setDevOtp(code);
      navigation.navigate('OtpVerification', {
        phone: values.phone,
        email: values.email,
        password: values.password,
        name: values.name,
        devOtp: code,
      });
    } catch (e: any) {
      Alert.alert('Failed to send OTP', e?.message ?? 'An error occurred');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const formContent = (
    <View className="w-full max-w-[440px]">
      {!isWide ? (
        <View className="flex-row items-center gap-2 mb-6 justify-center">
          <Pressable onLongPress={handleDevReset}>
            <Text className="text-primary font-heading-bold text-2xl">FinSense</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="mb-6">
        <Text className="text-on-surface font-heading-bold text-3xl mb-1">Create Account</Text>
        <Text className="text-on-surface-variant font-body text-sm">Start your journey to financial empowerment today.</Text>
      </View>

      <View className="gap-5">
        <View className="gap-1.5">
          <Text className="text-on-surface font-body-medium text-xs">Full Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl px-4">
                <User color="#6e7977" size={20} />
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="John Doe"
                  placeholderTextColor="#bdc9c6"
                  autoCapitalize="words"
                  textContentType="name"
                  accessibilityLabel="Full name"
                  className="flex-1 py-4 pl-3 font-body text-on-surface"
                />
              </View>
            )}
          />
          {errors.name ? <Text className="text-alert font-body text-xs">{errors.name.message}</Text> : null}
        </View>

        <View className="gap-1.5">
          <Text className="text-on-surface font-body-medium text-xs">Email Address</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl px-4">
                <Mail color="#6e7977" size={20} />
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="name@company.com"
                  placeholderTextColor="#bdc9c6"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  accessibilityLabel="Email address"
                  className="flex-1 py-4 pl-3 font-body text-on-surface"
                />
              </View>
            )}
          />
          {errors.email ? <Text className="text-alert font-body text-xs">{errors.email.message}</Text> : null}
        </View>

        <View className="gap-1.5">
          <Text className="text-on-surface font-body-medium text-xs">Phone Number</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl px-4">
                <Smartphone color="#6e7977" size={20} />
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="9876543210"
                  placeholderTextColor="#bdc9c6"
                  keyboardType="phone-pad"
                  maxLength={10}
                  textContentType="telephoneNumber"
                  accessibilityLabel="Phone number"
                  className="flex-1 py-4 pl-3 font-body text-on-surface"
                />
              </View>
            )}
          />
          {errors.phone ? <Text className="text-alert font-body text-xs">{errors.phone.message}</Text> : null}
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 gap-1.5">
            <Text className="text-on-surface font-body-medium text-xs">Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl px-4">
                  <Lock color="#6e7977" size={20} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="••••••••"
                    placeholderTextColor="#bdc9c6"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    accessibilityLabel="Password"
                    className="flex-1 py-4 pl-3 font-body text-on-surface"
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    hitSlop={8}
                  >
                    {showPassword ? <EyeOff color="#6e7977" size={18} /> : <Eye color="#6e7977" size={18} />}
                  </Pressable>
                </View>
              )}
            />
            {errors.password ? <Text className="text-alert font-body text-xs">{errors.password.message}</Text> : null}
          </View>

          <View className="flex-1 gap-1.5">
            <Text className="text-on-surface font-body-medium text-xs">Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="flex-row items-center bg-[#F3F4F6] rounded-2xl px-4">
                  <Lock color="#6e7977" size={20} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="••••••••"
                    placeholderTextColor="#bdc9c6"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    accessibilityLabel="Confirm password"
                    className="flex-1 py-4 pl-3 font-body text-on-surface"
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                    hitSlop={8}
                  >
                    {showConfirmPassword ? <EyeOff color="#6e7977" size={18} /> : <Eye color="#6e7977" size={18} />}
                  </Pressable>
                </View>
              )}
            />
            {errors.confirmPassword ? <Text className="text-alert font-body text-xs">{errors.confirmPassword.message}</Text> : null}
          </View>
        </View>

        <View className="flex-row items-start gap-2">
          <Pressable
            onPress={() => setTermsAccepted((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
            className={`w-5 h-5 rounded border mt-0.5 items-center justify-center ${termsAccepted ? 'bg-primary border-primary' : 'border-outline-variant'}`}
          >
            {termsAccepted ? <Text className="text-on-primary font-body-bold text-xs">✓</Text> : null}
          </Pressable>
          <Text className="flex-1 text-on-surface-variant font-body text-sm">
            I agree to the <Text className="text-primary font-body-semibold">Terms of Service</Text> and <Text className="text-primary font-body-semibold">Privacy Policy</Text>.
          </Text>
        </View>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || isSendingOtp || !termsAccepted}
          accessibilityRole="button"
          accessibilityLabel="Create account"
          className={`w-full bg-primary py-4 rounded-full items-center active:scale-[0.98] shadow-md ${isSubmitting || isSendingOtp || !termsAccepted ? 'opacity-70' : ''}`}
        >
          <Text className="text-on-primary font-body-semibold text-base">{isSendingOtp ? 'Sending OTP...' : 'Create Account'}</Text>
        </Pressable>

        {devOtp ? (
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-3 mt-2">
            <Text className="text-primary font-body-medium text-xs text-center">
              Dev mode — OTP: <Text className="font-heading-bold">{devOtp}</Text>
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-8 items-center">
        <Text className="text-on-surface-variant font-body text-sm">
          Already have an account?{' '}
          <Text
            className="text-primary font-body-bold"
            onPress={() => navigation.navigate('Login')}
          >
            Log in
          </Text>
        </Text>
      </View>
    </View>
  );

  if (isWide) {
    return (
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-surface flex-row">
        <View className="flex-1 relative bg-primary-container items-center justify-center px-10 overflow-hidden">
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1M_bvUzbuQV9054mPUBME5eOwFjaioyQal1vVv5BZF1svllK4bblx_RXgH6eei65uBWvz7H7gU0LZXJQ1vjlcefCgL-SQ1Gb2IUcybZOzawphh4RrosHRf7L1uv3uxpbxchcskBwFXxZfTurnkzVZT2tRDqKTqa6yT25z5mnztShE_CSwc_kLlFsWSHzYgeQHGjG337wkZqjjy9_T4fpgz3OKiRBCXVVxFV0fDNKRvnLg7XrTZ9F_IQ' }}
            className="absolute inset-0 opacity-40"
            resizeMode="cover"
          />
          <View className="relative z-10 max-w-lg">
            <Pressable onLongPress={handleDevReset}>
              <Text className="text-on-primary-container font-heading-bold text-[48px] tracking-tight mb-4">FinSense</Text>
            </Pressable>
            <Text className="text-on-primary-container font-heading-bold text-3xl mb-4">Master your wealth with AI-driven clarity.</Text>
            <Text className="text-on-primary-container font-body text-lg opacity-90 leading-relaxed">
              Join thousands of users who have transformed their financial future using our institutional-grade analysis and proactive AI insights.
            </Text>
            <View className="mt-10 bg-white/70 backdrop-blur p-4 rounded-xl flex-row items-start gap-3">
              <Sparkles color="#6029c9" size={24} />
              <View>
                <Text className="text-on-surface font-body-semibold text-sm mb-1">AI Insight Preview</Text>
                <Text className="text-on-surface-variant font-body text-xs">
                  "Your savings rate is 12% higher than similar profiles. Ready to optimize your portfolio?"
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 items-center justify-center px-10 py-10">
            {formContent}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-surface">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center px-6 py-10">
            {formContent}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
