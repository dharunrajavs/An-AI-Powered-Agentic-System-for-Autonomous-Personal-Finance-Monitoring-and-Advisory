import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronRight,
  LogOut,
  Settings,
  Smartphone,
  Sparkles,
  MessageCircle,
} from 'lucide-react-native';
import type { MoreStackParamList, RootStackParamList } from '../../navigation/types';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgentActions, useProfile, useTransactions } from '../../hooks';

import { useAuthStore } from '../../store/authStore';

export function MoreMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: profile } = useProfile();
  const { data: transactions } = useTransactions();
  const { data: actions } = useAgentActions();
  const logout = useAuthStore((s) => s.logout);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log Out', 'You\'ll need to sign in again to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f9f9ff]">
      {/* Top App Bar */}
      <View className="px-6 py-3 flex-row items-center justify-between"
        style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-[#005c55] text-2xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>FinSense</Text>
        </View>
        <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0f766e] bg-[#e2e8f8] items-center justify-center">
          <Text className="text-[#3e4947] text-sm font-bold">{profile?.avatarInitials ?? 'A'}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-32" contentContainerStyle={{ gap: 16 }}>
        {/* Profile Header */}
        <View className="items-center mb-2">
          <View className="relative mb-3">
            <View className="w-24 h-24 rounded-full border-4 border-[#e2e8f8] bg-[#e9ddff] items-center justify-center overflow-hidden"
              style={{ elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
            >
              <Text className="text-[#6029c9] text-3xl font-bold">{profile?.avatarInitials ?? 'A'}</Text>
            </View>
            <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#005c55] items-center justify-center"
              style={{ elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
            >
              <Smartphone color="#ffffff" size={16} />
            </View>
          </View>
          <Text className="text-[#151c27] text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>
            {profile?.name ?? 'User'}
          </Text>
          <Text className="text-[#3e4947] text-sm font-medium mb-3" style={{ fontFamily: 'Inter', fontWeight: '500' }}>
            {profile?.email ?? 'user@example.com'}
          </Text>
          <View className="flex-row items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(108,248,187,0.2)' }}>
            <Sparkles color="#00714d" size={14} fill="#00714d" />
            <Text className="text-[#00714d] text-xs font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Premium</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row bg-[#f0f3ff] p-3 rounded-xl border border-[#bdc9c6]/30">
          <View className="flex-1 items-center">
            <Text className="text-[#3e4947] text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Member since</Text>
            <Text className="text-[#005c55] text-sm font-bold" style={{ fontFamily: 'Inter', fontWeight: '700' }}>Jan 2026</Text>
          </View>
          <View className="flex-1 items-center border-x border-[#bdc9c6]">
            <Text className="text-[#3e4947] text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Transactions</Text>
            <Text className="text-[#005c55] text-sm font-bold" style={{ fontFamily: 'Inter', fontWeight: '700' }}>{(transactions ?? []).length.toLocaleString()}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[#3e4947] text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Insights</Text>
            <Text className="text-[#005c55] text-sm font-bold" style={{ fontFamily: 'Inter', fontWeight: '700' }}>{(actions ?? []).length} Acted</Text>
          </View>
        </View>

        {/* Bank Accounts */}
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-[#bdc9c6]"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(0,92,85,0.1)' }}>
              <Text className="text-[#005c55] text-lg">🏦</Text>
            </View>
            <View>
              <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Bank Accounts</Text>
              <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Manage connected accounts</Text>
            </View>
          </View>
          <ChevronRight color="#6e7977" size={20} />
        </Pressable>

        {/* Reports */}
        <Pressable
          onPress={() => navigation.navigate('Reports')}
          className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-[#bdc9c6]"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(0,108,73,0.15)' }}>
              <Text className="text-[#006c49] text-lg">📊</Text>
            </View>
            <View>
              <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Reports</Text>
              <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Monthly financial summaries</Text>
            </View>
          </View>
          <ChevronRight color="#6e7977" size={20} />
        </Pressable>

        {/* Goals */}
        <Pressable
          onPress={() => navigation.navigate('Goals')}
          className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-[#bdc9c6]"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(224,105,47,0.12)' }}>
              <Text className="text-[#e0692f] text-lg">🎯</Text>
            </View>
            <View>
              <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Goals</Text>
              <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Plan and track your savings goals</Text>
            </View>
          </View>
          <ChevronRight color="#6e7977" size={20} />
        </Pressable>

        {/* Investments */}
        <Pressable
          onPress={() => navigation.navigate('Investments')}
          className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-[#bdc9c6]"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(121,72,227,0.1)' }}>
              <Text className="text-[#6029c9] text-lg">📈</Text>
            </View>
            <View>
              <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Investments</Text>
              <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Track your portfolio performance</Text>
            </View>
          </View>
          <ChevronRight color="#6e7977" size={20} />
        </Pressable>

        {/* FIRE Calculator */}
        <Pressable
          onPress={() => navigation.navigate('FireCalculator')}
          className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-[#bdc9c6]"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(224,105,47,0.12)' }}>
              <Text className="text-[#e0692f] text-lg">🔥</Text>
            </View>
            <View>
              <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>FIRE Calculator</Text>
              <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Plan your early retirement</Text>
            </View>
          </View>
          <ChevronRight color="#6e7977" size={20} />
        </Pressable>

        {/* AI & Automation */}
        <View className="rounded-xl overflow-hidden border border-[rgba(121,72,227,0.2)]"
          style={{ backgroundColor: 'rgba(240,230,255,0.4)' }}
        >
          <View className="px-4 py-2 border-b border-[rgba(121,72,227,0.1)]">
            <View className="flex-row items-center gap-1">
              <Sparkles color="#6029c9" size={14} fill="#6029c9" />
              <Text className="text-[#6029c9] text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>AI & Automation</Text>
            </View>
          </View>
          <Pressable
            onPress={() => rootNavigation.navigate('Main', { screen: 'Advisor' })}
            className="flex-row items-center justify-between px-4 py-4"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(121,72,227,0.1)' }}>
                <Sparkles color="#6029c9" size={20} />
              </View>
              <View>
                <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Agent Activity</Text>
                <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Active monitoring on</Text>
              </View>
            </View>
            <ChevronRight color="#6e7977" size={20} />
          </Pressable>
          <Pressable
            onPress={() => rootNavigation.navigate('Notifications')}
            className="flex-row items-center justify-between px-4 py-4 border-t border-[rgba(121,72,227,0.1)]"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(121,72,227,0.1)' }}>
                <Text className="text-[#6029c9] text-lg">🔔</Text>
              </View>
              <View>
                <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Notifications</Text>
                <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>View your alerts & activity</Text>
              </View>
            </View>
            <ChevronRight color="#6e7977" size={20} />
          </Pressable>
        </View>

        {/* Security */}
        <View className="bg-white rounded-xl border border-[#bdc9c6] overflow-hidden"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
        >
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(0,108,73,0.2)' }}>
                <Text className="text-[#006c49] text-lg">🔐</Text>
              </View>
              <View>
                <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Biometric Auth</Text>
                <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>FaceID / Fingerprint</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#bdc9c6', true: '#005c55' }}
              thumbColor="#ffffff"
            />
          </View>
          <Pressable className="flex-row items-center justify-between px-4 py-4 border-t border-[#bdc9c6]">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(0,108,73,0.2)' }}>
                <Text className="text-[#006c49] text-lg">🛡️</Text>
              </View>
              <View>
                <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Two-Factor Authentication</Text>
                <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Status: Enabled</Text>
              </View>
            </View>
            <ChevronRight color="#6e7977" size={20} />
          </Pressable>
        </View>

        {/* Data & Support */}
        <View className="bg-white rounded-xl border border-[#bdc9c6] overflow-hidden divide-y divide-[#bdc9c6]"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
        >
          <Pressable className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-lg items-center justify-center bg-[#e2e8f8]">
                <Text className="text-[#3e4947] text-lg">📥</Text>
              </View>
              <View>
                <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Export My Data</Text>
                <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>CSV / JSON formats</Text>
              </View>
            </View>
            <ChevronRight color="#6e7977" size={20} />
          </Pressable>
          <Pressable
            onPress={() => rootNavigation.navigate('SmsTracking', { screen: 'AutomaticExpense' })}
            className="flex-row items-center justify-between px-4 py-4 border-t border-[#bdc9c6]"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(0,92,85,0.1)' }}>
                <MessageCircle color="#005c55" size={20} />
              </View>
              <View>
                <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>SMS Expense Tracking</Text>
                <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Auto-detect bank SMS transactions</Text>
              </View>
            </View>
            <ChevronRight color="#6e7977" size={20} />
          </Pressable>
          <Pressable className="flex-row items-center justify-between px-4 py-4 border-t border-[#bdc9c6]">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-lg items-center justify-center bg-[#e2e8f8]">
                <Text className="text-[#3e4947] text-lg">❓</Text>
              </View>
              <View>
                <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Support & Documentation</Text>
              </View>
            </View>
            <ChevronRight color="#6e7977" size={20} />
          </Pressable>
          <Pressable
            onPress={() => Alert.alert('Delete Account', 'Are you sure? This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => {} },
            ])}
            className="flex-row items-center justify-between px-4 py-4 border-t border-[#bdc9c6]"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(186,26,26,0.3)' }}>
                <Text className="text-[#ba1a1a] text-lg">🗑️</Text>
              </View>
              <View>
                <Text className="text-[#ba1a1a] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Delete Account</Text>
              </View>
            </View>
            <ChevronRight color="#6e7977" size={20} />
          </Pressable>
        </View>

        {/* Settings */}
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-[#bdc9c6]"
          style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
        >
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(0,92,85,0.1)' }}>
              <Settings color="#005c55" size={20} />
            </View>
            <View>
              <Text className="text-[#151c27] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600' }}>Settings</Text>
              <Text className="text-[#3e4947] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>Profile, accounts, preferences</Text>
            </View>
          </View>
          <ChevronRight color="#6e7977" size={20} />
        </Pressable>

        {/* Logout & Version */}
        <View className="items-center gap-3 mt-4">
          <Pressable
            onPress={handleLogout}
            className="w-full py-4 px-4 rounded-xl items-center border-2 border-[#ba1a1a]"
          >
            <View className="flex-row items-center gap-2">
              <LogOut color="#ba1a1a" size={18} />
              <Text className="text-[#ba1a1a] text-sm font-semibold" style={{ fontFamily: 'Inter', fontWeight: '600', letterSpacing: 0.01 }}>Log Out</Text>
            </View>
          </Pressable>
          <Text className="text-[#6e7977] text-xs font-medium" style={{ fontFamily: 'Inter', fontWeight: '500' }}>App Version v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
