import React from 'react';
import { View } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepIndicator({ currentStep, totalSteps = 3 }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View
      className="flex-row items-center gap-2"
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
      accessibilityValue={{ min: 1, max: totalSteps, now: currentStep }}
    >
      {steps.map((step) => {
        const isActive = step === currentStep;
        return (
          <View
            key={step}
            className={`flex-1 rounded-full ${isActive ? 'bg-gold h-2' : 'bg-border h-1.5'}`}
          />
        );
      })}
    </View>
  );
}
