import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useAddTransaction } from '../../hooks';
import { CASH_CATEGORIES } from '../../services';
import { useUiStore } from '../../store/uiStore';
import { ReceiptScanner } from '../transactions/ReceiptScanner';

const cashExpenseSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, 'Enter an amount greater than 0'),
  category: z.string().min(1, 'Pick a category'),
  description: z.string().trim().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM format'),
});

type CashExpenseFormValues = z.infer<typeof cashExpenseSchema>;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function nowDateISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function nowTime(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function defaultValues(): CashExpenseFormValues {
  return {
    amount: '',
    category: CASH_CATEGORIES[0],
    description: '',
    date: nowDateISO(),
    time: nowTime(),
  };
}

export interface AddCashExpenseHandle {
  present: () => void;
}

export const AddCashExpenseSheet = forwardRef<AddCashExpenseHandle>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const addTransaction = useAddTransaction();
  const showToast = useUiStore((s) => s.showToast);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CashExpenseFormValues>({
    resolver: zodResolver(cashExpenseSchema),
    defaultValues: defaultValues(),
  });

  useImperativeHandle(ref, () => ({
    present: () => {
      reset(defaultValues());
      sheetRef.current?.present();
    },
  }));

  const onSubmit = (values: CashExpenseFormValues) => {
    const description = values.description?.trim();

    addTransaction.mutate(
      {
        date: values.date,
        time: values.time,
        amount: -Math.abs(Number(values.amount)),
        category: values.category,
        merchant: description || values.category,
        account: 'Cash',
        paymentMethod: 'cash',
        notes: description || undefined,
      },
      {
        onSuccess: () => {
          showToast('Cash expense recorded successfully.', 'success');
          sheetRef.current?.dismiss();
        },
        onError: () => showToast('Could not record cash expense', 'error'),
      }
    );
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['70%', '90%']}
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
        <Text className="text-on-surface font-heading-semibold text-lg mb-4">Add Cash Expense</Text>

        <ReceiptScanner
          onScanComplete={(data) => {
            setValue('amount', String(Math.abs(data.amount)));
            setValue('description', data.merchant);
            setValue('category', CASH_CATEGORIES.includes(data.category) ? data.category : 'Other');
          }}
        />

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Amount</Text>
        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row items-center bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 mb-1">
              <Text className="text-on-surface-variant font-mono-semibold text-base mr-1">₹</Text>
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="0.00"
                placeholderTextColor="#6e7977"
                keyboardType="decimal-pad"
                accessibilityLabel="Amount"
                className="flex-1 py-3 text-on-surface font-mono text-sm"
              />
            </View>
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
              {CASH_CATEGORIES.map((category) => {
                const active = value === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => onChange(category)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
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

        <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Description (optional)</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Auto fare, street food"
              placeholderTextColor="#6e7977"
              accessibilityLabel="Description"
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-3 text-on-surface font-body text-sm mb-3"
            />
          )}
        />

        <View className="flex-row gap-3 mb-1">
          <View className="flex-1">
            <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Date</Text>
            <Controller
              control={control}
              name="date"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6e7977"
                  accessibilityLabel="Date"
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-3 text-on-surface font-mono text-sm"
                />
              )}
            />
            {errors.date ? <Text className="text-alert font-body text-xs mt-1">{errors.date.message}</Text> : null}
          </View>
          <View className="flex-1">
            <Text className="text-on-surface-variant font-body-medium text-xs mb-1">Time</Text>
            <Controller
              control={control}
              name="time"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="HH:MM"
                  placeholderTextColor="#6e7977"
                  accessibilityLabel="Time"
                  className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-3 text-on-surface font-mono text-sm"
                />
              )}
            />
            {errors.time ? <Text className="text-alert font-body text-xs mt-1">{errors.time.message}</Text> : null}
          </View>
        </View>

        <View className="flex-row gap-3 mt-4">
          <Pressable
            onPress={() => sheetRef.current?.dismiss()}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            className="flex-1 items-center py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 active:opacity-80"
          >
            <Text className="text-on-surface font-body-medium text-sm">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={addTransaction.isPending}
            accessibilityRole="button"
            accessibilityLabel="Save expense"
            className="flex-1 items-center py-3 rounded-xl bg-primary active:opacity-80"
          >
            <Text className="text-on-primary font-body-semibold text-sm">
              {addTransaction.isPending ? 'Saving…' : 'Save Expense'}
            </Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

AddCashExpenseSheet.displayName = 'AddCashExpenseSheet';
