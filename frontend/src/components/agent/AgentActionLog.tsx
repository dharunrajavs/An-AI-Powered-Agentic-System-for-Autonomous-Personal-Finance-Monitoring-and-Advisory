import { AlertTriangle, Filter, Grid3X3, RefreshCw, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAgentActions } from '../../hooks';
import { AgentAction } from '../../types';
import { EmptyState, ErrorState, LoadingSkeletonList } from '../ui';

function detectAgentType(description: string): {
  label: string;
  icon: 'insight' | 'sync' | 'risk' | 'categorizer';
  color: string;
  border: string;
  pillBg: string;
  pillText: string;
} {
  const lower = description.toLowerCase();
  if (lower.includes('insight') || lower.includes('alert') || lower.includes('overspend') || lower.includes('flag') || lower.includes('spending'))
    return { label: 'Insight Agent', icon: 'insight', color: '#6029c9', border: '#6029c9', pillBg: 'bg-[#7948e3]/10', pillText: 'text-[#6029c9]' };
  if (lower.includes('sync') || lower.includes('transactions') || lower.includes('bank') || lower.includes('chase') || lower.includes('data'))
    return { label: 'Ingestion Agent', icon: 'sync', color: '#3e4947', border: '#bdc9c6', pillBg: 'bg-surface-container', pillText: 'text-on-surface-variant' };
  if (lower.includes('risk') || lower.includes('unusual') || lower.includes('anomaly') || lower.includes('warning') || lower.includes('duplicate'))
    return { label: 'Risk Radar', icon: 'risk', color: '#ba1a1a', border: '#ba1a1a', pillBg: 'bg-[#ffdad6]', pillText: 'text-[#93000a]' };
  if (lower.includes('categor') || lower.includes('categorize') || lower.includes('match') || lower.includes('processed') || lower.includes('pending'))
    return { label: 'Categorizer Agent', icon: 'categorizer', color: '#3e4947', border: '#bdc9c6', pillBg: 'bg-surface-container', pillText: 'text-on-surface-variant' };
  return { label: 'Insight Agent', icon: 'insight', color: '#6029c9', border: '#6029c9', pillBg: 'bg-[#7948e3]/10', pillText: 'text-[#6029c9]' };
}

