import { CheckCircle2, Info, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiStore } from '../../store/uiStore';

const VARIANT_STYLES = {
  success: { bg: '#16301F', border: '#3FA96A', icon: CheckCircle2, iconColor: '#3FA96A' },
  error: { bg: '#33191A', border: '#D9564B', icon: XCircle, iconColor: '#D9564B' },
  info: { bg: '#161D2B', border: '#232B3D', icon: Info, iconColor: '#7C8797' },
};

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const hideToast = useUiStore((s) => s.hideToast);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    if (!toast) return;

    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    const timer = setTimeout(() => {
      Animated.timing(translateY, { toValue: -80, duration: 200, useNativeDriver: true }).start(() => hideToast());
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, translateY, hideToast]);

  if (!toast) return null;

  const variant = VARIANT_STYLES[toast.variant];
  const Icon = variant.icon;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 16,
        right: 16,
        transform: [{ translateY }],
        backgroundColor: variant.bg,
        borderColor: variant.border,
        borderWidth: 1,
        zIndex: 100,
      }}
      className="flex-row items-center gap-3 rounded-2xl px-4 py-3"
      accessibilityLiveRegion="polite"
    >
      <Icon color={variant.iconColor} size={20} />
      <Text className="text-white font-body text-sm flex-1">{toast.message}</Text>
    </Animated.View>
  );
}
