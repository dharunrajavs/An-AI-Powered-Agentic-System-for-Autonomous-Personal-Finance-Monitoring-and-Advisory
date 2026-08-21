import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/types';
import { BiometricButton } from '../../components/auth/BiometricButton';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const signIn = useAuthStore((state) => state.signIn);
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const email = watch('email');

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
    } catch (e: any) {
      Alert.alert('Sign in failed', e?.message ?? 'An error occurred');
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center px-6 py-10">
            <View className="w-full max-w-md rounded-[32px] border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">

              <View className="mb-8 items-center">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary-container shadow-md">
                  <Text className="font-heading-bold text-2xl text-on-primary-container">$</Text>
                </View>
                <Text className="font-heading-bold text-3xl text-on-surface">Welcome back</Text>
                <Text className="mt-1 font-body text-sm text-on-surface-variant">Sign in to continue</Text>
              </View>

              <View className="w-full">
                <Text className="mb-1.5 font-body-medium text-xs text-on-surface-variant px-1">Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-row items-center rounded-[16px] border border-border bg-surface-container-low px-4">
                      <Mail color="#6e7977" size={18} />
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="name@example.com"
                        placeholderTextColor="#6e7977"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        accessibilityLabel="Email address"
                        className="ml-3 flex-1 py-4 font-body text-on-surface"
                      />
                    </View>
                  )}
                />
                {errors.email ? <Text className="mt-1 font-body text-xs text-alert px-1">{errors.email.message}</Text> : null}

                <Text className="mb-1.5 mt-4 font-body-medium text-xs text-on-surface-variant px-1">Password</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-row items-center rounded-[16px] border border-border bg-surface-container-low px-4">
                      <Lock color="#6e7977" size={18} />
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="••••••••"
                        placeholderTextColor="#6e7977"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        accessibilityLabel="Password"
                        className="ml-3 flex-1 py-4 font-body text-on-surface"
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
                {errors.password ? <Text className="mt-1 font-body text-xs text-alert px-1">{errors.password.message}</Text> : null}

                <Pressable
                  onPress={() => navigation.navigate('ForgotPassword')}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                  className="mt-2 self-end"
                >
                  <Text className="font-body-medium text-xs text-primary">Forgot password?</Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                  className={`mt-6 items-center rounded-full bg-primary py-4 shadow-lg active:scale-[0.98] active:opacity-90 ${isSubmitting ? 'opacity-70' : ''}`}
                >
                  <Text className="font-heading-semibold text-base text-on-primary">Sign In</Text>
                </Pressable>

                <BiometricButton onSuccess={() => login(email || 'demo@financeadvisor.app')} />
              </View>

              <Pressable
                onPress={() => navigation.navigate('SignUp')}
                accessibilityRole="button"
                accessibilityLabel="Go to sign up"
                className="mt-8"
              >
                <Text className="font-body text-sm text-on-surface-variant text-center">
                  Don&apos;t have an account?{' '}
                  <Text className="font-body-medium text-primary">Sign up</Text>
                </Text>
              </Pressable>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
