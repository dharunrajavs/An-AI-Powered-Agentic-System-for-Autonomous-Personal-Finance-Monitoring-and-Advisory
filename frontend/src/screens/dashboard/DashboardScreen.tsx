import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Lightbulb,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import type { RootNavigationProp } from '../../navigation/types';
import React, { useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DonutChart, DonutLegend } from '../../components/ui/charts/DonutChart';
import { BarChart } from '../../components/ui/charts/BarChart';
import { AreaSparkline } from '../../components/ui/charts/AreaSparkline';
import { AddCashExpenseSheet, AddCashExpenseHandle } from '../../components/dashboard/AddCashExpenseSheet';
import { NetWorthCard } from '../../components/dashboard/NetWorthCard';
import { SpendingAlertsCard } from '../../components/dashboard/SpendingAlertsCard';
import { useAgentInsights, useProfile, useTransactions } from '../../hooks';
import { useAuthStore } from '../../store/authStore';
import { formatCompactCurrency, formatCurrency, generateSavingsSuggestions } from '../../utils';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#3FA96A',
  Shopping: '#005c55',
  Travel: '#5FA8D3',
  Bills: '#C9A44C',
  Entertainment: '#8B7CF6',
  Healthcare: '#D9564B',
  Others: '#6e7977',
};

