import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AgentPreferencesForm } from '../../components/onboarding/AgentPreferencesForm';
import { ProfileSetupForm } from '../../components/onboarding/ProfileSetupForm';
import { StepIndicator } from '../../components/onboarding/StepIndicator';
import { useAuthStore } from '../../store';

type OnboardingStep = 1 | 2;

export function OnboardingScreen() {
  const [step, setStep] = useState<OnboardingStep>(1);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const goBack = () => setStep((prev) => (prev > 1 ? ((prev - 1) as OnboardingStep) : prev));

  const stepContent = (
    <>
      {step === 1 ? <ProfileSetupForm onContinue={() => setStep(2)} onSkip={completeOnboarding} /> : null}
      {step === 2 ? <AgentPreferencesForm onFinish={completeOnboarding} /> : null}
    </>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        {step > 1 ? (
          <Pressable
            onPress={goBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="w-9 h-9 rounded-full bg-surface-container-lowest border border-border items-center justify-center"
          >
            <ChevronLeft color="#131b2e" size={18} />
          </Pressable>
        ) : (
          <View className="w-9 h-9" />
        )}

        <View className="flex-1 mx-4">
          <StepIndicator currentStep={step} totalSteps={2} />
        </View>

        <Pressable onPress={completeOnboarding} accessibilityRole="button" accessibilityLabel="Skip onboarding">
          <Text className="text-on-surface-variant font-body-medium text-sm">Skip</Text>
        </Pressable>
      </View>

      {step === 1 ? (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {stepContent}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={16}
        >
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {stepContent}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
