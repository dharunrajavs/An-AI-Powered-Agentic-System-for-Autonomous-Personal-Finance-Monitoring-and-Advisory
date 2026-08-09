import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSpendingAlerts } from '../../hooks/useSpendingAlerts';

export function SpendingAlertsCard() {
  const { alerts, count, criticalAlerts, dismissAlert } = useSpendingAlerts();

  if (count === 0) return null;

  return (
    <View className="mx-5 mb-4 bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">🔔</Text>
          <Text className="text-on-surface font-heading-semibold text-sm">Spending Alerts</Text>
        </View>
        {criticalAlerts.length > 0 && (
          <View className="bg-alert/10 px-2 py-0.5 rounded-full">
            <Text className="text-alert font-body-bold text-[10px]">{criticalAlerts.length} critical</Text>
          </View>
        )}
      </View>

      <View className="gap-2">
        {alerts.slice(0, 4).map((alert) => {
          const barWidth = Math.min(alert.percentage, 100);
          const isCritical = alert.percentage >= 90;

          return (
            <View key={alert.id} className="gap-1">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5 flex-1">
                  <Text className={`font-body-semibold text-sm ${isCritical ? 'text-alert' : 'text-warning'}`}>
                    {alert.percentage >= 100 ? '🚨' : alert.percentage >= 90 ? '⚠️' : '⚡'}
                  </Text>
                  <Text className="text-on-surface font-body-medium text-sm">{alert.category}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className={`font-body-bold text-xs ${isCritical ? 'text-alert' : 'text-warning'}`}>
                    {alert.percentage}%
                  </Text>
                  <Pressable onPress={() => dismissAlert(alert.id)} className="px-1.5 py-0.5">
                    <Text className="text-on-surface-variant text-xs">✕</Text>
                  </Pressable>
                </View>
              </View>
              <View className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${isCritical ? 'bg-alert' : alert.percentage >= 75 ? 'bg-warning' : 'bg-primary'}`}
                  style={{ width: `${barWidth}%` }}
                />
              </View>
              <Text className="text-on-surface-variant font-body text-[9px]">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(alert.spent)} / {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(alert.limit)}
              </Text>
            </View>
          );
        })}
      </View>

      {alerts.length > 4 && (
        <Text className="text-on-surface-variant font-body text-[10px] mt-2">+{alerts.length - 4} more alerts</Text>
      )}
    </View>
  );
}
