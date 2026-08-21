import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CATEGORIES } from '../../services';
import { formatMultiCurrency } from '../../services/exchangeRates';
import { useUpdateTransaction } from '../../hooks';
import { useUiStore } from '../../store/uiStore';
import { CurrencyCode, Transaction } from '../../types';

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Drink': '🍽️',
  'Food & Dining': '🍽️',
  Dining: '🍽️',
  Shopping: '🛍️',
  Transport: '🚗',
  Entertainment: '🎬',
  Income: '💰',
  Bills: '📄',
  default: '💳',
};

export interface TransactionDetailHandle {
  present: (transaction: Transaction) => void;
}

export const TransactionDetail = forwardRef<TransactionDetailHandle>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [tx, setTx] = useState<Transaction | null>(null);
  const [notes, setNotes] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const updateTransaction = useUpdateTransaction();
  const showToast = useUiStore((s) => s.showToast);

  useImperativeHandle(ref, () => ({
    present: (transaction: Transaction) => {
      setTx(transaction);
      setNotes(transaction.notes ?? '');
      setShowCategoryPicker(false);
      sheetRef.current?.present();
    },
  }));

  const handleChangeCategory = (category: string) => {
    if (!tx) return;
    updateTransaction.mutate(
      { id: tx.id, patch: { category } },
      {
        onSuccess: () => {
          setTx({ ...tx, category });
          setShowCategoryPicker(false);
          showToast(`Category changed to ${category}`, 'success');
        },
        onError: () => showToast('Could not update category', 'error'),
      }
    );
  };

  if (!tx) return null;

  const isIncome = tx.amount > 0;
  const icon = CATEGORY_ICONS[tx.category] ?? CATEGORY_ICONS.default;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['60%', '85%']}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: '#ffffff' }}
      handleIndicatorStyle={{ backgroundColor: '#bdc9c6', width: 40, opacity: 0.4 }}
    >
      <BottomSheetScrollView
        className="px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Drag Handle is auto-rendered by bottom-sheet */}

        {/* Header / Merchant Info */}
        <View className="items-center mb-5">
          <View className="w-16 h-16 bg-surface-container rounded-full items-center justify-center mb-3 shadow-sm">
            <Text className="text-3xl">{icon}</Text>
          </View>
          <Text className="text-on-surface font-heading-bold text-lg">{tx.merchant}</Text>
          <Text className={`font-heading-bold text-3xl mt-1 ${isIncome ? 'text-secondary' : 'text-alert'}`}>
            {formatMultiCurrency(tx.amount, tx.currency as CurrencyCode, { showSign: true })}
          </Text>
          <Text className="text-on-surface-variant font-body text-sm mt-1">
            {new Date(tx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {tx.time ? ` • ${tx.time}` : ''}
          </Text>
        </View>

        {/* Detail Rows */}
        <View className="mb-5">
          <View className="flex-row justify-between items-center py-3 border-b border-surface-variant">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">Account</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-on-surface font-body-medium text-sm">{tx.account || 'Premier Sapphire •• 4291'}</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-surface-variant">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">Category</Text>
            <View className="flex-row items-center gap-2 bg-secondary-container/20 px-3 py-1 rounded-full border border-secondary-container/30">
              <Text className="text-on-secondary-container font-body-medium text-sm">{tx.category}</Text>
              <Text className="text-[12px] text-on-secondary-container">✏️</Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-3 border-b border-surface-variant">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">Payment</Text>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-on-surface font-body-medium text-sm">
                {tx.paymentMethod === 'upi' ? '📱 UPI' : tx.paymentMethod === 'cash' ? '💵 Cash' : tx.paymentMethod === 'card' ? '💳 Card' : tx.paymentMethod === 'atm' ? '🏧 ATM' : tx.paymentMethod === 'bank' ? '🏦 Transfer' : '💳 Card'}
              </Text>
              {tx.paymentMethod === 'upi' && (
                <Text className="text-on-surface-variant font-body text-xs">({tx.account})</Text>
              )}
            </View>
          </View>
          {tx.source === 'sms' && (
            <View className="flex-row justify-between items-center py-3 border-b border-surface-variant">
              <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">Source</Text>
              <View className="bg-primary/10 px-3 py-0.5 rounded-full border border-primary/20">
                <Text className="text-primary font-body-medium text-xs">Detected from SMS</Text>
              </View>
            </View>
          )}
          <View className="flex-row justify-between items-center py-3 border-b border-surface-variant">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">Status</Text>
            <View className="bg-secondary-container px-3 py-0.5 rounded-full">
              <Text className="text-on-secondary-container font-body-medium text-xs">Completed</Text>
            </View>
          </View>
        </View>

        {/* AI Insight */}
        <View className="mb-5 bg-tertiary/5 p-4 rounded-[20px] border border-tertiary/20 relative overflow-hidden">
          <View className="absolute top-2 right-2 opacity-50">
            <Text className="text-tertiary text-lg">✨</Text>
          </View>
          <View className="flex-row items-start gap-3">
            <Text className="text-lg mt-0.5">⚡</Text>
            <View className="flex-1">
              <Text className="text-on-tertiary-fixed-variant font-body text-sm leading-relaxed">
                Categorized as <Text className="font-heading-semibold">{tx.category}</Text> with 94% confidence based on merchant profile and location history.
              </Text>
              <Pressable className="mt-2">
                <Text className="text-tertiary font-body-medium text-xs flex-row items-center gap-1">
                  Why this category? →
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">Notes</Text>
            {notes !== (tx.notes ?? '') ? (
              <Pressable
                onPress={() => {
                  updateTransaction.mutate(
                    { id: tx.id, patch: { notes } },
                    {
                      onSuccess: () => showToast('Notes saved', 'success'),
                      onError: () => showToast('Could not save notes', 'error'),
                    }
                  );
                }}
                disabled={updateTransaction.isPending}
              >
                <Text className="text-primary font-body-semibold text-xs">Save</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note to this transaction..."
            placeholderTextColor="#bdc9c6"
            multiline
            style={{ minHeight: 80, textAlignVertical: 'top' }}
            className="w-full bg-surface-container-low rounded-xl p-4 text-on-surface font-body text-sm"
          />
        </View>

        {/* Actions */}
        <View className="gap-3">
          {showCategoryPicker ? (
            <View className="gap-2">
              <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">Select Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = tx.category === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => handleChangeCategory(cat)}
                      disabled={updateTransaction.isPending}
                      className={`px-4 py-2 rounded-full border ${
                        isActive ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant'
                      }`}
                    >
                      <Text
                        className={`font-body-medium text-sm ${isActive ? 'text-on-primary' : 'text-on-surface-variant'}`}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Pressable onPress={() => setShowCategoryPicker(false)} className="py-2">
                <Text className="text-on-surface-variant font-body-medium text-xs text-center">Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Pressable
                onPress={() => setShowCategoryPicker(true)}
                className="w-full py-3.5 rounded-full border-2 border-primary items-center active:opacity-80"
              >
                <Text className="text-primary font-body-semibold text-sm">Change Category</Text>
              </Pressable>
              <Pressable className="w-full py-2.5 items-center flex-row justify-center gap-2 active:opacity-80">
                <Text className="text-[18px]">🚫</Text>
                <Text className="text-on-surface-variant font-body-medium text-sm">Report an issue</Text>
              </Pressable>
            </>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

TransactionDetail.displayName = 'TransactionDetail';
