import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Bell, Filter, Plus, Search, Wallet, X } from 'lucide-react-native';
import type { RootNavigationProp } from '../../navigation/types';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddTransactionSheet, AddTransactionHandle } from '../../components/transactions/AddTransactionSheet';
import { FilterSheet, FilterSheetHandle } from '../../components/transactions/FilterSheet';
import { TransactionDetail, TransactionDetailHandle } from '../../components/transactions/TransactionDetail';
import { useTransactions } from '../../hooks';
import { formatCurrency } from '../../utils/formatCurrency';
import { parseFlexibleDate } from '../../utils/formatDate';
import { useAuthStore } from '../../store/authStore';
import { useFilterStore } from '../../store/filterStore';

const CATEGORIES = ['All', 'This Month', 'Food & Dining', 'Shopping', 'Transport', 'Entertainment'];

const CATEGORY_ALIASES: Record<string, string> = {
  'Food & Drink': 'Food & Dining',
  Food: 'Food & Dining',
  Dining: 'Food & Dining',
  'Food & Dining': 'Food & Dining',
};

function normalizeCategory(cat: string): string {
  return CATEGORY_ALIASES[cat] ?? cat;
}

function matchesSelectedCategory(selected: string[], txnCategory: string): boolean {
  const norm = normalizeCategory(txnCategory);
  return selected.some((sel) => normalizeCategory(sel) === norm);
}

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Drink': '🍽️',
  'Food & Dining': '🍽️',
  Shopping: '🛍️',
  Transport: '🚗',
  Entertainment: '🎬',
  Income: '💰',
  default: '💳',
};

function groupByDate(transactions: any[]) {
  const groups: Record<string, any[]> = {};
  if (!Array.isArray(transactions)) return groups;
  for (const t of transactions) {
    if (!t) continue;
    const label = t.date ? (isToday(t.date) ? 'Today' : isYesterday(t.date) ? 'Yesterday' : t.date) : 'Other';
    if (!groups[label]) groups[label] = [];
    groups[label].push(t);
  }
  return groups;
}

function isToday(dateStr: string) {
  const d = parseFlexibleDate(dateStr);
  const t = new Date();
  return !isNaN(d.getTime()) && d.toDateString() === t.toDateString();
}

function isYesterday(dateStr: string) {
  const d = parseFlexibleDate(dateStr);
  const t = new Date();
  t.setDate(t.getDate() - 1);
  return !isNaN(d.getTime()) && d.toDateString() === t.toDateString();
}

