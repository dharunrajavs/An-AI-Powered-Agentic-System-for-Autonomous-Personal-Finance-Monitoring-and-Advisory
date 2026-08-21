import { Bot } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { useUpdateAgentPreferences } from '../../hooks';
import { useUiStore } from '../../store';
import { AgentAutonomyLevel } from '../../types';
import { Card } from '../ui';

interface AgentPreferencesFormProps {
  onFinish: () => void;
}

interface AutonomyOption {
  level: AgentAutonomyLevel;
  label: string;
  description: string;
}

const AUTONOMY_LEVELS: AutonomyOption[] = [
  { level: 1, label: 'Notify only', description: 'Your agent flags issues and opportunities but never acts on its own.' },
  { level: 2, label: 'Suggest', description: 'Your agent proposes actions and waits for your approval before doing anything.' },
  { level: 3, label: 'Assist', description: 'Your agent handles routine, low-risk tasks automatically and asks before anything bigger.' },
  { level: 4, label: 'Delegate', description: 'Your agent manages budgets and bills on its own, only checking in on major decisions.' },
  { level: 5, label: 'Full autopilot', description: 'Your agent manages your finances end-to-end and simply keeps you informed.' },
];

type ToggleKey =
  | 'notifyOverspend'
  | 'notifyBillDue'
  | 'notifyUnusualTransaction'
  | 'notifyGoalMilestone'
  | 'notifyWeeklyDigest';

interface ToggleConfig {
  key: ToggleKey;
  label: string;
  description: string;
}

const TOGGLES: ToggleConfig[] = [
  { key: 'notifyOverspend', label: 'Overspend alerts', description: 'Get notified when spending exceeds a budget category.' },
  { key: 'notifyBillDue', label: 'Bill due reminders', description: 'Get notified a few days before a bill is due.' },
  {
    key: 'notifyUnusualTransaction',
    label: 'Unusual transactions',
    description: 'Get notified about transactions that look out of the ordinary.',
  },
  { key: 'notifyGoalMilestone', label: 'Goal milestones', description: 'Get notified when you hit a savings goal milestone.' },
  { key: 'notifyWeeklyDigest', label: 'Weekly digest', description: 'Get a weekly summary of your financial activity.' },
];

export function AgentPreferencesForm({ onFinish }: AgentPreferencesFormProps) {
  const [autonomyLevel, setAutonomyLevel] = useState<AgentAutonomyLevel>(3);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    notifyOverspend: true,
    notifyBillDue: true,
    notifyUnusualTransaction: true,
    notifyGoalMilestone: true,
    notifyWeeklyDigest: false,
  });

  const updatePreferences = useUpdateAgentPreferences();
  const showToast = useUiStore((s) => s.showToast);

  const selected = AUTONOMY_LEVELS.find((item) => item.level === autonomyLevel) ?? AUTONOMY_LEVELS[2];

  const handleToggle = (key: ToggleKey, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  };

  const handleFinish = () => {
    updatePreferences.mutate(
      { autonomyLevel, ...toggles },
      {
        onSuccess: () => {
          showToast('Preferences saved', 'success');
          onFinish();
        },
      }
    );
  };

  return (
    <View className="gap-5">
      <View className="items-center gap-2 mb-1">
        <View className="w-14 h-14 rounded-full bg-surface border border-border items-center justify-center">
          <Bot color="#C9A44C" size={26} />
        </View>
        <Text className="text-on-surface font-heading-bold text-xl text-center">Set your agent&apos;s autonomy</Text>
        <Text className="text-muted font-body text-sm text-center leading-5 px-4">
          Choose how much your AI advisor can do on its own. You can change this anytime in settings.
        </Text>
      </View>

      <Card className="gap-3">
        <Pressable
          onPress={() => setShowLevelPicker(!showLevelPicker)}
          className="flex-row items-center justify-between bg-background rounded-xl px-4 py-3.5 border border-border"
        >
          <View className="flex-1">
            <Text className="text-gold font-body-semibold text-sm">{selected.label}</Text>
            <Text className="text-muted font-body text-xs leading-5 mt-1">{selected.description}</Text>
          </View>
          <Text className="text-muted font-body text-sm ml-2">{showLevelPicker ? '▲' : '▼'}</Text>
        </Pressable>
        {showLevelPicker ? (
          <View className="bg-background rounded-xl overflow-hidden border border-border">
            {AUTONOMY_LEVELS.map((item) => {
              const isActive = item.level === autonomyLevel;
              return (
                <Pressable
                  key={item.level}
                  onPress={() => { setAutonomyLevel(item.level); setShowLevelPicker(false); }}
                  className={`px-4 py-3.5 border-b border-border ${isActive ? 'bg-gold/10' : ''}`}
                >
                  <Text className={`font-body text-sm ${isActive ? 'text-gold font-body-semibold' : 'text-on-surface'}`}>
                    {item.level}. {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Card>

      <Card className="gap-4">
        {TOGGLES.map((toggle, index) => {
          const isLast = index === TOGGLES.length - 1;
          return (
            <View
              key={toggle.key}
              className={`flex-row items-center justify-between gap-3 ${isLast ? '' : 'pb-4 border-b border-border'}`}
            >
              <View className="flex-1 gap-0.5">
                <Text className="text-white font-body-medium text-sm">{toggle.label}</Text>
                <Text className="text-muted font-body text-xs leading-4">{toggle.description}</Text>
              </View>
              <Switch
                value={toggles[toggle.key]}
                onValueChange={(value) => handleToggle(toggle.key, value)}
                trackColor={{ false: '#232B3D', true: '#C9A44C' }}
                thumbColor="#FFFFFF"
              />
            </View>
          );
        })}
      </Card>

      <Pressable
        onPress={handleFinish}
        disabled={updatePreferences.isPending}
        className="bg-gold rounded-xl py-4 items-center active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Finish onboarding"
      >
        <Text className="text-background font-body-semibold text-sm">
          {updatePreferences.isPending ? 'Saving…' : 'Finish setup'}
        </Text>
      </Pressable>
    </View>
  );
}
