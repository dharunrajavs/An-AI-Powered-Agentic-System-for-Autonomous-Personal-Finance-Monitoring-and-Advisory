import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, ViewStyle } from 'react-native';
import { useUiStore } from '../../store/uiStore';

interface LoadingSkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({ width = '100%', height = 16, borderRadius = 8, style }: LoadingSkeletonProps) {
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const opacity = useRef(new Animated.Value(reducedMotion ? 0.6 : 0.4)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.6);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, easing: Easing.ease, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      className="bg-surface-container-high"
      style={[{ width, height, borderRadius, opacity }, style]}
    />
  );
}

export function LoadingSkeletonList({ rows = 5, rowHeight = 64 }: { rows?: number; rowHeight?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingSkeleton key={`skeleton-${i}`} height={rowHeight} borderRadius={16} />
      ))}
    </View>
  );
}
