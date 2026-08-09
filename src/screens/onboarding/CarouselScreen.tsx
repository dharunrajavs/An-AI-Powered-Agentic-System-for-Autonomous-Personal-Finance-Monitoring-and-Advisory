import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, Wallet, Zap, BrainCircuit } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, PanResponder, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Wallet,
    color: '#005c55',
    title: 'Your money, on autopilot',
    subtitle: 'AI agents watch your spending 24/7 so you don\'t have to.',
  },
  {
    icon: Zap,
    color: '#7948e3',
    title: 'Everything categorized automatically',
    subtitle: 'No manual entry. No spreadsheets. Ever.',
  },
  {
    icon: BrainCircuit,
    color: '#C9A44C',
    title: 'Advice before you ask',
    subtitle: 'Get proactive alerts and answers about your finances.',
  },
];

export function CarouselScreen() {
  const completeCarousel = useAuthStore((s) => s.completeCarousel);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleDevReset = () => {
    Alert.alert(
      'Reset app state',
      'This will clear all data and restart the onboarding flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('finance-advisor-auth');
            useAuthStore.setState({
              hasSeenSplash: false,
              hasSeenCarousel: false,
              isAuthenticated: false,
              hasCompletedOnboarding: false,
              hasCompletedSyncing: false,
              hasCompletedSmsTracking: false,
              email: null,
              name: null,
            });
          },
        },
      ]
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderRelease: (_, gesture) => {
        const idx = currentIndexRef.current;
        if (gesture.dx < -50 && idx < SLIDES.length - 1) {
          goToSlide(idx + 1);
        } else if (gesture.dx > 50 && idx > 0) {
          goToSlide(idx - 1);
        }
      },
    })
  ).current;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    currentIndexRef.current = index;
    Animated.spring(scrollX, {
      toValue: -index * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 50,
      friction: 9,
    }).start();
  };

  const handleNext = () => {
    if (!isLastSlide) {
      goToSlide(currentIndex + 1);
    } else {
      completeCarousel();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <View className="flex-row justify-between items-center px-6 pt-4">
          <Pressable onLongPress={handleDevReset}>
            <Text className="text-primary font-heading-bold text-lg opacity-50">FinSense</Text>
          </Pressable>
          <Pressable
            onPress={completeCarousel}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text className="text-on-surface-variant font-body-medium text-sm">Skip</Text>
          </Pressable>
        </View>

        <View className="flex-1 overflow-hidden" {...panResponder.panHandlers}>
          <Animated.View
            className="flex-row h-full"
            style={{ transform: [{ translateX: scrollX }], width: SCREEN_WIDTH * SLIDES.length }}
          >
            {SLIDES.map((slide, index) => {
              const IconComponent = slide.icon;
              return (
                <View key={index} className="items-center justify-center px-6" style={{ width: SCREEN_WIDTH }}>
                  <View className="w-48 h-48 mb-6 items-center justify-center relative">
                    <View className="w-40 h-40 rounded-3xl" style={{ backgroundColor: `${slide.color}15` }} />
                    <View className="absolute inset-0 items-center justify-center">
                      <IconComponent size={80} color={slide.color} strokeWidth={1.5} />
                    </View>
                    {index === 0 ? (
                      <View className="absolute -top-4 -right-4 bg-secondary-container/30 p-3 rounded-2xl border border-outline-variant/20">
                        <Sparkles size={28} color="#005c55" />
                      </View>
                    ) : null}
                    {index === 1 ? (
                      <View className="absolute bottom-4 flex-row gap-2">
                        <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                          <Text className="text-primary font-body-medium text-[10px]">Groceries</Text>
                        </View>
                        <View className="bg-positive/10 px-3 py-1 rounded-full border border-positive/20">
                          <Text className="text-positive font-body-medium text-[10px]">Travel</Text>
                        </View>
                        <View className="bg-tertiary/10 px-3 py-1 rounded-full border-tertiary/20">
                          <Text className="text-tertiary font-body-medium text-[10px]">Rent</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>

                  <View className="gap-3">
                    <Text className="text-on-surface font-heading-bold text-xl text-center leading-tight">
                      {slide.title}
                    </Text>
                    <Text className="text-on-surface-variant font-body text-sm text-center max-w-[280px] mx-auto">
                      {slide.subtitle}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </View>

        <View className="px-6 pb-8 gap-6">
          <View className="flex-row justify-center gap-2">
            {SLIDES.map((_, index) => (
              <View
                key={index}
                className={`rounded-full ${
                  index === currentIndex ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-muted'
                }`}
              />
            ))}
          </View>

          <Pressable
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel={isLastSlide ? 'Get started' : 'Continue'}
            className="w-full bg-primary py-4 rounded-2xl items-center active:opacity-90"
          >
            <Text className="text-on-primary font-body-semibold text-base">
              {isLastSlide ? 'Get Started' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