export function DashboardScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { data: profile } = useProfile();
  const insightsQuery = useAgentInsights();
  const txnsQuery = useTransactions();
  const cashSheetRef = useRef<AddCashExpenseHandle>(null);

  const insights = insightsQuery.data ?? [];
  const txns = txnsQuery.data ?? [];

  const totalIncome = txns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = txns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalBalance = totalIncome - totalExpenses;

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTxns = txns.filter((t) => t.date?.startsWith(currentMonthKey));
  const monthIncome = monthTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const monthExpenses = monthTxns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const monthBalance = monthIncome - monthExpenses;
  const budgetScore = monthIncome > 0 ? Math.max(0, Math.round((1 - monthExpenses / monthIncome) * 100)) : 72;
  const savingsSuggestions = generateSavingsSuggestions(txns);

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthTxns = txns.filter((t) => t.date?.startsWith(lastMonthKey));
  const lastMonthNet = lastMonthTxns.reduce((s, t) => s + t.amount, 0);
  const thisMonthNet = monthIncome - monthExpenses;
  const monthDeltaPct =
    lastMonthNet !== 0 && lastMonthNet * thisMonthNet >= 0
      ? ((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100
      : 0;

  const trendMonths: { label: string; total: number }[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const total = txns
      .filter((t) => t.amount < 0 && t.date?.startsWith(key))
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    trendMonths.push({ label: d.toLocaleString('en', { month: 'short' }), total });
  }
  const monthlyTrend = trendMonths.map((m) => m.total);

  const categorySpending = txns
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const donutData = (Object.entries(categorySpending) as [string, number][])
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ label: k, value: v, color: CATEGORY_COLORS[k] ?? '#6e7977' }));

  const barData = donutData.map((d) => ({ label: d.label, value: d.value }));

  const handleDevReset = () => {
    Alert.alert('Reset app state', 'This will clear all data and restart the onboarding flow.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('finance-advisor-auth');
          useAuthStore.setState({
            hasSeenSplash: false,
            hasSeenCarousel: false,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            hasCompletedSyncing: false,
            hasCompletedSmsTracking: false,
            email: null,
            name: null,
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <View className="flex-row items-center gap-2">
            <Wallet color="#005c55" size={22} />
            <Pressable onLongPress={handleDevReset}>
              <Text className="text-primary font-heading-bold text-lg">FinSense</Text>
            </Pressable>
          </View>
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => navigation.navigate('Notifications')}>
              <View className="relative">
                <Bell color="#3e4947" size={20} />
                <View className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-alert border-2 border-background" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        <View className="px-5 mb-4">
          <Text className="text-on-surface font-heading-bold text-xl">
            Good morning, {profile?.name?.split(' ')[0] ?? 'Alex'}
          </Text>
          <Text className="text-on-surface-variant font-body text-sm">Your monthly financial overview</Text>
        </View>

        {/* Hero Card */}
        <View className="mx-5 bg-primary p-5 rounded-3xl overflow-hidden mb-4">
          <View className="absolute -right-16 -top-16 w-64 h-64 bg-primary-container rounded-full opacity-30" />
          <View className="relative z-10">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-on-primary font-body-medium text-xs opacity-90">Total Balance</Text>
                <Text className="text-on-primary font-heading-bold text-[40px] tracking-tight">
                  {formatCurrency(totalBalance)}
                </Text>
                <View className="flex-row items-center gap-1 bg-secondary-container/20 rounded-full px-2 py-1 mt-2 self-start">
                  <TrendingUp color="#a3faef" size={14} />
                  <Text className="text-on-primary font-body-medium text-xs">
                    {monthDeltaPct >= 0 ? '+' : ''}{monthDeltaPct.toFixed(1)}% this month
                  </Text>
                </View>
              </View>
              <Wallet color="#ffffff" size={24} opacity={0.4} />
            </View>
            <View className="flex-row gap-4 mt-5 border-t border-on-primary/10 pt-4">
              <View>
                <Text className="text-on-primary font-body-medium text-[10px] uppercase tracking-wider opacity-80">Income</Text>
                <Text className="text-on-primary font-heading-bold text-lg">{formatCurrency(totalIncome)}</Text>
              </View>
              <View>
                <Text className="text-on-primary font-body-medium text-[10px] uppercase tracking-wider opacity-80">Spent</Text>
                <Text className="text-on-primary font-heading-bold text-lg">{formatCurrency(totalExpenses)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 px-5 mb-5">
          <Pressable
            onPress={() => navigation.navigate('Advisor')}
            className="flex-1 flex-row items-center justify-center gap-2 bg-tertiary py-4 rounded-xl"
          >
            <Sparkles color="#ffffff" size={18} />
            <Text className="text-on-tertiary font-body-semibold text-sm">Ask AI</Text>
          </Pressable>
          <Pressable
            onPress={() => cashSheetRef.current?.present()}
            className="flex-1 flex-row items-center justify-center gap-2 border border-primary py-4 rounded-xl"
          >
            <Plus color="#005c55" size={18} />
            <Text className="text-primary font-body-semibold text-sm">Add Expense</Text>
          </Pressable>
        </View>

        {/* Monthly Overview Section */}
        <View className="px-5 mb-3">
          <Text className="text-on-surface font-heading-bold text-lg">Monthly Overview</Text>
        </View>

        {/* Income / Expenses / Balance */}
        <View className="flex-row gap-3 px-5 mb-4">
          <View className="flex-1 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center">
                <ArrowUp color="#3FA96A" size={16} />
              </View>
              <Text className="text-on-surface-variant font-body-medium text-xs">Income</Text>
            </View>
            <Text className="text-on-surface font-heading-bold text-lg">{formatCompactCurrency(monthIncome)}</Text>
          </View>
          <View className="flex-1 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-full bg-alert/10 items-center justify-center">
                <ArrowDown color="#D9564B" size={16} />
              </View>
              <Text className="text-on-surface-variant font-body-medium text-xs">Expenses</Text>
            </View>
            <Text className="text-on-surface font-heading-bold text-lg">{formatCompactCurrency(monthExpenses)}</Text>
          </View>
          <View className="flex-1 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <Wallet color="#005c55" size={16} />
              </View>
              <Text className="text-on-surface-variant font-body-medium text-xs">Balance</Text>
            </View>
            <Text className="text-on-surface font-heading-bold text-lg">{formatCompactCurrency(monthBalance)}</Text>
          </View>
        </View>

        {/* AI Budget Score */}
        <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Sparkles color="#C9A44C" size={16} />
              <Text className="text-on-surface font-heading-semibold text-sm">AI Budget Score</Text>
            </View>
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary font-heading-bold text-lg">{budgetScore}</Text>
            </View>
          </View>
          <View className="h-2.5 bg-surface-container rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${budgetScore}%`,
                backgroundColor: budgetScore >= 70 ? '#3FA96A' : budgetScore >= 40 ? '#C9A44C' : '#D9564B',
              }}
            />
          </View>
          <Text className="text-on-surface-variant font-body text-xs mt-2">
            {budgetScore >= 70
              ? 'Great job! Your spending is well within healthy limits.'
              : budgetScore >= 40
              ? 'Moderate — consider reviewing your spending patterns.'
              : 'Attention needed — your expenses are high relative to income.'}
          </Text>
        </View>

        {/* Spending Trends */}
        <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-3">
            <TrendingUp color="#005c55" size={16} />
            <Text className="text-on-surface font-heading-semibold text-sm">Spending Trends</Text>
          </View>
          <AreaSparkline data={monthlyTrend} width={300} height={72} color="#005c55" filled />
          <View className="flex-row justify-between mt-1">
            <Text className="text-on-surface-variant font-body text-[10px]">{trendMonths[0]?.label ?? 'Jan'}</Text>
            <Text className="text-on-surface-variant font-body text-[10px]">{trendMonths[trendMonths.length - 1]?.label ?? 'Jul'}</Text>
          </View>
        </View>

        {/* Category-wise Spending */}
        <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
          <Text className="text-on-surface font-heading-semibold text-sm mb-3">Category-wise Spending</Text>
          {donutData.length > 0 && (
            <>
              <View className="items-center mb-3">
                <DonutChart data={donutData} size={150} strokeWidth={20} centerLabel="Total" centerValue={formatCompactCurrency(totalExpenses)} />
              </View>
              <DonutLegend data={donutData} />
            </>
          )}
        </View>

        {/* Monthly Expense Chart */}
        {barData.length > 0 && (
          <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
            <Text className="text-on-surface font-heading-semibold text-sm mb-3">Monthly Expense Chart</Text>
            <BarChart data={barData} height={120} barColor="#005c55" formatValue={(v) => formatCompactCurrency(v)} />
          </View>
        )}

        {/* Net Worth Timeline */}
        <NetWorthCard />

        {/* Spending Alerts */}
        <SpendingAlertsCard />

        {/* Savings Suggestions */}
        <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-3">
            <Lightbulb color="#C9A44C" size={16} />
            <Text className="text-on-surface font-heading-semibold text-sm">Savings Suggestions</Text>
          </View>
          <View className="gap-3">
            {savingsSuggestions.slice(0, 3).map((s: string, i: number) => (
              <View key={`savings-${i}`} className="flex-row items-start gap-3">
                <View className="w-6 h-6 rounded-full bg-accent/10 items-center justify-center mt-0.5">
                  <Text className="text-accent font-heading-bold text-xs">{i + 1}</Text>
                </View>
                <Text className="text-on-surface-variant font-body text-xs flex-1 leading-4">{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <View className="flex-row items-center gap-2">
              <Sparkles color="#7948e3" size={16} />
              <Text className="text-on-surface font-heading-semibold text-sm">AI Insights</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Insights')}>
              <Text className="text-primary font-body-medium text-xs">See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          >
            {insights.length > 0 ? insights.slice(0, 5).map((insight) => (
              <View
                key={insight.id}
                className="w-[280px] bg-white/70 p-4 rounded-2xl border-l-4"
                style={{
                  borderLeftColor: insight.severity === 'high' ? '#ba1a1a' : insight.severity === 'medium' ? '#006c49' : '#005c55',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text
                    className="font-body-medium text-xs"
                    style={{ color: insight.severity === 'high' ? '#ba1a1a' : insight.severity === 'medium' ? '#006c49' : '#005c55' }}
                  >
                    {insight.severity === 'high' ? '⚠ Alert' : insight.severity === 'medium' ? '👁 Watch' : '📈 Market'}
                  </Text>
                </View>
                <Text className="text-on-surface font-heading-semibold text-sm">{insight.type}</Text>
                <Text className="text-on-surface-variant font-body text-xs mt-1 leading-5" numberOfLines={3}>
                  {insight.message}
                </Text>
              </View>
            )) : (
              <>
                <View className="w-[280px] bg-white/70 p-4 rounded-2xl border-l-4 border-l-alert">
                  <Text className="text-alert font-body-medium text-xs">⚠ Alert</Text>
                  <Text className="text-on-surface font-heading-semibold text-sm mt-1">No new insights</Text>
                  <Text className="text-on-surface-variant font-body text-xs mt-1">You're all caught up!</Text>
                </View>
                <View className="w-[280px] bg-white/70 p-4 rounded-2xl border-l-4 border-l-secondary">
                  <Text className="text-secondary font-body-medium text-xs">👁 Watch</Text>
                  <Text className="text-on-surface font-heading-semibold text-sm mt-1">Over budget</Text>
                  <Text className="text-on-surface-variant font-body text-xs mt-1">You've spent 85% of your 'Dining Out' budget with 12 days left.</Text>
                </View>
                <View className="w-[280px] bg-white/70 p-4 rounded-2xl border-l-4 border-l-primary">
                  <Text className="text-primary font-body-medium text-xs">📈 Market</Text>
                  <Text className="text-on-surface font-heading-semibold text-sm mt-1">Price increase</Text>
                  <Text className="text-on-surface-variant font-body text-xs mt-1">Netflix subscription price increased by ₹2 starting next month.</Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      <AddCashExpenseSheet ref={cashSheetRef} />
    </SafeAreaView>
  );
}