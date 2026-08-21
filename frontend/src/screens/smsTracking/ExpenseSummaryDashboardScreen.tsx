import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Home,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/ui/Card';
import { DonutChart, DonutLegend } from '../../components/ui/charts/DonutChart';
import { BarChart } from '../../components/ui/charts/BarChart';
import { AreaSparkline } from '../../components/ui/charts/AreaSparkline';
import { RootStackParamList } from '../../navigation/types';
import { SmsTrackingCategory } from '../../types';
import { useSmsTrackingStore } from '../../store/smsTrackingStore';
import { useAuthStore } from '../../store/authStore';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatCurrency';

const CATEGORY_COLORS: Record<SmsTrackingCategory, string> = {
  Food: '#3FA96A',
  Shopping: '#005c55',
  Transport: '#5FA8D3',
  Travel: '#5FA8D3',
  Bills: '#C9A44C',
  Entertainment: '#8B7CF6',
  Education: '#7948e3',
  Healthcare: '#D9564B',
  Investment: '#C9A44C',
  Others: '#6e7977',
};

const CATEGORY_ICONS: Record<SmsTrackingCategory, string> = {
  Food: '🍔',
  Shopping: '🛍️',
  Transport: '🚗',
  Travel: '✈️',
  Bills: '📄',
  Entertainment: '🎬',
  Education: '📚',
  Healthcare: '💊',
  Investment: '📈',
  Others: '📌',
};

const MONTHLY_TREND_DATA = [32000, 28500, 31000, 27000, 34000, 29500, 35500, 41000, 38000, 36500, 39000, 37800];

