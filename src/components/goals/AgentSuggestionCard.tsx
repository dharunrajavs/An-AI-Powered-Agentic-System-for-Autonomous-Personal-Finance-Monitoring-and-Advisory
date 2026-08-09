import { Lightbulb } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { useAgentInsights } from '../../hooks';
import { Goal } from '../../types';
import { Card } from '../ui';

interface AgentSuggestionCardProps {
  goal: Goal;
}

export function AgentSuggestionCard({ goal }: AgentSuggestionCardProps) {
  const { data: insights } = useAgentInsights();
  const suggestion = insights?.find((insight) => insight.type === 'suggestion' && insight.relatedEntity === goal.id);
  const message = suggestion?.message ?? 'Stay consistent with contributions to hit this goal on schedule.';

  return (
    <Card className="flex-row items-start gap-3">
      <View className="w-8 h-8 rounded-full bg-gold/20 items-center justify-center">
        <Lightbulb color="#C9A44C" size={16} />
      </View>
      <Text className="flex-1 text-white font-body text-xs leading-5">{message}</Text>
    </Card>
  );
}
