import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import type { RootNavigationProp } from '../../navigation/types';
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/authStore';
import { AgentStatusPill } from './AgentStatusPill';
import { FinancialPulseSparkline } from './FinancialPulseSparkline';

interface TopBarProps {
  title: string;
  showBell?: boolean;
  showProfile?: boolean;
}

export function TopBar({ title, showBell = true, showProfile = false }: TopBarProps) {
  const navigation = useNavigation<RootNavigationProp>();
  const { data: notifications } = useNotifications();
  const { data: profile } = useProfile();
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const handleDevReset = () => {
    Alert.alert(
      'Reset app state',
      'This will clear all data and restart the onboarding flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('finance-advisor-auth');
            useAuthStore.setState({
              hasSeenCarousel: false,
              isAuthenticated: false,
              hasCompletedOnboarding: false,
              hasCompletedSyncing: false,
            hasCompletedSmsTracking: false,
              email: null,
            });
          },
        },
      ]
    );
  };

  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
      <View className="flex-row items-center gap-3 flex-1">
        {showProfile ? (
          <Pressable
            onPress={() => navigation.navigate('More', { screen: 'Settings' })}
            onLongPress={handleDevReset}
            accessibilityRole="button"
            accessibilityLabel="Open profile and settings"
            className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-70"
          >
            <Text className="text-on-primary font-body-semibold text-xs">{profile?.avatarInitials ?? '··'}</Text>
          </Pressable>
        ) : null}
        <View className="flex-1 gap-1.5">
          <Text className="text-on-surface font-heading-bold text-xl">{title}</Text>
          <AgentStatusPill compact />
        </View>
      </View>
      <View className="flex-row items-center gap-4">
        <FinancialPulseSparkline />
        {showBell ? (
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            accessibilityRole="button"
            accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center active:opacity-70"
          >
            <Bell color="#131b2e" size={18} />
            {unreadCount > 0 ? (
              <View className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-alert" />
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
