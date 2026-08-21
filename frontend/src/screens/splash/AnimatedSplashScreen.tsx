import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { StatusBar, View } from 'react-native';
import { AnimatedLogoReveal } from '../../components/splash/AnimatedLogoReveal';
import { useAuthStore } from '../../store/authStore';

export function AnimatedSplashScreen() {
  const completeSplash = useAuthStore((s) => s.completeSplash);
  const hasCompleted = useRef(false);

  useFocusEffect(
    useCallback(() => {
      hasCompleted.current = false;
      return () => {};
    }, [])
  );

  const handleFinish = () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    completeSplash();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#18181B', alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />
      <AnimatedLogoReveal onFinish={handleFinish} />
    </View>
  );
}
