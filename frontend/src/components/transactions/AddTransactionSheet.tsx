import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useAddTransaction } from '../../hooks';
import { ACCOUNTS, CATEGORIES } from '../../services';
import { useUiStore } from '../../store/uiStore';
import { formatDate } from '../../utils';
import { CurrencyPicker } from '../ui/CurrencyPicker';
import { ReceiptScanner } from './ReceiptScanner';

const addSchema = z.object({
  merchant: z.string().trim().min(1, 'Merchant is required'),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, 'Enter an amount greater than 0'),
  category: z.string().min(1, 'Pick a category'),
  account: z.string().min(1, 'Pick an account'),
  type: z.enum(['expense', 'income']),
  currency: z.string(),
});

type AddFormValues = z.infer<typeof addSchema>;

function todayISO(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const DEFAULT_VALUES = {
  merchant: '',
  amount: '',
  category: CATEGORIES[0],
  account: ACCOUNTS[0],
  type: 'expense' as const,
  currency: 'INR',
} satisfies AddFormValues;

export interface AddTransactionHandle {
  present: () => void;
}

export const AddTransactionSheet = forwardRef<AddTransactionHandle>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const addTransaction = useAddTransaction();
  const showToast = useUiStore((s) => s.showToast);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useImperativeHandle(ref, () => ({
    present: () => {
      reset(DEFAULT_VALUES);
      sheetRef.current?.present();
    },
  }));

  const onSubmit = (values: AddFormValues) => {
    const magnitude = Math.abs(Number(values.amount));
    const signedAmount = values.type === 'income' ? magnitude : -magnitude;

    addTransaction.mutate(
      {
        date: todayISO(),
        amount: signedAmount,
        category: values.category,
        merchant: values.merchant.trim(),
        account: values.account,
        paymentMethod: 'cash',
        currency: values.currency as any,
      },
      {
        onSuccess: () => {
          showToast('Transaction added', 'success');
          sheetRef.current?.dismiss();
        },
        onError: () => showToast('Could not add transaction', 'error'),
      }
    );
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['75%', '95%']}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: '#faf8ff' }}
      handleIndicatorStyle={{ backgroundColor: '#bdc9c6', width: 40, opacity: 0.4 }}
    >
      <BottomSheetScrollView
        className="px-5 pt-2"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-on-surface font-heading-semibold text-lg mb-4">Add Transaction</Text>

        <ReceiptScanner
          onScanComplete={(data) => {
            setValue('merchant', data.merchant);
            setValue('amount', String(Math.abs(data.amount)));
            setValue('category', CATEGORIES.includes(data.category) ? data.category : 'Other');
          }}
        />

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Type</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row gap-2 mb-3">
              {(['expense', 'income'] as const).map((option) => {
                const active = value === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => onChange(option)}
                    className={`flex-1 items-center py-2 rounded-xl border ${active ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/30'}`}
                  >
                    <Text className={`font-body-semibold text-sm capitalize ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Merchant</Text>
        <Controller
          control={control}
          name="merchant"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Whole Foods Market"
              placeholderTextColor="#6e7977"
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-3 text-on-surface font-body text-sm mb-1"
            />
          )}
        />
        {errors.merchant ? (
          <Text className="text-alert font-body text-xs mb-2">{errors.merchant.message}</Text>
        ) : (
          <View className="mb-2" />
        )}

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Amount</Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="0.00"
              placeholderTextColor="#6e7977"
              keyboardType="decimal-pad"
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-3 text-on-surface font-mono text-sm mb-1"
            />
          )}
        />
        {errors.amount ? (
          <Text className="text-alert font-body text-xs mb-2">{errors.amount.message}</Text>
        ) : (
          <View className="mb-2" />
        )}

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Category</Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              className="mb-3"
            >
              {CATEGORIES.map((category) => {
                const active = value === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => onChange(category)}
                    className={`px-3 py-2 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/30'}`}
                  >
                    <Text className={`font-body-medium text-xs ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        />

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Account</Text>
        <Controller
          control={control}
          name="account"
          render={({ field: { value, onChange } }) => (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              className="mb-3"
            >
              {ACCOUNTS.map((account) => {
                const active = value === account;
                return (
                  <Pressable
                    key={account}
                    onPress={() => onChange(account)}
                    className={`px-3 py-2 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-surface-container-low border-outline-variant/30'}`}
                  >
                    <Text className={`font-body-medium text-xs ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                      {account}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        />

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Currency</Text>
        <Controller
          control={control}
          name="currency"
          render={({ field: { value, onChange } }) => (
            <CurrencyPicker value={value as any} onChange={onChange as any} />
          )}
        />
        <View className="mb-3" />

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Date</Text>
        <View className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-3 mb-4">
          <Text className="text-on-surface font-body text-sm">{formatDate(todayISO(), 'medium')} (today)</Text>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => sheetRef.current?.dismiss()}
            className="flex-1 items-center py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 active:opacity-80"
          >
            <Text className="text-on-surface font-body-medium text-sm">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={addTransaction.isPending}
            className="flex-1 items-center py-3 rounded-xl bg-primary active:opacity-80"
          >
            <Text className="text-on-primary font-body-semibold text-sm">
              {addTransaction.isPending ? 'Saving…' : 'Save Transaction'}
            </Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

AddTransactionSheet.displayName = 'AddTransactionSheet';
