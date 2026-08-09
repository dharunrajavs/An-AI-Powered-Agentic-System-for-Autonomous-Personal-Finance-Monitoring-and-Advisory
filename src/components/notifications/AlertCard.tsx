import { AlertTriangle, CalendarClock, LucideIcon, Sparkles, TrendingUp, Trophy } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useMarkNotificationRead } from '../../hooks';
import { AlertType, AppNotification } from '../../types';
import { formatRelativeTime } from '../../utils';

// weekly_digest is the one deliberate exception to the token palette below:
// a dedicated purple accent (#8B7CF6) used only for this alert type.
const DIGEST_PURPLE = '#8B7CF6';

interface TypeMeta {
  icon: LucideIcon;
  color: string;
  bgClassName?: string;
  bgStyle?: { backgroundColor: string };
}

const TYPE_META: Record<AlertType, TypeMeta> = {
  overspend: { icon: TrendingUp, color: '#D9564B', bgClassName: 'bg-alert/20' },
  bill_due: { icon: CalendarClock, color: '#C9A44C', bgClassName: 'bg-gold/20' },
  unusual_transaction: { icon: AlertTriangle, color: '#D9564B', bgClassName: 'bg-alert/20' },
  goal_milestone: { icon: Trophy, color: '#3FA96A', bgClassName: 'bg-positive/20' },
  weekly_digest: { icon: Sparkles, color: DIGEST_PURPLE, bgStyle: { backgroundColor: 'rgba(139, 124, 246, 0.2)' } },
};

interface AlertCardProps {
  notification: AppNotification;
}

export function AlertCard({ notification }: AlertCardProps) {
  const markRead = useMarkNotificationRead();
  const meta = TYPE_META[notification.type];
  const Icon = meta.icon;

  return (
    <Pressable
      onPress={() => {
        if (!notification.read) markRead.mutate(notification.id);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}${notification.read ? '' : ', unread'}`}
      className={`flex-row gap-3 bg-surface rounded-2xl border p-4 active:opacity-80 ${
        notification.read ? 'border-border' : 'border-gold/40'
      }`}
    >
      <View
        className={`w-11 h-11 rounded-full items-center justify-center ${meta.bgClassName ?? ''}`}
        style={meta.bgStyle}
      >
        <Icon color={meta.color} size={20} />
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          {!notification.read ? <View className="w-2 h-2 rounded-full bg-gold" /> : null}
          <Text className="flex-1 text-white font-heading-semibold text-sm" numberOfLines={2}>
            {notification.title}
          </Text>
        </View>
        <Text className="text-muted font-body text-sm leading-5">{notification.message}</Text>
        <Text className="text-muted font-body text-xs mt-1">{formatRelativeTime(notification.createdAt)}</Text>
      </View>
    </Pressable>
  );
}
