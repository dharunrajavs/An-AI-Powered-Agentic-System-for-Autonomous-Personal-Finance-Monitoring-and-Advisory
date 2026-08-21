import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react-native';
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useDeleteBudget, useUpsertBudget } from '../../hooks';
import { CATEGORIES } from '../../services';
import { Budget } from '../../types';
import { ConfirmDialog } from '../ui';

const budgetSchema = z.object({
  category: z.string().min(1, 'Select a category'),
  limit: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Enter an amount greater than 0'),
  period: z.enum(['monthly', 'weekly']),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export interface BudgetFormHandle {
  present: (budget?: Budget) => void;
}

interface BudgetFormProps {
  existingCategories: string[];
}

export const BudgetForm = forwardRef<BudgetFormHandle, BudgetFormProps>(({ existingCategories }, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { category: '', limit: '', period: 'monthly' },
  });

  const selectedCategory = watch('category');

  const availableCategories = useMemo(
    () => CATEGORIES.filter((category) => category === selectedCategory || !existingCategories.includes(category)),
    [existingCategories, selectedCategory]
  );

  useImperativeHandle(ref, () => ({
    present: (budget) => {
      setEditingBudget(budget ?? null);
      setConfirmVisible(false);
      const defaultCategory = budget?.category ?? CATEGORIES.find((c) => !existingCategories.includes(c)) ?? '';
      reset({
        category: defaultCategory,
        limit: budget ? String(budget.limit) : '',
        period: budget?.period ?? 'monthly',
      });
      sheetRef.current?.present();
    },
  }));

  const onSubmit = (values: BudgetFormValues) => {
    upsertBudget.mutate(
      {
        id: editingBudget?.id ?? `bud_${Date.now()}`,
        category: values.category,
        limit: Number(values.limit),
        spent: editingBudget?.spent ?? 0,
        period: values.period,
      },
      { onSuccess: () => sheetRef.current?.dismiss() }
    );
  };

  const handleDeleteConfirm = () => {
    if (!editingBudget) return;
    deleteBudget.mutate(editingBudget.id, {
      onSuccess: () => {
        setConfirmVisible(false);
        sheetRef.current?.dismiss();
      },
    });
  };

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: '#ffffff' }}
        handleIndicatorStyle={{ backgroundColor: '#dae2fd' }}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 36, paddingTop: 4, gap: 20 }}>
          <Text className="text-on-surface font-heading-semibold text-lg">
            {editingBudget ? 'Edit Budget' : 'Add Budget'}
          </Text>

          <View className="gap-2">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wide">Category</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {availableCategories.map((category) => {
                    const selected = value === category;
                    return (
                      <Pressable
                        key={category}
                        onPress={() => onChange(category)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={category}
                        className={`px-3.5 py-2 rounded-full border ${
                          selected ? 'bg-gold border-gold' : 'bg-background border-border'
                        }`}
                      >
                        <Text className={`font-body-medium text-xs ${selected ? 'text-background' : 'text-on-surface'}`}>
                          {category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
            {errors.category ? <Text className="text-alert font-body text-xs">{errors.category.message}</Text> : null}
          </View>

          <View className="gap-2">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wide">Limit</Text>
            <Controller
              control={control}
              name="limit"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
                  <Text className="text-on-surface-variant font-mono-semibold text-base mr-1">₹</Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="0.00"
                    placeholderTextColor="#6e7977"
                    keyboardType="decimal-pad"
                    accessibilityLabel="Budget limit"
                    className="flex-1 py-3.5 font-mono text-on-surface"
                  />
                </View>
              )}
            />
            {errors.limit ? <Text className="text-alert font-body text-xs">{errors.limit.message}</Text> : null}
          </View>

          <View className="gap-2">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wide">Period</Text>
            <Controller
              control={control}
              name="period"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row bg-background border border-border rounded-xl p-1 gap-1">
                  {(['monthly', 'weekly'] as const).map((period) => {
                    const selected = value === period;
                    return (
                      <Pressable
                        key={period}
                        onPress={() => onChange(period)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        className={`flex-1 items-center py-2.5 rounded-lg ${selected ? 'bg-gold' : ''}`}
                      >
                        <Text className={`font-body-semibold text-sm ${selected ? 'text-background' : 'text-on-surface-variant'}`}>
                          {period === 'monthly' ? 'Monthly' : 'Weekly'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={upsertBudget.isPending}
            accessibilityRole="button"
            accessibilityLabel="Save budget"
            className={`items-center rounded-xl bg-gold py-4 active:opacity-90 ${
              upsertBudget.isPending ? 'opacity-70' : ''
            }`}
          >
            <Text className="text-background font-heading-semibold text-base">
              {upsertBudget.isPending ? 'Saving…' : 'Save Budget'}
            </Text>
          </Pressable>

          {editingBudget ? (
            <Pressable
              onPress={() => setConfirmVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete budget"
              className="flex-row items-center justify-center gap-2 py-1"
            >
              <Trash2 color="#D9564B" size={16} />
              <Text className="text-alert font-body-semibold text-sm">Delete Budget</Text>
            </Pressable>
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete budget?"
        message={`This will remove the ${editingBudget?.category ?? ''} budget. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
});

BudgetForm.displayName = 'BudgetForm';
