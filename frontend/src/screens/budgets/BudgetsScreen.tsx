import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Pencil, Plus, Sparkles, Wallet } from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import React, { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BudgetForm, BudgetFormHandle } from '../../components/budgets/BudgetForm';
import { DonutChart } from '../../components/ui/charts/DonutChart';
import { useBudgets } from '../../hooks';
import { formatCurrency } from '../../utils/formatCurrency';

const BUDGET_ICONS: Record<string, string> = {
  Shopping: '\u{1F6CD}',
  'Dining Out': '\u{1F37D}',
  'Food & Dining': '\u{1F37D}',
  Transport: '\u{1F697}',
  Entertainment: '\u{1F3AC}',
  default: '\u{1F4B3}',
};

function BudgetCard({ budget, icon, pct, color, isOver, aiSuggested, onPress, onEdit }: any) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-surface p-4 rounded-xl ${isOver ? 'border-2 border-error/20' : 'border border-outline-variant'} active:opacity-80`}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center gap-2">
          <View className={`w-10 h-10 rounded-lg items-center justify-center ${aiSuggested ? 'bg-tertiary-container/10' : isOver ? 'bg-error-container/50' : 'bg-surface-container-high'}`}>
            <Text className="text-lg">{icon}</Text>
          </View>
          <View>
            <Text className="text-on-surface font-heading-semibold text-sm">{budget.category}</Text>
            <Text className="text-on-surface-variant font-body text-xs">{formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {isOver ? (
            <Text className="text-alert font-heading-semibold text-xs">Over by {formatCurrency(budget.spent - budget.limit)}</Text>
          ) : (
            <Text className="text-on-surface-variant font-body text-xs">{pct}%</Text>
          )}
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${budget.category} budget`}
            className="w-7 h-7 rounded-full bg-surface-container-high items-center justify-center active:opacity-70"
          >
            <Pencil color="#3e4947" size={13} />
          </Pressable>
        </View>
      </View>
      <View className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: isOver ? '#ba1a1a' : color,
          }}
        />
      </View>
      {aiSuggested ? (
        <View className="flex-row items-center gap-1 mt-2 self-start bg-tertiary-container px-2 py-0.5 rounded-full">
          <Sparkles color="#6029c9" size={10} />
          <Text className="text-tertiary font-body-bold text-[9px]">AI suggested</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function BudgetsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const budgetsQuery = useBudgets();
  const budgetFormRef = useRef<BudgetFormHandle>(null);

  const budgets = budgetsQuery.data ?? [];

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const usedPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const colors = ['#FFB01F', '#ba1a1a', '#006c49', '#6029c9'];
  const getColor = (i: number) => colors[i % colors.length];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <View className="flex-row items-center gap-2">
            <Wallet color="#005c55" size={22} />
            <Text className="text-primary font-heading-bold text-lg">FinSense</Text>
          </View>

        </View>

        {/* Budgets */}
        <View className="px-5 gap-4">
          {/* Summary Card */}
          <View className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex-row items-center gap-4">
            <View className="items-center justify-center">
              <DonutChart
                data={[
                  { label: 'Used', value: usedPct, color: '#005c55' },
                  { label: 'Remaining', value: Math.max(100 - usedPct, 0), color: '#e7eefe' },
                ]}
                size={100}
                strokeWidth={14}
                centerValue={`${usedPct}%`}
                centerLabel="Used"
              />
            </View>
            <View className="flex-1">
              <Text className="text-on-surface-variant font-body-medium text-[10px] uppercase tracking-wider">
                Spent of limit
              </Text>
              <Text className="text-on-surface font-heading-bold text-lg">{formatCurrency(totalSpent)} of {formatCurrency(totalLimit)}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Text className="text-on-surface-variant font-body text-xs">9 days left in period</Text>
              </View>
              <View className="flex-row gap-1.5 mt-2">
                <View className="bg-secondary-container/30 px-3 py-1 rounded-full">
                  <Text className="text-on-secondary-container font-body-medium text-[10px]">Healthy Pace</Text>
                </View>
                <View className="bg-tertiary/5 border border-tertiary/20 px-3 py-1 rounded-full flex-row items-center gap-1">
                  <Sparkles color="#6029c9" size={10} />
                  <Text className="text-tertiary font-body-medium text-[10px]">Smart Limit Active</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Budget List */}
          {budgets.map((b, i) => {
            const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
            const isOver = b.spent > b.limit;
            return (
              <BudgetCard
                key={b.id}
                budget={b}
                icon={BUDGET_ICONS[b.category] ?? BUDGET_ICONS.default}
                pct={pct}
                color={getColor(i)}
                isOver={isOver}
                aiSuggested={i === 3}
                onPress={() => budgetFormRef.current?.present(b)}
                onEdit={() => budgetFormRef.current?.present(b)}
              />
            );
          })}

          {/* Subscriptions Link */}
          <Pressable
            onPress={() => navigation.navigate('Subscriptions')}
            className="flex-row items-center justify-between p-4 rounded-xl border border-tertiary/20 active:bg-tertiary/5"
            style={{ backgroundColor: 'rgba(240,230,255,0.3)' }}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-lg bg-tertiary/10 items-center justify-center">
                <Text className="text-tertiary text-lg">{'\u{1F4CB}'}</Text>
              </View>
              <View>
                <Text className="text-tertiary font-heading-semibold text-sm">Subscriptions</Text>
                <Text className="text-on-surface-variant font-body text-xs">Manage your recurring payments</Text>
              </View>
            </View>
            <ChevronRight color="#6029c9" size={20} />
          </Pressable>

          {/* Add Budget */}
          <Pressable
            onPress={() => budgetFormRef.current?.present()}
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-outline-variant active:bg-surface-container-low"
          >
            <Plus color="#6e7977" size={18} />
            <Text className="text-on-surface-variant font-body-medium text-sm">Add Budget</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => budgetFormRef.current?.present()}
        className="absolute bottom-6 right-5 w-14 h-14 bg-secondary-container rounded-full items-center justify-center shadow-lg active:scale-95"
      >
        <Plus color="#002113" size={24} />
      </Pressable>

      <BudgetForm ref={budgetFormRef} existingCategories={budgets.map((b) => b.category)} />
    </SafeAreaView>
  );
}
