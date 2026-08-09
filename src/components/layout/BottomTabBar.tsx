import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Sparkles, Wallet, Receipt, Calendar, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS: Record<string, React.ReactNode> = {
  Home: <Wallet size={22} />,
  Transactions: <Receipt size={22} />,
  Budgets: <Calendar size={22} />,
  More: <User size={22} />,
};

const LABELS: Record<string, string> = {
  Home: 'Home',
  Transactions: 'Transactions',
  Budgets: 'Plan',
  More: 'Profile',
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const homeIdx = state.routes.findIndex((r) => r.name === 'Home');
  const txIdx = state.routes.findIndex((r) => r.name === 'Transactions');
  const budgetsIdx = state.routes.findIndex((r) => r.name === 'Budgets');
  const moreIdx = state.routes.findIndex((r) => r.name === 'More');
  const advisorRoute = state.routes.find((r) => r.name === 'Advisor');

  const renderTab = (route: (typeof state.routes)[0], isHome = false) => {
    const isFocused = state.routes.indexOf(route) === state.index;
    const label = LABELS[route.name] ?? route.name;
    const icon = ICONS[route.name];

    return (
      <Pressable
        key={route.key}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (state.index !== state.routes.indexOf(route) && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }}
        className={`items-center justify-center px-3 py-1 rounded-xl ${isHome && isFocused ? 'bg-secondary-container/20' : ''}`}
      >
        <View className="items-center justify-center">{icon}</View>
        <Text
          className={`text-[11px] mt-0.5 ${isFocused ? 'text-primary font-body-medium' : 'text-on-surface-variant font-body'}`}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      className="flex-row items-center justify-around bg-surface border-t border-outline-variant/30 rounded-t-xl"
      style={{ paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8, paddingHorizontal: 8 }}
    >
      {state.routes[homeIdx] && renderTab(state.routes[homeIdx], true)}
      {state.routes[txIdx] && renderTab(state.routes[txIdx])}

      <Pressable
        onPress={() => advisorRoute && navigation.navigate('Advisor')}
        className="bg-tertiary-container rounded-full p-4 -mt-6 shadow-md border-4 border-background"
      >
        <Sparkles color="#ffffff" size={24} />
      </Pressable>

      {state.routes[budgetsIdx] && renderTab(state.routes[budgetsIdx])}
      {state.routes[moreIdx] && renderTab(state.routes[moreIdx])}
    </View>
  );
}
