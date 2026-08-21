import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useUiStore } from '../../store/uiStore';
import { AuthStackParamList } from '../../navigation/types';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>>();
  const showToast = useUiStore((state) => state.showToast);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = () => {
    // Mock flow: there's no real email/reset system, so we just acknowledge and back out.
    showToast("If an account exists for that email, we've sent a reset link.", 'info');
    navigation.goBack();
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
            <View className="w-full max-w-md rounded-[32px] border border-border bg-surface-container-lowest p-6 shadow-sm">
              <Pressable
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="button"
                accessibilityLabel="Back to log in"
                className="mb-6 flex-row items-center self-start"
              >
                <ArrowLeft color="#6e7977" size={18} />
                <Text className="ml-2 font-body-medium text-sm text-on-surface-variant">Back to log in</Text>
              </Pressable>

              <View className="mb-8 items-center">
                <Text className="font-heading-bold text-3xl text-on-surface">
                  Reset <Text className="text-primary">Password</Text>
                </Text>
                <Text className="mt-2 px-4 text-center font-body text-sm text-on-surface-variant">
                  Enter the email linked to your account and we&apos;ll send you a reset link.
                </Text>
              </View>

              <View className="w-full">
                <Text className="mb-1.5 font-body-medium text-xs text-on-surface-variant">Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="flex-row items-center rounded-xl border border-border bg-surface-container-low px-4">
                      <Mail color="#6e7977" size={18} />
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="you@example.com"
                        placeholderTextColor="#6e7977"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        accessibilityLabel="Email address"
                        className="ml-3 flex-1 py-3.5 font-body text-on-surface"
                      />
                    </View>
                  )}
                />
                {errors.email ? <Text className="mt-1 font-body text-xs text-alert">{errors.email.message}</Text> : null}

                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Send reset link"
                  className={`mt-6 items-center rounded-xl bg-primary py-4 active:opacity-90 ${isSubmitting ? 'opacity-70' : ''}`}
                >
                  <Text className="font-heading-semibold text-base text-on-primary">Send Reset Link</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
