import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { MessageCircle, Moon, Sun } from 'lucide-react-native';
import { Screen } from '../../components/layout';
import { Card, ConfirmDialog, ErrorState, LoadingSkeletonList } from '../../components/ui';
import { AgentAutonomySlider } from '../../components/settings/AgentAutonomySlider';
import { SmsTrackingSettings } from '../../components/settings/SmsTrackingSettings';
import { NotificationPreferences } from '../../components/settings/NotificationPreferences';
import { ProfileEditor } from '../../components/settings/ProfileEditor';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { useAgentPreferences, useProfile } from '../../hooks';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export function SettingsScreen() {
  const profileQuery = useProfile();
  const preferencesQuery = useAgentPreferences();
  const logout = useAuthStore((state) => state.logout);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const isLoading = profileQuery.isLoading || preferencesQuery.isLoading;
  const isError = profileQuery.isError || preferencesQuery.isError;

  const handleRetry = () => {
    profileQuery.refetch();
    preferencesQuery.refetch();
  };

  if (isLoading) {
    return (
      <Screen title="Settings" contentClassName="pt-2">
        <LoadingSkeletonList rows={5} rowHeight={110} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen title="Settings">
        <ErrorState message="We couldn't load your settings. Please try again." onRetry={handleRetry} />
      </Screen>
    );
  }

  return (
    <Screen title="Settings" contentClassName="gap-5 pt-2">
      <Card className="gap-4">
        <Text className="font-heading-semibold text-base text-on-surface">Profile</Text>
        <ProfileEditor />
      </Card>

      <Card className="gap-4">
        <View className="flex-row items-center gap-2">
          {useThemeStore.getState().mode === 'dark' ? <Moon color="#005c55" size={18} /> : <Sun color="#005c55" size={18} />}
          <Text className="font-heading-semibold text-base text-on-surface">Appearance</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-on-surface-variant font-body text-sm">Dark mode</Text>
          <Switch
            value={useThemeStore((s) => s.mode === 'dark')}
            onValueChange={() => useThemeStore.getState().toggleTheme()}
            trackColor={{ false: '#dae2fd', true: '#0f766e' }}
            thumbColor={useThemeStore((s) => s.mode === 'dark' ? '#a3faef' : '#ffffff')}
          />
        </View>
      </Card>

      <Card className="gap-4">
        <View className="flex-row items-center gap-2">
          <MessageCircle color="#005c55" size={18} />
          <Text className="font-heading-semibold text-base text-on-surface">SMS Expense Tracking</Text>
        </View>
        <SmsTrackingSettings />
      </Card>

      <Card className="gap-4">
        <Text className="font-heading-semibold text-base text-on-surface">Agent Autonomy</Text>
        <AgentAutonomySlider />
      </Card>

      <Card className="gap-4">
        <Text className="font-heading-semibold text-base text-on-surface">Notifications</Text>
        <NotificationPreferences />
      </Card>

      <Card className="gap-4">
        <Text className="font-heading-semibold text-base text-on-surface">Security</Text>
        <SecuritySettings />
      </Card>

      <Pressable
        onPress={() => setLogoutConfirmVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        className="items-center rounded-xl border border-alert bg-alert/10 py-3.5 active:opacity-80"
      >
        <Text className="font-body-semibold text-sm text-alert">Log Out</Text>
      </Pressable>

      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Log out"
        message="You'll need to sign in again to access your account."
        confirmLabel="Log Out"
        destructive
        onConfirm={() => {
          setLogoutConfirmVisible(false);
          logout();
        }}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
    </Screen>
  );
}
