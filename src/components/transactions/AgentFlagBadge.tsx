import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';
import { useUiStore } from '../../store/uiStore';

interface AgentFlagBadgeProps {
  notes?: string;
}

export function AgentFlagBadge({ notes }: AgentFlagBadgeProps) {
  const showToast = useUiStore((s) => s.showToast);

  return (
    <Pressable
      onPress={() => showToast(notes ?? 'Flagged by your agent for review.', 'error')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="View agent flag details"
      className="ml-2 w-6 h-6 rounded-full bg-alert/20 items-center justify-center"
    >
      <AlertTriangle size={14} color="#D9564B" />
    </Pressable>
  );
}
