import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AlertCard } from '../../components/notifications/AlertCard';
import { NotificationFilter, NotificationFilterValue } from '../../components/notifications/NotificationFilter';
import { Screen } from '../../components/layout';
import { ConfirmDialog, EmptyState, ErrorState, LoadingSkeletonList } from '../../components/ui';
import { useClearAllNotifications, useMarkAllNotificationsRead, useNotifications } from '../../hooks';

export function NotificationsScreen() {
  const { data: notifications, isLoading, isError, refetch } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();
  const [filter, setFilter] = useState<NotificationFilterValue>('all');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const filtered = (notifications ?? []).filter((n) => filter === 'all' || n.type === filter);

  return (
    <Screen title="Notifications" showBell={false}>
      <View className="gap-4 pt-1">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
            className="active:opacity-70"
          >
            <Text className="text-gold font-body-semibold text-xs">Mark all read</Text>
          </Pressable>
          <Pressable
            onPress={() => setConfirmVisible(true)}
            disabled={clearAll.isPending}
            accessibilityRole="button"
            accessibilityLabel="Clear all notifications"
            className="active:opacity-70"
          >
            <Text className="text-alert font-body-semibold text-xs">Clear all</Text>
          </Pressable>
        </View>

        <NotificationFilter value={filter} onChange={setFilter} />

        {isLoading ? (
          <LoadingSkeletonList rows={5} rowHeight={84} />
        ) : isError ? (
          <ErrorState message="We couldn't load your notifications." onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState title="All clear" message="No alerts — your finances look healthy" />
        ) : (
          <View className="gap-3">
            {filtered.map((notification) => (
              <AlertCard key={notification.id} notification={notification} />
            ))}
          </View>
        )}
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title="Clear all notifications?"
        message="This will permanently remove all notifications. This can't be undone."
        confirmLabel="Clear all"
        destructive
        onConfirm={() => {
          clearAll.mutate();
          setConfirmVisible(false);
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}
