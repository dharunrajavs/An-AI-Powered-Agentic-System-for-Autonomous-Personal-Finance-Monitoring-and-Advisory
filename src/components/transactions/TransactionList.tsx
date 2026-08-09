import { Trash2 } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useDeleteTransaction } from '../../hooks';
import { useUiStore } from '../../store/uiStore';
import { CurrencyCode, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import { formatMultiCurrency } from '../../services/exchangeRates';
import { ConfirmDialog } from '../ui';
import { AgentFlagBadge } from './AgentFlagBadge';
import { getCategoryIcon } from './categoryIcons';

interface TransactionListProps {
  transactions: Transaction[];
  onPressTransaction: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onPressTransaction }: TransactionListProps) {
  const deleteTransaction = useDeleteTransaction();
  const showToast = useUiStore((s) => s.showToast);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, Swipeable>>(new Map());

  const closeRow = (id: string) => {
    rowRefs.current.get(id)?.close();
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      const id = pendingDeleteId;
      deleteTransaction.mutate(id, {
        onSuccess: () => showToast('Transaction deleted', 'success'),
        onError: () => showToast('Could not delete transaction', 'error'),
      });
      closeRow(id);
    }
    setPendingDeleteId(null);
  };

  const handleCancelDelete = () => {
    if (pendingDeleteId) closeRow(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const Icon = getCategoryIcon(item.category);
          const isIncome = item.amount > 0;

          return (
            <Swipeable
              ref={(instance) => {
                if (instance) rowRefs.current.set(item.id, instance);
                else rowRefs.current.delete(item.id);
              }}
              overshootRight={false}
              renderRightActions={() => (
                <Pressable
                  onPress={() => setPendingDeleteId(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete transaction with ${item.merchant}`}
                  className="bg-alert w-16 ml-2 rounded-2xl items-center justify-center"
                >
                  <Trash2 size={20} color="#FFFFFF" />
                </Pressable>
              )}
            >
              <Pressable
                onPress={() => onPressTransaction(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.merchant}, ${formatCurrency(item.amount)}`}
                className="flex-row items-center bg-surface border border-border rounded-2xl p-3 active:opacity-80"
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Icon size={18} color="#005c55" />
                </View>
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center">
                    <Text className="text-on-surface font-body-semibold text-sm flex-shrink" numberOfLines={1}>
                      {item.merchant}
                    </Text>
                    {item.flagged ? <AgentFlagBadge notes={item.notes} /> : null}
                  </View>
                  <Text className="text-on-surface-variant font-body text-xs mt-0.5" numberOfLines={1}>
                    {item.category} · {item.account}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`font-mono-semibold text-sm ${isIncome ? 'text-positive' : 'text-alert'}`}>
                    {item.currency && item.currency !== 'INR'
                      ? formatMultiCurrency(item.amount, item.currency as CurrencyCode, { showOriginal: false })
                      : formatCurrency(item.amount, { showSign: true })}
                  </Text>
                  <Text className="text-on-surface-variant font-body text-xs mt-0.5">
                    {item.currency && item.currency !== 'INR' ? `${item.currency} ${formatDate(item.date, 'short')}` : formatDate(item.date, 'short')}
                  </Text>
                </View>
              </Pressable>
            </Swipeable>
          );
        }}
      />

      <ConfirmDialog
        visible={pendingDeleteId !== null}
        title="Delete transaction?"
        message="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
