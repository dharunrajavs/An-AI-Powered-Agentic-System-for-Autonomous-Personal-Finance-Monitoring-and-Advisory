import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useUiStore } from '../../store/uiStore';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

const DEFAULT_TREND = [
  41200, 41350, 41180, 41420, 41600, 41550, 41800, 42010, 41950, 42200, 42430, 42380, 42610, 42840,
];

interface FinancialPulseSparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function FinancialPulseSparkline({
  data = DEFAULT_TREND,
  width = 72,
  height = 24,
  color = '#C9A44C',
}: FinancialPulseSparklineProps) {
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const opacity = useRef(new Animated.Value(reducedMotion ? 0.85 : 0.5)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.85);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reducedMotion]);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height} accessibilityLabel="Recent balance trend">
      <AnimatedPolyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </Svg>
  );
}
