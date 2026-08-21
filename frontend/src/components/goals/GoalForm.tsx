import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react-native';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useDeleteGoal, useUpsertGoal } from '../../hooks';
import { ACCOUNTS } from '../../services';
import { Goal } from '../../types';
import { ConfirmDialog } from '../ui';

const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  targetAmount: z
    .string()
    .min(1, 'Enter a target amount')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Enter an amount greater than 0'),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid date'),
  linkedAccount: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export interface GoalFormHandle {
  present: (goal?: Goal) => void;
}

const ACCOUNT_OPTIONS = ['', ...ACCOUNTS];

export const GoalForm = forwardRef<GoalFormHandle>((_props, ref) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const upsertGoal = useUpsertGoal();
  const deleteGoal = useDeleteGoal();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: '', targetAmount: '', targetDate: '', linkedAccount: '' },
  });

  useImperativeHandle(ref, () => ({
    present: (goal) => {
      setEditingGoal(goal ?? null);
      setConfirmVisible(false);
      reset({
        name: goal?.name ?? '',
        targetAmount: goal ? String(goal.targetAmount) : '',
        targetDate: goal?.targetDate ?? '',
        linkedAccount: goal?.linkedAccount ?? '',
      });
      sheetRef.current?.present();
    },
  }));

  const onSubmit = (values: GoalFormValues) => {
    upsertGoal.mutate(
      {
        id: editingGoal?.id ?? `goal_${Date.now()}`,
        name: values.name,
        targetAmount: Number(values.targetAmount),
        currentAmount: editingGoal?.currentAmount ?? 0,
        targetDate: values.targetDate,
        linkedAccount: values.linkedAccount || undefined,
      },
      { onSuccess: () => sheetRef.current?.dismiss() }
    );
  };

  const handleDeleteConfirm = () => {
    if (!editingGoal) return;
    deleteGoal.mutate(editingGoal.id, {
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
        backgroundStyle={{ backgroundColor: '#161D2B' }}
        handleIndicatorStyle={{ backgroundColor: '#7C8797' }}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 36, paddingTop: 4, gap: 20 }}>
          <Text className="text-white font-heading-semibold text-lg">{editingGoal ? 'Edit Goal' : 'Add Goal'}</Text>

          <View className="gap-2">
            <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Goal name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Emergency Fund"
                  placeholderTextColor="#7C8797"
                  accessibilityLabel="Goal name"
                  className="rounded-xl border border-border bg-background px-4 py-3.5 font-body text-white"
                />
              )}
            />
            {errors.name ? <Text className="text-alert font-body text-xs">{errors.name.message}</Text> : null}
          </View>

          <View className="gap-2">
            <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Target amount</Text>
            <Controller
              control={control}
              name="targetAmount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="flex-row items-center rounded-xl border border-border bg-background px-4">
                  <Text className="text-muted font-mono-semibold text-base mr-1">₹</Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="0.00"
                    placeholderTextColor="#7C8797"
                    keyboardType="decimal-pad"
                    accessibilityLabel="Target amount"
                    className="flex-1 py-3.5 font-mono text-white"
                  />
                </View>
              )}
            />
            {errors.targetAmount ? (
              <Text className="text-alert font-body text-xs">{errors.targetAmount.message}</Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Target date</Text>
            <Controller
              control={control}
              name="targetDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7C8797"
                  keyboardType="numbers-and-punctuation"
                  accessibilityLabel="Target date"
                  className="rounded-xl border border-border bg-background px-4 py-3.5 font-mono text-white"
                />
              )}
            />
            {errors.targetDate ? (
              <Text className="text-alert font-body text-xs">{errors.targetDate.message}</Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Linked account</Text>
            <Controller
              control={control}
              name="linkedAccount"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {ACCOUNT_OPTIONS.map((account) => {
                    const selected = (value ?? '') === account;
                    return (
                      <Pressable
                        key={account || 'none'}
                        onPress={() => onChange(account)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={account || 'No linked account'}
                        className={`px-3.5 py-2 rounded-full border ${
                          selected ? 'bg-gold border-gold' : 'bg-background border-border'
                        }`}
                      >
                        <Text className={`font-body-medium text-xs ${selected ? 'text-background' : 'text-white'}`}>
                          {account || 'No account'}
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
            disabled={upsertGoal.isPending}
            accessibilityRole="button"
            accessibilityLabel="Save goal"
            className={`items-center rounded-xl bg-gold py-4 active:opacity-90 ${
              upsertGoal.isPending ? 'opacity-70' : ''
            }`}
          >
            <Text className="text-background font-heading-semibold text-base">
              {upsertGoal.isPending ? 'Saving…' : 'Save Goal'}
            </Text>
          </Pressable>

          {editingGoal ? (
            <Pressable
              onPress={() => setConfirmVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete goal"
              className="flex-row items-center justify-center gap-2 py-1"
            >
              <Trash2 color="#D9564B" size={16} />
              <Text className="text-alert font-body-semibold text-sm">Delete Goal</Text>
            </Pressable>
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete goal?"
        message={`This will remove the ${editingGoal?.name ?? ''} goal. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
});

GoalForm.displayName = 'GoalForm';
