import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useFilterStore, SortOption } from '../../store/filterStore';
import { PaymentMethod } from '../../types';

export interface FilterSheetHandle {
  present: () => void;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Amount', value: 'highest' },
  { label: 'Lowest Amount', value: 'lowest' },
];

const PAYMENT_OPTIONS: { label: string; value: PaymentMethod | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'UPI', value: 'upi' },
  { label: 'Cash', value: 'cash' },
];

export const FilterSheet = forwardRef<FilterSheetHandle>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const {
    dateRange,
    amountRange,
    paymentMethod,
    sortBy,
    setDateRange,
    setAmountRange,
    setPaymentMethod,
    setSortBy,
    clearFilters,
    hasActiveFilters,
  } = useFilterStore();

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
  }));

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['60%', '80%']}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: '#faf8ff' }}
      handleIndicatorStyle={{ backgroundColor: '#bdc9c6', width: 40, opacity: 0.4 }}
    >
      <BottomSheetScrollView className="px-5 pt-2" contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-on-surface font-heading-semibold text-lg">Filters</Text>
          {hasActiveFilters() && (
            <Pressable onPress={clearFilters}>
              <Text className="text-primary font-body-medium text-sm">Clear All</Text>
            </Pressable>
          )}
        </View>

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Date Range</Text>
        <View className="flex-row gap-2 mb-3">
          <TextInput
            value={dateRange.start ?? ''}
            onChangeText={(v) => setDateRange({ ...dateRange, start: v || null })}
            placeholder="Start (YYYY-MM-DD)"
            placeholderTextColor="#6e7977"
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-on-surface font-mono text-xs"
          />
          <TextInput
            value={dateRange.end ?? ''}
            onChangeText={(v) => setDateRange({ ...dateRange, end: v || null })}
            placeholder="End (YYYY-MM-DD)"
            placeholderTextColor="#6e7977"
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-on-surface font-mono text-xs"
          />
        </View>

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Amount Range</Text>
        <View className="flex-row gap-2 mb-3">
          <TextInput
            value={amountRange.min !== null ? String(amountRange.min) : ''}
            onChangeText={(v) => setAmountRange({ ...amountRange, min: v ? Number(v) : null })}
            placeholder="Min (₹)"
            placeholderTextColor="#6e7977"
            keyboardType="decimal-pad"
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-on-surface font-mono text-xs"
          />
          <TextInput
            value={amountRange.max !== null ? String(amountRange.max) : ''}
            onChangeText={(v) => setAmountRange({ ...amountRange, max: v ? Number(v) : null })}
            placeholder="Max (₹)"
            placeholderTextColor="#6e7977"
            keyboardType="decimal-pad"
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-on-surface font-mono text-xs"
          />
        </View>

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Payment Method</Text>
        <View className="flex-row gap-2 mb-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const active = paymentMethod === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setPaymentMethod(opt.value)}
                className={`flex-1 items-center py-2 rounded-xl border ${active ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/30'}`}
              >
                <Text className={`font-body-semibold text-sm ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Sort By</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSortBy(opt.value)}
                className={`px-3 py-2 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/30'}`}
              >
                <Text className={`font-body-medium text-xs ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => sheetRef.current?.dismiss()}
          className="items-center py-3 rounded-xl bg-primary active:opacity-80"
        >
          <Text className="text-on-primary font-body-semibold text-sm">Apply Filters</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

FilterSheet.displayName = 'FilterSheet';
