import { zodResolver } from '@hookform/resolvers/zod';
import { Target } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useUpsertGoal } from '../../hooks';
import { useUiStore } from '../../store';
import { Card } from '../ui';

const goalSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters'),
  targetAmount: z
    .string()
    .trim()
    .min(1, 'Enter a target amount')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: 'Enter a positive amount',
    }),
  targetDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD'),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormProps {
  onContinue: () => void;
}

export function GoalForm({ onContinue }: GoalFormProps) {
  const upsertGoal = useUpsertGoal();
  const showToast = useUiStore((s) => s.showToast);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: '', targetAmount: '', targetDate: '' },
  });

  const onSubmit = (data: GoalFormValues) => {
    upsertGoal.mutate(
      {
        id: `goal_${Date.now()}`,
        name: data.name,
        targetAmount: Number(data.targetAmount),
        currentAmount: 0,
        targetDate: data.targetDate,
      },
      {
        onSuccess: () => {
          showToast('Goal created', 'success');
          onContinue();
        },
      }
    );
  };

  return (
    <View className="gap-5">
      <View className="items-center gap-2 mb-1">
        <View className="w-14 h-14 rounded-full bg-surface border border-border items-center justify-center">
          <Target color="#C9A44C" size={26} />
        </View>
        <Text className="text-on-surface font-heading-bold text-xl text-center">Set your first goal</Text>
        <Text className="text-muted font-body text-sm text-center leading-5 px-4">
          Your agent will track progress and suggest ways to help you get there faster.
        </Text>
      </View>

      <Card className="gap-4">
        <View className="gap-1.5">
          <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Goal name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Emergency fund"
                placeholderTextColor="#7C8797"
                className="bg-background border border-border rounded-xl px-4 py-3 text-on-surface font-body text-sm"
              />
            )}
          />
          {errors.name ? <Text className="text-alert font-body text-xs">{errors.name.message}</Text> : null}
        </View>

        <View className="gap-1.5">
          <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Target amount</Text>
          <Controller
            control={control}
            name="targetAmount"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="10000"
                placeholderTextColor="#7C8797"
                keyboardType="decimal-pad"
                className="bg-background border border-border rounded-xl px-4 py-3 text-on-surface font-mono text-sm"
              />
            )}
          />
          {errors.targetAmount ? (
            <Text className="text-alert font-body text-xs">{errors.targetAmount.message}</Text>
          ) : null}
        </View>

        <View className="gap-1.5">
          <Text className="text-muted font-body-medium text-xs uppercase tracking-wide">Target date</Text>
          <Controller
            control={control}
            name="targetDate"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#7C8797"
                className="bg-background border border-border rounded-xl px-4 py-3 text-on-surface font-mono text-sm"
              />
            )}
          />
          {errors.targetDate ? (
            <Text className="text-alert font-body text-xs">{errors.targetDate.message}</Text>
          ) : null}
        </View>
      </Card>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || upsertGoal.isPending}
        className="bg-gold rounded-xl py-4 items-center active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Save goal and continue"
      >
        <Text className="text-background font-body-semibold text-sm">
          {upsertGoal.isPending ? 'Saving…' : 'Save goal & continue'}
        </Text>
      </Pressable>
    </View>
  );
}
