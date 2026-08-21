import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useAgentStore } from '../../store/agentStore';
import { useUiStore } from '../../store/uiStore';
import { AgentStatus } from '../../types';
import { formatRelativeTime } from '../../utils';

const STATUS_META: Record<AgentStatus, { label: string; dot: string }> = {
  idle: { label: 'Idle', dot: 'bg-on-surface-muted' },
  monitoring: { label: 'Monitoring', dot: 'bg-success' },
  analyzing: { label: 'Analyzing', dot: 'bg-accent' },
  alert: { label: 'Alert', dot: 'bg-negative' },
};

interface AgentStatusPillProps {
  compact?: boolean;
  showLastChecked?: boolean;
}

export function AgentStatusPill({ compact = false, showLastChecked = false }: AgentStatusPillProps) {
  const status = useAgentStore((s) => s.status);
  const lastCheckedAt = useAgentStore((s) => s.lastCheckedAt);
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const meta = STATUS_META[status];
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status !== 'analyzing' || reducedMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse, reducedMotion]);

  return (
    <View className={`flex-row items-center gap-2 bg-surface-container-lowest rounded-full border border-border ${compact ? 'px-2.5 py-1' : 'px-3 py-1.5'}`}>
      <Animated.View style={{ opacity: pulse }} className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      <Text className={`text-on-surface font-body-medium ${compact ? 'text-[11px]' : 'text-xs'}`}>{meta.label}</Text>
      {showLastChecked ? (
        <Text className="text-muted font-body text-[11px]">· last checked {formatRelativeTime(lastCheckedAt)}</Text>
      ) : null}
    </View>
  );
}
