import { useNavigation } from '@react-navigation/native';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Film,
  Gamepad2,
  Lightbulb,
  Music,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgentInsights, useDismissInsight, useProfile } from '../../hooks';

type FilterValue = 'All' | 'Alerts' | 'Tips' | 'Anomalies' | 'Upcoming';

const FILTERS: FilterValue[] = ['All', 'Alerts', 'Tips', 'Anomalies', 'Upcoming'];

const MOCK_DETAIL = {
  id: 'detail_001',
  severity: 'High Severity',
  date: 'May 12, 14:32',
  title: 'Unusual Subscription Spike',
  description:
    "We detected a significant variance in your recurring entertainment expenses. This pattern deviates from your historical spending by 42.5%.",
  evidence: [
    { icon: 'movie', label: 'Netflix Premium', sub: 'Entertainment', amount: '₹19.99' },
    { icon: 'music_note', label: 'Spotify Family', sub: 'Entertainment', amount: '₹16.99' },
    { icon: 'sports_esports', label: 'Xbox Game Pass', sub: 'Gaming', amount: '₹14.99' },
  ],
  analysis:
    'These overlapping services may indicate redundant spending. For example, your Netflix plan has increased in price while you\'ve also added Xbox Game Pass, which includes its own streaming content.',
  suggestion:
    'Consolidate your subscriptions. Canceling Netflix for 2 months would offset the Xbox annual cost.',
  actionLabel: 'Review Subscriptions',
};

function insightCardColors(type: string) {
  switch (type) {
    case 'alert':
      return {
        border: 'border-l-[#ba1a1a]',
        badgeBg: 'bg-[#7948e3]',
        badgeText: 'text-[#f0e6ff]',
        badgeIcon: (s: number, c: string) => <Sparkles color={c} size={s} fill={c} />,
        badgeLabel: 'Anomaly Agent',
      };
    case 'suggestion':
      return {
        border: 'border-l-[#7948e3]',
        badgeBg: 'bg-[#7948e3]/10',
        badgeText: 'text-[#6029c9]',
        badgeIcon: (_s: number, c: string) => <Lightbulb color={c} size={14} fill={c} />,
        badgeLabel: 'Savings Agent',
      };
    case 'summary':
      return {
        border: 'border-l-[#006c49]',
        badgeBg: 'bg-[#006c49]/20',
        badgeText: 'text-[#006c49]',
        badgeIcon: (_s: number, c: string) => <CheckCircle2 color={c} size={14} />,
        badgeLabel: 'Budget Agent',
      };
    default:
      return {
        border: 'border-l-[#f59e0b]',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        badgeIcon: (_s: number, c: string) => <AlertTriangle color={c} size={14} />,
        badgeLabel: 'Risk Agent',
      };
  }
}

function EvidenceIcon({ icon }: { icon: string }) {
  const props = { color: '#005c55', size: 20 };
  switch (icon) {
    case 'movie':
      return <Film {...props} />;
    case 'music_note':
      return <Music {...props} />;
    case 'sports_esports':
      return <Gamepad2 {...props} />;
    default:
      return <Film {...props} />;
  }
}

