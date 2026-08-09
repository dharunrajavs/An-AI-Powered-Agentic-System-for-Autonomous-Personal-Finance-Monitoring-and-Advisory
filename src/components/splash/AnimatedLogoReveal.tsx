import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const R = 40;
const CX = 44;
const CY = 44;
const SIZE = 88;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface AnimatedLogoRevealProps {
  onFinish?: () => void;
}

export function AnimatedLogoReveal({ onFinish }: AnimatedLogoRevealProps) {
  const circleProgress = useSharedValue(0);
  const dotScale = useSharedValue(0);
  const sweepAngle = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateX = useSharedValue(24);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    circleProgress.value = withTiming(1, {
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
    });
    dotScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    });

    sweepAngle.value = withDelay(
      1400,
      withTiming(360, { duration: 1600, easing: Easing.inOut(Easing.ease) })
    );

    wordmarkOpacity.value = withDelay(
      3000,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
    );
    wordmarkTranslateX.value = withDelay(
      3000,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) })
    );

    taglineOpacity.value = withDelay(
      4200,
      withTiming(1, { duration: 1200, easing: Easing.out(Easing.ease) })
    );

    const timer = setTimeout(() => onFinish?.(), 6500);
    return () => clearTimeout(timer);
  }, []);

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - circleProgress.value),
  }));

  const sweepProps = useAnimatedProps(() => {
    const rad = (sweepAngle.value * Math.PI) / 180;
    return {
      x2: CX + R * Math.sin(rad),
      y2: CY - R * Math.cos(rad),
    };
  });

  const dotProps = useAnimatedProps(() => ({
    r: dotScale.value * 3.5,
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateX: wordmarkTranslateX.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <Animated.View style={styles.container}>
      <Animated.View style={styles.row}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <AnimatedLine
            x1={CX}
            y1={CY}
            stroke="#D4A017"
            strokeWidth={16}
            strokeLinecap="round"
            opacity={0.08}
            animatedProps={sweepProps}
          />
          <AnimatedLine
            x1={CX}
            y1={CY}
            stroke="#D4A017"
            strokeWidth={8}
            strokeLinecap="round"
            opacity={0.15}
            animatedProps={sweepProps}
          />
          <AnimatedCircle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#D4A017"
            strokeWidth={2.5}
            strokeDasharray={CIRCUMFERENCE}
            strokeLinecap="round"
            animatedProps={circleProps}
          />
          <AnimatedCircle
            cx={CX}
            cy={CY}
            fill="#D4A017"
            animatedProps={dotProps}
          />
          <AnimatedLine
            x1={CX}
            y1={CY}
            stroke="#D4A017"
            strokeWidth={2}
            strokeLinecap="round"
            animatedProps={sweepProps}
          />
        </Svg>

        <Animated.View style={[styles.wordmarkContainer, wordmarkStyle]}>
          <Animated.Text style={styles.wordmark}>PFMA</Animated.Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <Animated.Text style={styles.tagline}>
          Personal Finance Monitoring & Advisory
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wordmarkContainer: {
    marginLeft: 18,
  },
  wordmark: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 40,
    color: '#D4A017',
    letterSpacing: 6,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 13,
    color: '#F5F7FA',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
