import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AlertTriangle, FileText, Lightbulb, LucideIcon } from 'lucide-react-native';
import type { MainTabParamList } from '../../navigation/types';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useDismissInsight } from '../../hooks';
import { AgentInsight } from '../../types';
import { Card, SeverityBadge } from '../ui';

const TYPE_ICON: Record<AgentInsight['type'], LucideIcon> = {
  alert: AlertTriangle,
  suggestion: Lightbulb,
  summary: FileText,
};

const TYPE_LABEL: Record<AgentInsight['type'], string> = {
  alert: 'Alert',
  suggestion: 'Suggestion',
  summary: 'Summary',
};

interface AgentInsightCardProps {
  insight: AgentInsight;
}

export function AgentInsightCard({ insight }: AgentInsightCardProps) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const dismissInsight = useDismissInsight();
  const Icon = TYPE_ICON[insight.type];

  return (
    <Card className="gap-4">
      <View className="flex-row items-start gap-3">
        <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
          <Icon color="#005c55" size={20} />
        </View>
        <View className="flex-1 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wide">
              {TYPE_LABEL[insight.type]}
            </Text>
            <SeverityBadge severity={insight.severity} />
          </View>
          <Text className="text-on-surface font-body text-sm leading-5">{insight.message}</Text>
        </View>
      </View>
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => navigation.navigate('Budgets')}
          accessibilityRole="button"
          accessibilityLabel="Adjust budget"
          className="flex-1 bg-primary rounded-xl py-3 items-center active:opacity-80"
        >
          <Text className="text-on-primary font-body-semibold text-sm">Adjust budget</Text>
        </Pressable>
        <Pressable
          onPress={() => dismissInsight.mutate(insight.id)}
          disabled={dismissInsight.isPending}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          className="flex-1 bg-surface border border-border rounded-xl py-3 items-center active:opacity-80"
        >
          <Text className="text-on-surface font-body-semibold text-sm">
            {dismissInsight.isPending ? 'Dismissing…' : 'Dismiss'}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
