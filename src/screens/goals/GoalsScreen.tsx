import { Plus } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AgentSuggestionCard } from '../../components/goals/AgentSuggestionCard';
import { GoalForm, GoalFormHandle } from '../../components/goals/GoalForm';
import { GoalProgressRing } from '../../components/goals/GoalProgressRing';
import { OnTrackIndicator } from '../../components/goals/OnTrackIndicator';
import { Screen } from '../../components/layout';
import { Card, EmptyState, ErrorState, LoadingSkeletonList } from '../../components/ui';
import { useGoals } from '../../hooks';
import { useUiStore } from '../../store';
import { Goal } from '../../types';
import { calcProgress } from '../../utils';

export function GoalsScreen() {
  const goalsQuery = useGoals();
  const showToast = useUiStore((state) => state.showToast);
  const formRef = useRef<GoalFormHandle>(null);
  const celebratedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!goalsQuery.data) return;
    goalsQuery.data.forEach((goal) => {
      const progress = calcProgress(goal.currentAmount, goal.targetAmount);
      if (progress >= 100 && !celebratedIds.current.has(goal.id)) {
        celebratedIds.current.add(goal.id);
        showToast(`🎉 ${goal.name} goal reached!`, 'success');
      }
    });
  }, [goalsQuery.data, showToast]);

  const handleAdd = () => formRef.current?.present();
  const handleEdit = (goal: Goal) => formRef.current?.present(goal);

  if (goalsQuery.isLoading) {
    return (
      <Screen title="Goals" contentClassName="pt-2">
        <LoadingSkeletonList rows={3} rowHeight={170} />
      </Screen>
    );
  }

  if (goalsQuery.isError) {
    return (
      <Screen title="Goals">
        <ErrorState message="We couldn't load your goals. Please try again." onRetry={() => goalsQuery.refetch()} />
      </Screen>
    );
  }

  const goals = goalsQuery.data ?? [];

  return (
    <Screen title="Goals" contentClassName="gap-4 pt-2">
      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          message="Create a savings goal to start tracking your progress."
          actionLabel="Add Goal"
          onAction={handleAdd}
        />
      ) : (
        <>
          {goals.map((goal) => (
            <Pressable
              key={goal.id}
              onPress={() => handleEdit(goal)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${goal.name} goal`}
            >
              <Card className="gap-4">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="text-on-surface font-heading-semibold text-base flex-1" numberOfLines={1}>
                    {goal.name}
                  </Text>
                  <OnTrackIndicator goal={goal} />
                </View>
                <GoalProgressRing goal={goal} />
                <AgentSuggestionCard goal={goal} />
              </Card>
            </Pressable>
          ))}
          <Pressable
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel="Add goal"
            className="flex-row items-center justify-center gap-2 bg-surface border border-border rounded-xl py-3.5 active:opacity-80"
          >
            <Plus color="#005c55" size={18} />
            <Text className="text-on-surface font-body-semibold text-sm">Add Goal</Text>
          </Pressable>
        </>
      )}
      <GoalForm ref={formRef} />
    </Screen>
  );
}
