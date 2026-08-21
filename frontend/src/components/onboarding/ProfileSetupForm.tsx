import { Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Card } from '../ui';

interface ProfileSetupFormProps {
  onContinue: () => void;
  onSkip: () => void;
}

const CURRENCIES = [
  { label: 'INR - Indian Rupee', symbol: '₹' },
  { label: 'USD - US Dollar', symbol: '$' },
  { label: 'EUR - Euro', symbol: '€' },
  { label: 'GBP - British Pound', symbol: '£' },
  { label: 'JPY - Japanese Yen', symbol: '¥' },
  { label: 'CAD - Canadian Dollar', symbol: 'CA$' },
];

const PAYMENT_METHODS = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking'];

const GOALS = ['Save more', 'Reduce debt', 'Track spending', 'Build emergency fund'];

export function ProfileSetupForm({ onContinue, onSkip }: ProfileSetupFormProps) {
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [income, setIncome] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);

  const currency = CURRENCIES[currencyIndex];

  return (
    <View className="gap-6">
      <View className="items-center gap-2 mb-1">
        <Text className="text-on-surface font-heading-bold text-2xl text-center">Tell us about you</Text>
        <Text className="text-on-surface-variant font-body text-sm text-center leading-5 px-4">
          This helps our AI personalize your financial dashboard and insights.
        </Text>
      </View>

      <Card className="gap-6">
        <View className="gap-2">
          <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wide">Primary Currency</Text>
          <Pressable
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            className="flex-row items-center justify-between bg-surface-container-low rounded-xl px-4 py-3.5"
          >
            <Text className="text-on-surface font-body text-sm">{currency.label}</Text>
            <Text className="text-on-surface-variant font-body text-sm">▼</Text>
          </Pressable>
          {showCurrencyPicker ? (
            <View className="bg-surface-container-low rounded-xl overflow-hidden">
              {CURRENCIES.map((c, i) => (
                <Pressable
                  key={c.label}
                  onPress={() => { setCurrencyIndex(i); setShowCurrencyPicker(false); }}
                  className={`px-4 py-3.5 border-b border-outline-variant/30 ${i === currencyIndex ? 'bg-primary/10' : ''}`}
                >
                  <Text className={`font-body text-sm ${i === currencyIndex ? 'text-primary font-body-semibold' : 'text-on-surface'}`}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View className="gap-2">
          <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wide">Payment Method</Text>
          <Pressable
            onPress={() => setShowPaymentPicker(!showPaymentPicker)}
            className="flex-row items-center justify-between bg-surface-container-low rounded-xl px-4 py-3.5"
          >
            <Text className="text-on-surface font-body text-sm">{paymentMethod ?? 'Select payment method'}</Text>
            <Text className="text-on-surface-variant font-body text-sm">▼</Text>
          </Pressable>
          {showPaymentPicker ? (
            <View className="bg-surface-container-low rounded-xl overflow-hidden">
              {PAYMENT_METHODS.map((method, i) => (
                <Pressable
                  key={method}
                  onPress={() => { setPaymentMethod(method); setShowPaymentPicker(false); }}
                  className={`px-4 py-3.5 border-b border-outline-variant/30 ${method === paymentMethod ? 'bg-primary/10' : ''}`}
                >
                  <Text className={`font-body text-sm ${method === paymentMethod ? 'text-primary font-body-semibold' : 'text-on-surface'}`}>
                    {method}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View className="gap-2">
          <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wide">Average Monthly Income</Text>
          <View className="flex-row items-center bg-surface-container-low rounded-xl px-4">
            <Text className="text-primary font-heading-bold text-lg opacity-50 mr-2">{currency.symbol}</Text>
            <TextInput
              value={income}
              onChangeText={setIncome}
              placeholder="0.00"
              placeholderTextColor="#bdc9c6"
              keyboardType="decimal-pad"
              className="flex-1 py-4 font-heading-bold text-lg text-on-surface"
            />
          </View>
          <Text className="text-on-surface-variant/70 font-body text-xs italic">Estimate based on your last 3 months</Text>
        </View>

        <View className="gap-3">
          <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wide">What's your primary goal?</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {GOALS.map((goal) => {
              const isActive = selectedGoal === goal;
              return (
                <Pressable
                  key={goal}
                  onPress={() => setSelectedGoal(goal)}
                  className={`px-4 py-2 rounded-full border ${
                    isActive
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant'
                  }`}
                >
                  <Text
                    className={`font-body-medium text-sm ${
                      isActive ? 'text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {goal}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      <View className="bg-white/70 rounded-xl p-4 flex-row items-start gap-3 border border-tertiary/10">
        <View className="w-8 h-8 rounded-full bg-tertiary-container items-center justify-center">
          <Sparkles color="#ffffff" size={16} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-on-surface-variant font-body text-xs leading-5">
            <Text className="text-tertiary font-body-semibold">Smart Sync: </Text>
            Connecting your details now allows our AI to forecast your savings growth with 94% accuracy.
          </Text>
        </View>
      </View>

      <View className="gap-4">
        <Pressable
          onPress={onContinue}
          className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
        >
          <Text className="text-on-primary font-heading-semibold text-base">Continue</Text>
          <Text className="text-on-primary font-heading-semibold text-base">→</Text>
        </Pressable>
        <Pressable onPress={onSkip} className="items-center py-2">
          <Text className="text-on-surface-variant font-body-medium text-sm">Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}
