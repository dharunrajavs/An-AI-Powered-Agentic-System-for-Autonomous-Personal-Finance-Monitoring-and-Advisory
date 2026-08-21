import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useCreditCardBills } from '../../hooks/useCreditCardBills';
import type { MoreStackParamList } from '../../navigation/types';
import { getMinTotalDue, getTotalDue } from '../../services/creditCardBills';

export function CreditCardBillsCard() {
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const { data: bills = [] } = useCreditCardBills();

  const unpaid = bills.filter((b) => b.status !== 'paid');
  if (unpaid.length === 0) return null;

  const totalDue = getTotalDue(bills);
  const minDue = getMinTotalDue(bills);
  const overdue = bills.filter((b) => b.status === 'overdue');

  return (
    <Pressable
      onPress={() => navigation.navigate('Settings')}
      className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm active:opacity-80"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">💳</Text>
          <Text className="text-on-surface font-heading-semibold text-sm">Credit Card Bills</Text>
        </View>
        <View className="items-end">
          <Text className="text-on-surface font-heading-bold text-base">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(totalDue)}
          </Text>
          <Text className="text-on-surface-variant font-body text-[10px]">Min: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(minDue)}</Text>
        </View>
      </View>

      {overdue.length > 0 && (
        <View className="bg-alert/10 rounded-lg px-3 py-2 mb-2 border border-alert/20">
          <Text className="text-alert font-body-semibold text-xs">{overdue.length} overdue bill{overdue.length > 1 ? 's' : ''} — pay immediately</Text>
        </View>
      )}

      <View className="gap-2">
        {unpaid.slice(0, 3).map((bill) => {
          const daysUntilDue = Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / 86400000);
          return (
            <View key={bill.id} className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-on-surface font-body-medium text-sm">{bill.bankName} (XX{bill.cardLastFour})</Text>
                <Text className={`font-body text-[10px] ${daysUntilDue <= 0 ? 'text-alert' : daysUntilDue <= 7 ? 'text-warning' : 'text-on-surface-variant'}`}>
                  {daysUntilDue <= 0 ? 'Overdue' : `${daysUntilDue}d left`}
                </Text>
              </View>
              <Text className="text-on-surface font-heading-semibold text-sm">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(bill.amount)}
              </Text>
            </View>
          );
        })}
      </View>

      {unpaid.length > 3 && (
        <Text className="text-on-surface-variant font-body text-[10px] mt-2">+{unpaid.length - 3} more bills</Text>
      )}
    </Pressable>
  );
}