function AgentIcon({ type, color }: { type: string; color: string }) {
  const s = 20;
  switch (type) {
    case 'insight':
      return <Sparkles color={color} size={s} fill={color} />;
    case 'sync':
      return <RefreshCw color={color} size={s} />;
    case 'risk':
      return <AlertTriangle color={color} size={s} />;
    case 'categorizer':
      return <Grid3X3 color={color} size={s} />;
    default:
      return <Sparkles color={color} size={s} fill={color} />;
  }
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function ActionCard({ action, index }: { action: AgentAction; index: number }) {
  const agent = detectAgentType(action.description);
  const isInsight = agent.icon === 'insight';
  const isRisk = agent.icon === 'risk';

  return (
    <View className="relative pl-0 md:pl-12">
      <View
        className={`rounded-2xl p-4 border-l-4 shadow-sm ${isInsight ? 'border-l-[#6029c9]' : isRisk ? 'border-l-[#ba1a1a]' : 'border-l-[#bdc9c6]'} ${isInsight ? 'bg-white/70' : 'bg-white'} border border-[#bdc9c6]/20`}
        style={isInsight ? { backgroundColor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(121,72,227,0.15)' } : {}}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>
              {formatTimeAgo(action.timestamp)}
            </Text>
            <View className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]" />
            <Text className="text-xs font-bold" style={{ fontFamily: 'Inter', fontWeight: '700', color: agent.color }}>
              {agent.label}
            </Text>
            {isInsight && (
              <View className="px-2 py-0.5 bg-[#7948e3]/10 rounded">
                <Text className="text-[#6029c9] text-[10px] font-bold uppercase tracking-tight" style={{ fontFamily: 'Inter', fontWeight: '700' }}>
                  High Impact
                </Text>
              </View>
            )}
            {isRisk && (
              <View className="px-2 py-0.5 bg-[#ffdad6] rounded">
                <Text className="text-[#93000a] text-[10px] font-bold uppercase" style={{ fontFamily: 'Inter', fontWeight: '700' }}>
                  Anomaly
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Title for insight cards */}
        {isInsight && (
          <Text className="text-[#151c27] text-lg font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>
            {action.description.length > 50 ? action.description.slice(0, 50) + '...' : action.description}
          </Text>
        )}

        {/* Description */}
        <Text className="text-[#3e4947] text-sm leading-5 mb-4" style={{ fontFamily: 'Inter' }}>
          {action.description}
          {(agent.icon === 'sync' || agent.icon === 'categorizer') && (
            <Text className="font-bold text-[#151c27]">
              {agent.icon === 'sync' ? ' Chase Bank' : ''}
              {agent.icon === 'categorizer' ? ' on all entries.' : ''}
            </Text>
          )}
        </Text>

        {/* Extra tags for insight */}
        {isInsight && (
          <View className="flex-row gap-2">
            <View className="flex-row items-center gap-1.5 px-3 py-1 bg-[#e7eefe] rounded-lg">
              <View className="w-2 h-2 rounded-full bg-[#6029c9]" />
              <Text className="text-xs font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600', color: '#3e4947' }}>
                {action.description.toLowerCase().includes('duplicate') ? 'Found: Duplicate Billing' :
                 action.description.toLowerCase().includes('subscription') ? 'Recurring Charge' :
                 'Action Required'}
              </Text>
            </View>
          </View>
        )}

        {/* Technical details for ingestion */}
        {agent.icon === 'sync' && (
          <View className="mt-4 pt-4 border-t border-[#bdc9c6]/10 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-[#6e7977] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Payload Size</Text>
              <Text className="text-[#6e7977] text-xs" style={{ fontFamily: 'monospace' }}>1.2 MB</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[#6e7977] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Execution Time</Text>
              <Text className="text-[#6e7977] text-xs" style={{ fontFamily: 'monospace' }}>420ms</Text>
            </View>
          </View>
        )}

        {/* Action buttons */}
        {action.status === 'proposed' && (
          <View className="flex-row gap-2 mt-3">
            <Pressable
              className="flex-1 bg-[#005c55] py-2.5 rounded-xl items-center"
            >
              <Text className="text-white text-xs font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Review</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

export function AgentActionLog() {
  const { data: actions, isLoading, isError, refetch } = useAgentActions();

  if (isLoading) {
    return (
      <View className="flex-1 py-4">
        <LoadingSkeletonList rows={6} rowHeight={120} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center">
        <ErrorState message="We couldn't load the agent activity log." onRetry={() => refetch()} />
      </View>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <EmptyState
          title="No agent activity yet"
          message="Actions your agent proposes or takes on your behalf will show up here."
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-[#151c27] text-2xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>Agent Activity</Text>
        <Text className="text-[#3e4947] text-base" style={{ fontFamily: 'Inter' }}>What your AI has been up to</Text>
      </View>

      {/* Summary Card */}
      <View className="flex-row items-center gap-2 bg-[#e7eefe] p-4 rounded-xl border border-[#bdc9c6]/30 mb-6">
        <View className="flex-1">
          <Text className="text-[#3e4947] text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>
            Today's Summary
          </Text>
          <Text className="text-[#005c55] text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>
            {actions.length} runs · {actions.filter((a) => a.status === 'proposed').length} pending
          </Text>
        </View>
        <Pressable className="p-2 bg-white rounded-lg border border-[#bdc9c6]">
          <Filter color="#3e4947" size={20} />
        </Pressable>
      </View>

      {/* Status Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ gap: 8 }}>
        <View className="flex-row items-center gap-2 px-4 py-2 rounded-full"
          style={{ backgroundColor: 'rgba(108,248,187,0.2)', borderWidth: 1, borderColor: 'rgba(0,108,73,0.3)' }}
        >
          <View className="w-2 h-2 rounded-full bg-[#006c49]" />
          <Text className="text-[#00714d] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Ingestion ● active</Text>
        </View>
        {['Categorizer', 'Risk Radar', 'Strategy Gen'].map((name) => (
          <View key={name} className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-[#e7eefe] border border-[#bdc9c6]/30">
            <View className="w-2 h-2 rounded-full bg-[#6e7977]" />
            <Text className="text-[#3e4947] text-sm font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>{name} ● idle</Text>
          </View>
        ))}
      </ScrollView>

      {/* Activity List */}
      <View className="gap-6">
        {(actions ?? []).map((action, index) => (
          <ActionCard key={action.id} action={action} index={index} />
        ))}
      </View>
    </ScrollView>
  );
}
