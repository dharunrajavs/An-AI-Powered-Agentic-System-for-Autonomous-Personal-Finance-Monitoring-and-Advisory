import React from 'react';
import { Text, View } from 'react-native';

type Severity = 'low' | 'medium' | 'high';

const SEVERITY_STYLES: Record<Severity, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-positive/15', text: 'text-positive', label: 'Low' },
  medium: { bg: 'bg-primary/10', text: 'text-primary', label: 'Medium' },
  high: { bg: 'bg-alert/20', text: 'text-alert', label: 'High' },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const style = SEVERITY_STYLES[severity];
  return (
    <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-body-semibold ${style.text}`}>{style.label}</Text>
    </View>
  );
}