export function ExpenseSummaryDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const summary = useSmsTrackingStore((s) => s.summary);
  const reset = useSmsTrackingStore((s) => s.reset);
  const completeSmsTracking = useAuthStore((s) => s.completeSmsTracking);

  if (!summary) {
    return (
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background items-center justify-center">
        <Text className="text-on-surface-variant font-body text-sm">No summary data available.</Text>
        <Pressable
          onPress={() => {
            reset();
            navigation.navigate('Main', { screen: 'Home' });
          }}
          className="mt-4 bg-primary py-3 px-6 rounded-full"
        >
          <Text className="text-on-primary font-body-semibold text-sm">Go Home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const donutData = (Object.entries(summary.categorySpending) as [SmsTrackingCategory, number][])
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      label: category,
      value,
      color: CATEGORY_COLORS[category],
    }));

  const barData = donutData.map((d) => ({ label: d.label, value: d.value }));

  const goHome = () => {
    reset();
    completeSmsTracking();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-2">
        <Pressable
          onPress={goHome}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-surface-container-lowest border border-border items-center justify-center"
        >
          <ArrowLeft color="#131b2e" size={18} />
        </Pressable>
        <Text className="text-on-surface font-body-semibold text-sm">Expense Summary</Text>
        <Pressable
          onPress={goHome}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-primary items-center justify-center"
        >
          <Home color="#ffffff" size={18} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-2 pb-1">
          <Text className="text-on-surface font-heading-bold text-2xl">Your Monthly Overview</Text>
          <Text className="text-on-surface-variant font-body text-sm mt-1">July 2026</Text>
        </View>

        {/* Income / Expenses / Balance */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center">
                <ArrowUp color="#3FA96A" size={16} />
              </View>
              <Text className="text-on-surface-variant font-body-medium text-xs">Income</Text>
            </View>
            <Text className="text-on-surface font-heading-bold text-lg">{formatCompactCurrency(summary.totalIncome)}</Text>
          </View>
          <View className="flex-1 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-full bg-alert/10 items-center justify-center">
                <ArrowDown color="#D9564B" size={16} />
              </View>
              <Text className="text-on-surface-variant font-body-medium text-xs">Expenses</Text>
            </View>
            <Text className="text-on-surface font-heading-bold text-lg">{formatCompactCurrency(summary.totalExpenses)}</Text>
          </View>
          <View className="flex-1 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <Wallet color="#005c55" size={16} />
              </View>
              <Text className="text-on-surface-variant font-body-medium text-xs">Balance</Text>
            </View>
            <Text className="text-on-surface font-heading-bold text-lg">{formatCompactCurrency(summary.remainingBalance)}</Text>
          </View>
        </View>

        {/* AI Budget Score */}
        <Card className="p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Sparkles color="#C9A44C" size={18} />
              <Text className="text-on-surface font-heading-semibold text-base">AI Budget Score</Text>
            </View>
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary font-heading-bold text-lg">{summary.budgetScore}</Text>
            </View>
          </View>
          <View className="h-2.5 bg-surface-container rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${summary.budgetScore}%`,
                backgroundColor: summary.budgetScore >= 70 ? '#3FA96A' : summary.budgetScore >= 40 ? '#C9A44C' : '#D9564B',
              }}
            />
          </View>
          <Text className="text-on-surface-variant font-body text-xs mt-2">
            {summary.budgetScore >= 70
              ? 'Great job! Your spending is well within healthy limits.'
              : summary.budgetScore >= 40
              ? 'Moderate — consider reviewing your spending patterns.'
              : 'Attention needed — your expenses are high relative to income.'}
          </Text>
        </Card>

        {/* Spending Trends (Sparkline) */}
        <Card className="p-5">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <TrendingUp color="#005c55" size={18} />
              <Text className="text-on-surface font-heading-semibold text-base">Spending Trends</Text>
            </View>
          </View>
          <AreaSparkline
            data={MONTHLY_TREND_DATA}
            width={300}
            height={80}
            color="#005c55"
            filled
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-on-surface-variant font-body text-[10px]">Jan</Text>
            <Text className="text-on-surface-variant font-body text-[10px]">Jul</Text>
          </View>
        </Card>

        {/* Category-wise Spending */}
        <Card className="p-5">
          <Text className="text-on-surface font-heading-semibold text-base mb-4">Category-wise Spending</Text>
          <View className="items-center mb-4">
            <DonutChart
              data={donutData}
              size={160}
              strokeWidth={22}
              centerLabel="Total"
              centerValue={formatCompactCurrency(summary.totalExpenses)}
            />
          </View>
          <DonutLegend data={donutData} />
        </Card>

        {/* Monthly Expense Chart */}
        <Card className="p-5">
          <Text className="text-on-surface font-heading-semibold text-base mb-4">Monthly Expense Chart</Text>
          <BarChart
            data={barData}
            height={140}
            barColor="#005c55"
            formatValue={(v) => formatCompactCurrency(v)}
          />
        </Card>

        {/* Recent Transactions */}
        <Card className="p-5">
          <Text className="text-on-surface font-heading-semibold text-base mb-3">Recent Transactions</Text>
          <View className="gap-3">
            {summary.recentTransactions.slice(0, 5).map((txn) => (
              <View key={txn.id} className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-surface-container items-center justify-center">
                  <Text className="text-sm">{CATEGORY_ICONS[txn.category]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-on-surface font-body-medium text-sm">{txn.merchant}</Text>
                  <Text className="text-on-surface-variant font-body text-xs">{txn.category} • {txn.date}</Text>
                </View>
                <Text className={`font-mono-semibold text-sm ${txn.type === 'credit' ? 'text-success' : 'text-on-surface'}`}>
                  {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Savings Suggestions */}
        <Card className="p-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Lightbulb color="#C9A44C" size={18} />
            <Text className="text-on-surface font-heading-semibold text-base">Savings Suggestions</Text>
          </View>
          <View className="gap-3">
            {summary.savingsSuggestions.slice(0, 3).map((suggestion, i) => (
              <View key={`savings-${i}`} className="flex-row items-start gap-3">
                <View className="w-6 h-6 rounded-full bg-accent/10 items-center justify-center mt-0.5">
                  <Text className="text-accent font-heading-bold text-xs">{i + 1}</Text>
                </View>
                <Text className="text-on-surface-variant font-body text-xs flex-1 leading-4">{suggestion}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Continue Button */}
        <Pressable
          onPress={goHome}
          className="w-full bg-primary py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:opacity-90"
        >
          <Text className="text-on-primary font-heading-semibold text-lg">Go to Home</Text>
          <ChevronRight color="#ffffff" size={20} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}