import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <View className={`bg-surface-container-lowest rounded-2xl border border-border p-4 shadow-sm ${className}`} {...rest}>
      {children}
    </View>
  );
}
