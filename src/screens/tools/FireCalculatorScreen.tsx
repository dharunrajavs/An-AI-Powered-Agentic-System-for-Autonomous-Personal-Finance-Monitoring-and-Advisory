import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../hooks';
import { calculateFire, FireInputs, FireResults } from '../../utils/fireCalculator';
import { ArrowLeft } from 'lucide-react-native';

const DEFAULTS: FireInputs = {
  currentAge: 30,
  retirementAge: 55,
  currentSavings: 500000,
  monthlySavings: 25000,
  monthlyExpenses: 40000,
  expectedReturns: 12,
  inflationRate: 6,
  withdrawalRate: 4,
};

function formatIndian(num: number): string {
  return num.toLocaleString('en-IN');
}

export function FireCalculatorScreen() {
  const navigation = useNavigation();
  const { data: transactions = [] } = useTransactions();

  const [inputs, setInputs] = useState<FireInputs>(() => {
    const incomes = transactions.filter((t: any) => t.amount > 0);
    const expenses = transactions.filter((t: any) => t.amount < 0);
    const recentIncomes = incomes.slice(-3);
    const avgMonthlyIncome = recentIncomes.length > 0
      ? recentIncomes.reduce((s: number, t: any) => s + t.amount, 0) / recentIncomes.length
      : 0;
    const recentExpenses = expenses.slice(-3);
    const avgMonthlyExpense = recentExpenses.length > 0
      ? Math.abs(recentExpenses.reduce((s: number, t: any) => s + t.amount, 0)) / recentExpenses.length
      : 0;

    return {
      ...DEFAULTS,
      monthlySavings: avgMonthlyIncome > 0 ? Math.round(avgMonthlyIncome * 0.3) : DEFAULTS.monthlySavings,
      monthlyExpenses: avgMonthlyExpense > 0 ? Math.round(avgMonthlyExpense) : DEFAULTS.monthlyExpenses,
      currentSavings: DEFAULTS.currentSavings,
    };
  });

  const results = useMemo(() => calculateFire(inputs), [inputs]);

  const update = (key: keyof FireInputs, value: string) => {
    const num = Number(value.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) setInputs((prev) => ({ ...prev, [key]: num }));
  };

  const InputField = ({
    label,
    value,
    onChange,
    suffix,
  }: {
    label: string;
    value: number;
    onChange: (v: string) => void;
    suffix?: string;
  }) => (
    <View className="mb-3">
      <Text className="text-on-surface-variant font-body-medium text-xs mb-1">{label}</Text>
      <View className="flex-row items-center bg-surface-container-low border border-outline-variant/30 rounded-xl px-3">
        <TextInput
          value={String(value)}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          className="flex-1 py-3 text-on-surface font-mono text-sm"
        />
        {suffix && <Text className="text-on-surface-variant font-body text-xs ml-1">{suffix}</Text>}
      </View>
    </View>
  );

  const StatBox = ({ label, value, color = 'text-on-surface' }: { label: string; value: string; color?: string }) => (
    <View className="flex-1 bg-surface-container-low rounded-xl p-3 border border-outline-variant/30">
      <Text className="text-on-surface-variant font-body text-[10px] mb-1">{label}</Text>
      <Text className={`font-heading-bold text-base ${color}`}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-surface">
      <View className="px-4 py-3 flex-row items-center gap-3 border-b border-border">
        <Pressable onPress={() => navigation.goBack()} className="p-1">
          <ArrowLeft color="#131b2e" size={22} />
        </Pressable>
        <Text className="text-on-surface font-heading-semibold text-lg">FIRE Calculator</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 pb-32" contentContainerStyle={{ gap: 12 }}>
        <Text className="text-on-surface-variant font-body text-xs leading-4">
          Estimate when you can achieve Financial Independence and Retire Early.
        </Text>

        <View className="bg-surface-container-lowest rounded-2xl border border-border p-4">
          <Text className="text-on-surface font-heading-semibold text-sm mb-3">Your Profile</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <InputField label="Current Age" value={inputs.currentAge} onChange={(v) => update('currentAge', v)} suffix="yrs" />
            </View>
            <View className="flex-1">
              <InputField label="Retirement Age" value={inputs.retirementAge} onChange={(v) => update('retirementAge', v)} suffix="yrs" />
            </View>
          </View>
          <InputField label="Current Savings (₹)" value={inputs.currentSavings} onChange={(v) => update('currentSavings', v)} />
          <InputField label="Monthly Savings (₹)" value={inputs.monthlySavings} onChange={(v) => update('monthlySavings', v)} />
          <InputField label="Monthly Expenses (₹)" value={inputs.monthlyExpenses} onChange={(v) => update('monthlyExpenses', v)} />
        </View>

        <View className="bg-surface-container-lowest rounded-2xl border border-border p-4">
          <Text className="text-on-surface font-heading-semibold text-sm mb-3">Assumptions</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <InputField label="Expected Returns" value={inputs.expectedReturns} onChange={(v) => update('expectedReturns', v)} suffix="%" />
            </View>
            <View className="flex-1">
              <InputField label="Inflation" value={inputs.inflationRate} onChange={(v) => update('inflationRate', v)} suffix="%" />
            </View>
          </View>
          <InputField label="Safe Withdrawal Rate" value={inputs.withdrawalRate} onChange={(v) => update('withdrawalRate', v)} suffix="%" />
        </View>

        <View className="bg-surface-container-lowest rounded-2xl border border-border p-4">
          <Text className="text-on-surface font-heading-semibold text-sm mb-3">Results</Text>

          <View className="flex-row gap-2 mb-2">
            <StatBox label="Years to Retirement" value={String(results.yearsToRetirement)} />
            <StatBox
              label="Status"
              value={results.isOnTrack ? 'On Track 🎯' : 'Behind 📉'}
              color={results.isOnTrack ? 'text-success' : 'text-alert'}
            />
          </View>

          <View className="flex-row gap-2 mb-2">
            <StatBox label="Corpus Needed (Today)" value={`₹${formatIndian(results.corpusNeeded)}`} />
            <StatBox label="Corpus Needed (At Retirement)" value={`₹${formatIndian(results.corpusNeededInflated)}`} />
          </View>

          <View className="flex-row gap-2 mb-2">
            <StatBox label="Projected Corpus" value={`₹${formatIndian(results.projectedCorpus)}`} color={results.isOnTrack ? 'text-success' : 'text-alert'} />
            <StatBox label="Monthly Savings Needed" value={`₹${formatIndian(results.monthlyInvestmentNeeded)}`} />
          </View>

          {!results.isOnTrack && results.shortfall > 0 && (
            <View className="bg-alert/10 rounded-xl p-3 mt-2 border border-alert/20">
              <Text className="text-alert font-body-semibold text-xs">Shortfall: ₹{formatIndian(results.shortfall)}</Text>
              <Text className="text-alert/80 font-body text-[10px] mt-1">
                Increase monthly savings by ₹{formatIndian(results.monthlyInvestmentNeeded - inputs.monthlySavings)} or consider higher returns / later retirement.
              </Text>
            </View>
          )}

          {results.isOnTrack && (
            <View className="bg-success/10 rounded-xl p-3 mt-2 border border-success/20">
              <Text className="text-success font-body-semibold text-xs">
                You're on track! Consider lowering your withdrawal rate for added safety.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