export function TransactionsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { data, isLoading, isError, refetch } = useTransactions();
  const searchQuery = useFilterStore((s) => s.searchQuery);
  const selectedCategories = useFilterStore((s) => s.selectedCategories);
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);
  const setSelectedCategories = useFilterStore((s) => s.setSelectedCategories);
  const clearFilters = useFilterStore((s) => s.clearFilters);
  const hasActiveFilters = useFilterStore((s) => s.hasActiveFilters());
  const dateRange = useFilterStore((s) => s.dateRange);
  const amountRange = useFilterStore((s) => s.amountRange);
  const paymentMethod = useFilterStore((s) => s.paymentMethod);
  const sortBy = useFilterStore((s) => s.sortBy);

  const detailRef = useRef<TransactionDetailHandle>(null);
  const addRef = useRef<AddTransactionHandle>(null);
  const filterRef = useRef<FilterSheetHandle>(null);
  const [metaFilter, setMetaFilter] = useState('All');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.merchant?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q),
      );
    }

    if (metaFilter === 'This Month') {
      const now = new Date();
      result = result.filter((t) => {
        const d = parseFlexibleDate(t.date);
        return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    if (selectedCategories.length > 0) {
      result = result.filter((t) => matchesSelectedCategory(selectedCategories, t.category));
    }

    if (dateRange.start) result = result.filter((t) => t.date >= dateRange.start!);
    if (dateRange.end) result = result.filter((t) => t.date <= dateRange.end!);

    if (amountRange.min !== null) result = result.filter((t) => Math.abs(t.amount) >= amountRange.min!);
    if (amountRange.max !== null) result = result.filter((t) => Math.abs(t.amount) <= amountRange.max!);

    if (paymentMethod !== 'all') result = result.filter((t) => t.paymentMethod === paymentMethod);

    result.sort((a, b) => {
      const ta = parseFlexibleDate(a.date).getTime() || 0;
      const tb = parseFlexibleDate(b.date).getTime() || 0;
      switch (sortBy) {
        case 'oldest': return ta - tb;
        case 'highest': return Math.abs(b.amount) - Math.abs(a.amount);
        case 'lowest': return Math.abs(a.amount) - Math.abs(b.amount);
        default: return tb - ta;
      }
    });

    return result;
  }, [data, searchQuery, metaFilter, selectedCategories, dateRange, amountRange, paymentMethod, sortBy]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const totalSpent = useMemo(
    () => filtered.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [filtered]
  );

  const totalIncome = useMemo(
    () => filtered.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    [filtered]
  );

  const handleDevReset = () => {
    Alert.alert('Reset app state', 'This will clear all data and restart the onboarding flow.', [
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
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <Pressable onLongPress={handleDevReset} className="flex-row items-center gap-2">
            <Wallet color="#005c55" size={22} />
            <Text className="text-primary font-heading-bold text-lg">FinSense</Text>
          </Pressable>
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => setShowSearch((s) => !s)}>
              <Search color="#3e4947" size={20} />
            </Pressable>
            <Pressable onPress={() => filterRef.current?.present()} className="relative">
              <Filter color="#3e4947" size={20} />
              {hasActiveFilters && (
                <View className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-alert items-center justify-center">
                  <Text className="text-[8px] text-white font-body-bold">!</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Notifications')}>
              <Bell color="#3e4947" size={20} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View className="px-5 mb-3">
            <View className="flex-row items-center gap-2 bg-surface-container p-3 rounded-xl border border-outline-variant/30">
              <Search color="#6e7977" size={18} />
              <TextInput
                className="flex-1 text-on-surface font-body text-sm"
                placeholder="Search merchants, categories..."
                placeholderTextColor="#6e7977"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.trim() !== '' && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X color="#6e7977" size={18} />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Header */}
        <View className="px-5 mb-4">
          <Text className="text-on-surface font-heading-bold text-2xl mb-2">Transactions</Text>
          <View className="flex-row items-center justify-between bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
            <View className="flex-row items-center gap-2">
              <Text className="text-on-surface-variant font-body text-xs">
                {filtered.length} transactions ·{' '}
                <Text className="text-secondary font-heading-semibold">{formatCurrency(totalIncome)} income</Text>
                {' '}·{' '}
                <Text className="text-alert font-heading-semibold">{formatCurrency(totalSpent)} spent</Text>
              </Text>
              {hasActiveFilters && (
                <Pressable onPress={() => { clearFilters(); setMetaFilter('All'); }}>
                  <X color="#6e7977" size={14} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={() => navigation.navigate('Insights')}>
              <Text className="text-primary font-body-medium text-xs">View Insights</Text>
            </Pressable>
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          className="mb-4"
        >
          {CATEGORIES.map((cat) => {
            const isMeta = cat === 'All' || cat === 'This Month';
            const isActive = isMeta ? metaFilter === cat : selectedCategories.includes(cat);
            return (
              <Pressable
                key={cat}
                onPress={() => {
                  if (isMeta) {
                    clearFilters();
                    setMetaFilter(cat);
                  } else {
                    setMetaFilter('All');
                    setSelectedCategories(
                      selectedCategories.length === 1 && selectedCategories[0] === cat
                        ? []
                        : [cat],
                    );
                  }
                }}
                className={`px-4 py-2 rounded-full ${isActive ? 'bg-primary' : 'bg-surface-container'}`}
              >
                <Text className={`font-body-medium text-sm ${isActive ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Transactions */}
        {isLoading ? (
          <View className="px-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} className="h-20 bg-surface-container-high rounded-xl animate-pulse" />
            ))}
          </View>
        ) : isError ? (
          <View className="px-5">
            <Text className="text-on-surface-variant font-body text-sm text-center">Could not load transactions.</Text>
            <Pressable onPress={() => refetch()} className="mt-3 items-center">
              <Text className="text-primary font-body-medium text-sm">Retry</Text>
            </Pressable>
          </View>
        ) : !grouped || typeof grouped !== 'object' || Object.keys(grouped).length === 0 ? (
          <View className="items-center justify-center py-16 px-8">
            <View className="w-40 h-40 rounded-full bg-surface-container-low items-center justify-center mb-6">
              <Text className="text-5xl opacity-80">📂</Text>
            </View>
            <Text className="text-on-surface font-heading-bold text-lg text-center">No transactions yet</Text>
            <Text className="text-on-surface-variant font-body text-sm text-center mt-2 max-w-xs">
              Link your bank account or add a transaction manually to see your financial story unfold.
            </Text>
            <Pressable
              onPress={() => addRef.current?.present()}
              className="mt-6 px-8 py-3 bg-primary rounded-full"
            >
              <Text className="text-on-primary font-body-semibold text-sm">Add Transaction</Text>
            </Pressable>
          </View>
        ) : grouped && typeof grouped === 'object' ? (
          <View className="px-5 gap-6">
            {Object.entries(grouped).map(([label, items]) => (
              <View key={label}>
                <View className="bg-background/80 py-2 border-b border-outline-variant/20 mb-2">
                  <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">{label}</Text>
                </View>
                <View className="gap-2">
                  {items.map((t: any, index: number) => {
                    const isIncome = t.amount > 0;
                    const isAnomaly = t.flagged || (Math.abs(t.amount) > 200 && !isIncome);
                    return (
                      <Pressable
                        key={`${label}-${t.id ?? index}`}
                        onPress={() => detailRef.current?.present(t)}
                        className={`bg-surface p-4 rounded-xl border ${isAnomaly ? 'border-l-4 border-l-[#ffb300]' : 'border-outline-variant/30'}`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-4">
                            <View
                              className={`w-12 h-12 rounded-xl items-center justify-center ${
                                isIncome ? 'bg-secondary-container/30' : 'bg-surface-container-high'
                              }`}
                            >
                              <Text className="text-lg">{CATEGORY_ICONS[t.category] ?? CATEGORY_ICONS.default}</Text>
                            </View>
                            <View>
                              <Text className="text-on-surface font-heading-semibold text-sm">{t.merchant}</Text>
                              <View className="flex-row items-center gap-2">
                                <Text className="text-on-surface-variant font-body text-xs">{t.category}</Text>
                                {t.source === 'sms' ? (
                                  <View className="px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                    <Text className="text-primary font-body-bold text-[9px]">SMS</Text>
                                  </View>
                                ) : (
                                  <View className="px-1.5 py-0.5 rounded-full bg-tertiary-container/10 border border-tertiary-container/20">
                                    <Text className="text-tertiary font-body-bold text-[9px]">AI</Text>
                                  </View>
                                )}
                              </View>
                              {isAnomaly ? (
                                <View className="flex-row items-center gap-1 mt-1">
                                  <Text className="text-[#b48000] font-body-bold text-[10px]">⚠ Higher than usual for this category</Text>
                                </View>
                              ) : null}
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className={`font-heading-semibold text-sm ${isIncome ? 'text-secondary' : 'text-alert'}`}>
                              {isIncome ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                            </Text>
                            <Text className="text-on-surface-variant font-body text-xs mt-0.5">{t.time ?? t.date}</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => addRef.current?.present()}
        className="absolute bottom-6 right-5 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-2xl active:scale-95"
        style={{ elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
      >
        <Plus color="#ffffff" size={26} />
      </Pressable>

      <TransactionDetail ref={detailRef} />
      <AddTransactionSheet ref={addRef} />
      <FilterSheet ref={filterRef} />
    </SafeAreaView>
  );
}
