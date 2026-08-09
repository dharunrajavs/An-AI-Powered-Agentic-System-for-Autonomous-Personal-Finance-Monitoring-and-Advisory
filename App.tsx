import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import { Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { AppShell } from './src/components/layout';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';
import { getTheme } from './src/lib/theme';
import { queryClient, persistCache } from './src/lib/queryClient';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/themeStore';
import { useUiStore } from './src/store/uiStore';

export default function App() {
  const themeMode = useThemeStore((s) => s.mode);
  const navigationTheme = getTheme(themeMode);
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  useEffect(() => {
    const setReducedMotion = useUiStore.getState().setReducedMotion;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReducedMotion)
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    persistCache();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#18181B' }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <ErrorBoundary>
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </ErrorBoundary>
      </AppShell>
    </QueryClientProvider>
  );
}
