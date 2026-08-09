import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAgentPreferences, useUpdateAgentPreferences } from '../../hooks';
import { AgentAutonomyLevel } from '../../types';

interface AutonomyLevelInfo {
  level: AgentAutonomyLevel;
  label: string;
  description: string;
}

const LEVELS: AutonomyLevelInfo[] = [
  {
    level: 1,
    label: 'Notify only',
    description: 'The agent only tells you what it sees — you make every decision.',
  },
  {
    level: 2,
    label: 'Ask before acting',
    description: 'The agent suggests actions and waits for your go-ahead before doing anything.',
  },
  {
    level: 3,
    label: 'Handle routine tasks',
    description: 'The agent manages routine tasks like categorizing spending, but checks with you before anything significant.',
  },
  {
    level: 4,
    label: 'Act, then report',
    description: 'The agent takes most actions automatically and gives you a daily summary to review.',
  },
  {
    level: 5,
    label: 'Full autopilot',
    description:
      'The agent acts on your behalf for routine decisions, like categorizing transactions and adjusting budgets automatically.',
  },
];

export function AgentAutonomySlider() {
  const { data: preferences } = useAgentPreferences();
  const updatePreferences = useUpdateAgentPreferences();

  const activeLevel: AgentAutonomyLevel = preferences?.autonomyLevel ?? 3;
  const active = LEVELS.find((info) => info.level === activeLevel) ?? LEVELS[2];

  const handleSelect = (level: AgentAutonomyLevel) => {
    if (level === activeLevel) return;
    updatePreferences.mutate({ autonomyLevel: level });
  };

  return (
    <View className="gap-3">
      <View className="flex-row gap-2">
        {LEVELS.map(({ level }) => {
          const isActive = level === activeLevel;
          return (
            <Pressable
              key={level}
              onPress={() => handleSelect(level)}
              accessibilityRole="button"
              accessibilityLabel={`Autonomy level ${level}`}
              accessibilityState={{ selected: isActive }}
              className={`flex-1 items-center rounded-xl border py-3 active:opacity-80 ${
                isActive ? 'border-gold bg-gold/20' : 'border-border bg-background'
              }`}
            >
              <Text className={`font-heading-semibold text-sm ${isActive ? 'text-gold' : 'text-muted'}`}>{level}</Text>
            </Pressable>
          );
        })}
      </View>
      <View>
        <Text className="font-body-semibold text-sm text-white">{active.label}</Text>
        <Text className="mt-1 font-body text-xs leading-5 text-muted">{active.description}</Text>
      </View>
    </View>
  );
}
