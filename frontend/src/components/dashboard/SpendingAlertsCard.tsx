import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSpendingAlerts } from '../../hooks/useSpendingAlerts';

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export function SpendingAlertsCard() {
  const { alerts, count, dismissAlert } = useSpendingAlerts();

  if (count === 0) {
    return (
      <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-lg">🔔</Text>
          <Text className="text-on-surface font-heading-semibold text-sm">Spending Alerts</Text>
        </View>
        <Text className="text-on-surface-variant font-body text-xs leading-5">
          ✓ You're within budget — no category has exceeded its monthly limit.
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">🔔</Text>
          <Text className="text-on-surface font-heading-semibold text-sm">Spending Alerts</Text>
        </View>
        <View className="bg-alert/10 px-2 py-0.5 rounded-full">
          <Text className="text-alert font-body-bold text-[10px]">{count} over budget</Text>
        </View>
      </View>

      <View className="gap-3">
        {alerts.slice(0, 4).map((alert) => {
          const over = Math.max(0, alert.spent - alert.limit);

          return (
            <View key={alert.id} className="gap-1">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5 flex-1">
                  <Text className="text-alert">🚨</Text>
                  <Text className="text-on-surface font-body-medium text-sm">{alert.category}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-alert font-body-bold text-xs">{alert.percentage}%</Text>
                  <Pressable onPress={() => dismissAlert(alert.id)} className="px-1.5 py-0.5">
                    <Text className="text-on-surface-variant text-xs">✕</Text>
                  </Pressable>
                </View>
              </View>
              <Text className="text-on-surface-variant font-body text-xs leading-5">
                Spent{' '}
                <Text className="text-on-surface font-body-semibold">{formatINR(alert.spent)}</Text>{' '}
                of your {formatINR(alert.limit)} {alert.category} budget — over by{' '}
                <Text className="text-alert font-body-semibold">{formatINR(over)}</Text>.
              </Text>
              <View className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <View className="h-full rounded-full bg-alert" style={{ width: '100%' }} />
              </View>
            </View>
          );
        })}
      </View>

      {alerts.length > 4 && (
        <Text className="text-on-surface-variant font-body text-[10px] mt-2">
          +{alerts.length - 4} more alerts
        </Text>
      )}
    </View>
  );
}