import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { SubscriptionsScreen } from '../screens/subscriptions/SubscriptionsScreen';
import { CarouselScreen } from '../screens/onboarding/CarouselScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SyncingScreen } from '../screens/onboarding/SyncingScreen';
import { AnimatedSplashScreen } from '../screens/splash/AnimatedSplashScreen';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from './types';
import { SmsTrackingNavigator } from './SmsTrackingNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasSeenSplash = useAuthStore((s) => s.hasSeenSplash);
  const hasSeenCarousel = useAuthStore((s) => s.hasSeenCarousel);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const hasCompletedSyncing = useAuthStore((s) => s.hasCompletedSyncing);
  const hasCompletedSmsTracking = useAuthStore((s) => s.hasCompletedSmsTracking);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasSeenSplash ? (
        <Stack.Screen name="Splash" component={AnimatedSplashScreen} />
      ) : !hasSeenCarousel ? (
        <Stack.Screen name="Carousel" component={CarouselScreen} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !hasCompletedSmsTracking ? (
        <Stack.Screen name="SmsTracking" component={SmsTrackingNavigator} />
      ) : !hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !hasCompletedSyncing ? (
        <Stack.Screen name="Syncing" component={SyncingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="Insights"
            component={InsightsScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="Subscriptions"
            component={SubscriptionsScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="SmsTracking"
            component={SmsTrackingNavigator}
            options={{ presentation: 'fullScreenModal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
