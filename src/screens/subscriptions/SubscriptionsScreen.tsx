import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ChevronRight, Sparkles, TrendingUp, X } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/formatCurrency';

interface Subscription {
  id: string;
  name: string;
  plan: string;
  price: number;
  oldPrice?: number;
  nextDate: string;
  status: 'active' | 'unused' | 'pending';
  tags: string[];
  institution: string;
}

const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'netflix',
    name: 'Netflix Premium',
    plan: 'Monthly',
    price: 19.99,
    oldPrice: 15.99,
    nextDate: 'Mar 28',
    status: 'active',
    tags: ['Active'],
    institution: 'Netflix',
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    plan: 'Individual Plan',
    price: 54.99,
    nextDate: 'Apr 02',
    status: 'unused',
    tags: ['Unused'],
    institution: 'Adobe',
  },
  {
    id: 'spotify',
    name: 'Spotify Premium',
    plan: 'Family',
    price: 12.99,
    oldPrice: 9.99,
    nextDate: 'Apr 12',
    status: 'pending',
    tags: ['Active', 'Family'],
    institution: 'Spotify',
  },
  {
    id: 'icloud',
    name: 'iCloud+ Storage',
    plan: '50GB Plan',
    price: 0.99,
    nextDate: 'Mar 30',
    status: 'active',
    tags: ['Active'],
    institution: 'Apple',
  },
];

export function SubscriptionsScreen() {
  const navigation = useNavigation();

  const totalMonthly = SUBSCRIPTIONS.reduce((s, sub) => s + sub.price, 0);
  const totalYearly = totalMonthly * 12;
  const unusedCount = SUBSCRIPTIONS.filter((s) => s.status === 'unused').length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" className="active:opacity-70">
            <ArrowLeft color="#005c55" size={24} />
          </Pressable>
          <Text className="font-heading-bold text-lg text-on-surface">Subscriptions</Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" className="active:opacity-70">
          <X color="#6e7977" size={22} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View className="px-5 gap-4 mb-6">
          <View className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="font-body-medium text-xs text-on-surface-variant uppercase tracking-wider mb-1">Total Monthly Commitments</Text>
                <Text className="font-heading-lg text-heading-lg-mobile text-primary">
                  {formatCurrency(totalMonthly)}<Text className="text-on-surface-variant font-normal text-lg">/month</Text>
                </Text>
              </View>
              {unusedCount > 0 ? (
                <View className="bg-error-container px-3 py-1 rounded-full flex-row items-center gap-1">
                  <Text className="font-label-sm text-label-sm text-on-error-container">{unusedCount} unused detected</Text>
                </View>
              ) : null}
            </View>
            <View className="flex-row items-center gap-4">
              <View className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                <View className="h-full bg-primary w-3/4 rounded-full" />
              </View>
              <Text className="font-label-md text-label-md text-on-surface-variant">{formatCurrency(totalYearly)}/year</Text>
            </View>
          </View>

          <View className="bg-tertiary px-4 py-4 rounded-xl">
            <View className="flex-row justify-between mb-2">
              <Sparkles color="#ffffff" size={20} />
              <View className="px-2 py-0.5 rounded bg-on-tertiary/20">
                <Text className="font-label-sm text-label-sm text-on-tertiary">BETA</Text>
              </View>
            </View>
            <Text className="font-heading-md text-heading-md text-on-tertiary mb-1">Optimization</Text>
            <Text className="font-body-md text-body-md text-on-tertiary/80">You can reduce monthly spend by 26%.</Text>
          </View>
        </View>

        {/* Subscribed Services */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-heading-md text-heading-md text-on-surface">Subscribed Services</Text>
            <Pressable className="active:opacity-70" accessibilityRole="button">
              <Text className="font-label-md text-label-md text-primary">Filter</Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {SUBSCRIPTIONS.map((sub) => (
              <View key={sub.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-12 h-12 rounded-xl bg-surface-container items-center justify-center border border-outline-variant">
                      <Text className="text-lg font-bold text-on-surface-variant">
                        {sub.institution === 'Netflix' ? 'N' : sub.institution === 'Adobe' ? 'A' : sub.institution === 'Spotify' ? 'S' : 'i'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-label-md text-label-md text-on-surface">{sub.name}</Text>
                      <Text className="font-label-sm text-label-sm text-on-surface-variant">
                        {sub.plan} · Next: {sub.nextDate}
                      </Text>
                      <View className="flex-row gap-2 mt-1">
                        {sub.tags.map((tag) => {
                          const isUnused = tag === 'Unused';
                          const isPending = sub.status === 'pending';
                          return (
                            <View
                              key={tag}
                              className={`px-2 py-0.5 rounded-full ${
                                isUnused
                                  ? 'bg-error-container'
                                  : isPending
                                  ? 'bg-surface-container'
                                  : 'bg-secondary-container/30'
                              }`}
                            >
                              <Text
                                className={`font-label-sm text-[10px] ${
                                  isUnused
                                    ? 'text-on-error-container'
                                    : isPending
                                    ? 'text-on-surface-variant'
                                    : 'text-on-secondary-container'
                                }`}
                              >
                                {tag}
                              </Text>
                            </View>
                          );
                        })}
                        {sub.status === 'pending' ? (
                          <View className="flex-row items-center gap-1 bg-error-container/20 px-2 py-0.5 rounded-full">
                            <TrendingUp color="#ba1a1a" size={10} />
                            <Text className="font-label-sm text-[10px] text-error">Price increased</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-heading-md text-heading-md text-on-surface">{formatCurrency(sub.price)}</Text>
                    {sub.oldPrice ? (
                      <View className="flex-row items-center gap-1">
                        <Text className="font-label-sm text-label-sm text-on-surface-variant line-through">{formatCurrency(sub.oldPrice)}</Text>
                        <TrendingUp color="#ba1a1a" size={12} />
                      </View>
                    ) : null}
                    {sub.status === 'pending' ? (
                      <Text className="font-label-sm text-label-sm text-error/80">Pending update</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* AI Recommendation */}
        <View className="mx-5 mt-6 p-4 rounded-2xl border-l-4 border-l-tertiary" style={{ backgroundColor: 'rgba(240,230,255,0.4)' }}>
          <View className="flex-row items-start gap-3">
            <View className="bg-tertiary p-2 rounded-lg">
              <Sparkles color="#ffffff" size={16} />
            </View>
            <View className="flex-1">
              <Text className="font-label-md text-label-md text-tertiary mb-1">AI Recommendation</Text>
              <Text className="font-body-md text-body-md text-on-surface">
                Cancelling <Text className="font-bold">2 unused subscriptions</Text> (Adobe Creative Cloud & Fitness+) could save you{' '}
                <Text className="font-bold text-secondary">₹336/year</Text>. Would you like to start the cancellation process?
              </Text>
              <View className="flex-row gap-3 mt-3">
                <Pressable className="bg-tertiary px-4 py-2 rounded-full active:opacity-80" accessibilityRole="button">
                  <Text className="font-label-md text-label-md text-on-tertiary">Review Cancellation</Text>
                </Pressable>
                <Pressable className="border border-tertiary px-4 py-2 rounded-full active:opacity-80" accessibilityRole="button">
                  <Text className="font-label-md text-label-md text-tertiary">Dismiss</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