export function InsightsScreen() {
  const navigation = useNavigation();
  const { data: profile } = useProfile();
  const { data: insights = [] } = useAgentInsights();
  const dismissInsight = useDismissInsight();
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('All');
  const [detailView, setDetailView] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);

  const filtered =
    selectedFilter === 'All'
      ? insights
      : insights.filter((i) => {
          const type = i.type.toLowerCase();
          if (selectedFilter === 'Alerts') return type === 'alert';
          if (selectedFilter === 'Tips') return type === 'suggestion' || type === 'summary';
          if (selectedFilter === 'Anomalies') return type === 'alert';
          if (selectedFilter === 'Upcoming') return false;
          return true;
        });

  const handleCardPress = (insight: any) => {
    setSelectedInsight(insight);
    setDetailView(true);
  };

  const handleBack = () => {
    setDetailView(false);
    setSelectedInsight(null);
  };

  if (detailView) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f9f9ff]">
        <ScrollView className="flex-1 px-6 pt-4 pb-32" contentContainerStyle={{ gap: 24 }}>
          {/* Back */}
          <Pressable onPress={handleBack} className="flex-row items-center gap-1">
            <ArrowLeft color="#005c55" size={20} />
            <Text className="text-[#005c55] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Back to Feed</Text>
          </Pressable>

          {/* Severity + Date */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-[#ffdad6] px-3 py-1 rounded-full">
                <Text className="text-[#93000a] text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'Inter', fontWeight: '700' }}>High Severity</Text>
              </View>
              <Text className="text-[#3e4947] text-xs" style={{ fontFamily: 'Inter', fontWeight: '500' }}>{MOCK_DETAIL.date}</Text>
            </View>
            <Text className="text-[#151c27] text-2xl font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>{MOCK_DETAIL.title}</Text>
            <Text className="text-[#3e4947] text-lg leading-7" style={{ fontFamily: 'Inter' }}>{MOCK_DETAIL.description}</Text>
          </View>

          {/* Evidence */}
          <View>
            <Text className="text-[#3e4947] text-sm font-semibold mb-3 uppercase tracking-wider" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Evidence ({MOCK_DETAIL.evidence.length} Transactions)</Text>
            <View className="bg-white rounded-xl border border-[#bdc9c6] overflow-hidden"
              style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
            >
              {MOCK_DETAIL.evidence.map((item, i) => (
                <View
                  key={item.label}
                  className="flex-row items-center justify-between px-4 py-4"
                  style={{ borderBottomWidth: i < MOCK_DETAIL.evidence.length - 1 ? 1 : 0, borderBottomColor: 'rgba(189,201,198,0.3)' }}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-[#e7eefe] items-center justify-center">
                      <EvidenceIcon icon={item.icon} />
                    </View>
                    <View>
                      <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>{item.label}</Text>
                      <Text className="text-[#3e4947] text-xs" style={{ fontFamily: 'Inter', fontWeight: '500' }}>{item.sub}</Text>
                    </View>
                  </View>
                  <Text className="text-[#ba1a1a] text-lg font-bold" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>{item.amount}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Analysis */}
          <View>
            <Text className="text-[#3e4947] text-sm font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>What this means</Text>
            <Text className="text-[#151c27] text-base mb-4 leading-6" style={{ fontFamily: 'Inter' }}>{MOCK_DETAIL.analysis}</Text>
            <View className="rounded-2xl p-6 border-2"
              style={{ backgroundColor: 'rgba(121,72,227,0.1)', borderColor: 'rgba(121,72,227,0.3)' }}
            >
              <View className="flex-row items-start gap-4 mb-4">
                <Sparkles color="#6029c9" size={24} />
                <View className="flex-1">
                  <Text className="text-[#5516be] text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>Suggested Action</Text>
                  <Text className="text-[#3e4947] text-base mt-1 leading-6" style={{ fontFamily: 'Inter' }}>{MOCK_DETAIL.suggestion}</Text>
                </View>
              </View>
              <Pressable className="w-full bg-[#7948e3] py-3 rounded-xl items-center"
                style={{ elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
              >
                <Text className="text-white text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>{MOCK_DETAIL.actionLabel}</Text>
              </Pressable>
            </View>
          </View>

          {/* Feedback */}
          <View className="flex-row items-center justify-center gap-6 border-t border-[#bdc9c6] pt-6">
            <Text className="text-[#3e4947] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Was this insight helpful?</Text>
            <View className="flex-row gap-2">
              <Pressable className="w-10 h-10 rounded-full border border-[#bdc9c6] items-center justify-center">
                <ThumbsUp color="#3e4947" size={18} />
              </Pressable>
              <Pressable className="w-10 h-10 rounded-full border border-[#bdc9c6] items-center justify-center">
                <ThumbsDown color="#3e4947" size={18} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f9f9ff]">
      {/* Top Nav */}
      <View className="px-6 py-3 flex-row items-center justify-between"
        style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
      >
        <View className="flex-row items-center gap-2">
          <TrendingUp color="#005c55" size={22} />
          <Text className="text-[#005c55] text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>FinSense</Text>
        </View>
        <View className="flex-row items-center gap-4">
          <Pressable>
            <Search color="#3e4947" size={22} />
          </Pressable>
          <View className="w-10 h-10 rounded-full bg-[#e2e8f8] border border-[#bdc9c6] items-center justify-center overflow-hidden">
            <Text className="text-[#3e4947] text-sm font-bold">{profile?.avatarInitials ?? 'A'}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-32" contentContainerStyle={{ gap: 24 }}>
        {/* Header */}
        <View>
          <Text className="text-[#151c27] text-3xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>AI Insights</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTERS.map((f) => {
              const active = selectedFilter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setSelectedFilter(f)}
                  className={`px-4 py-2 rounded-full ${active ? 'bg-[#005c55]' : 'bg-[#e7eefe]'}`}
                >
                  <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-[#3e4947]'}`}
                    style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}
                  >
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Insights Cards */}
        {filtered.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Text className="text-[#3e4947] text-base">No insights for this filter</Text>
          </View>
        ) : (
          <View className="gap-4">
            {filtered.map((insight, idx) => {
              const colors = insightCardColors(insight.type);
              const isAlert = insight.type === 'alert';
              return (
                <Pressable
                  key={insight.id}
                  onPress={() => handleCardPress(insight)}
                  className={`rounded-xl p-4 border-l-4 ${colors.border} ${isAlert ? 'bg-[#7948e3]/5' : 'bg-white'} border border-[#bdc9c6]/30`}
                  style={!isAlert ? { elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                >
                  {/* Unread dot */}
                  {isAlert && (
                    <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#6029c9]" />
                  )}

                  {/* Badge + Time */}
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${colors.badgeBg}`}>
                      {colors.badgeIcon(14, isAlert ? '#f0e6ff' : '#6029c9')}
                      <Text className={`text-[10px] font-semibold ${colors.badgeText}`} style={{ fontFamily: 'Inter', fontWeight: '600' }}>
                        {colors.badgeLabel}
                      </Text>
                    </View>
                    <Text className="text-[#3e4947] text-[10px] font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>
                      {formatTimeAgo(insight.createdAt)}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text className="text-[#151c27] text-lg font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>
                    {insight.message.length > 60 ? insight.message.slice(0, 60) + '...' : insight.message}
                  </Text>

                  {/* Description */}
                  <Text className="text-[#3e4947] text-sm mb-3 leading-5" style={{ fontFamily: 'Inter' }} numberOfLines={2}>
                    {insight.message}
                  </Text>

                  {/* Actions */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[#005c55] text-xs font-semibold underline underline-offset-4" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>
                      Why am I seeing this?
                    </Text>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => dismissInsight.mutate(insight.id)}
                        className="px-3 py-2"
                      >
                        <Text className="text-[#3e4947] text-xs font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Dismiss</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleCardPress(insight)}
                        className="bg-[#005c55] px-4 py-2 rounded-lg"
                      >
                        <Text className="text-white text-xs font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>
                          {insight.type === 'summary' ? 'View History' : insight.type === 'alert' ? 'Review' : 'Optimize'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
