import React, { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const SESSION_TIMEOUT_OPTIONS = ['15 min', '1 hour', 'Never'] as const;
type SessionTimeout = (typeof SESSION_TIMEOUT_OPTIONS)[number];

/**
 * Biometric-login and two-factor toggles are demo-only: there's no backend field
 * to persist them against, so they live in local component state. Session timeout
 * is likewise a local, presentational preference.
 */
export function SecuritySettings() {
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<SessionTimeout>('1 hour');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (isMounted) {
          setBiometricSupported(hasHardware && isEnrolled);
        }
      } catch {
        if (isMounted) {
          setBiometricSupported(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="font-body-medium text-sm text-white">Biometric login</Text>
          <Text className="mt-0.5 font-body text-xs text-muted">
            {biometricSupported
              ? 'Use Face ID or your fingerprint to unlock the app.'
              : 'Not available — set up biometrics in your device settings first.'}
          </Text>
        </View>
        <Switch
          value={biometricEnabled && biometricSupported}
          onValueChange={setBiometricEnabled}
          disabled={!biometricSupported}
          trackColor={{ false: '#232B3D', true: '#C9A44C' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#232B3D"
          accessibilityLabel="Biometric login"
        />
      </View>

      <View className="flex-row items-center justify-between border-t border-border pt-4">
        <View className="flex-1 pr-3">
          <Text className="font-body-medium text-sm text-white">Two-factor authentication</Text>
          <Text className="mt-0.5 font-body text-xs text-muted">Demo toggle only — no verification code is actually sent.</Text>
        </View>
        <Switch
          value={twoFactorEnabled}
          onValueChange={setTwoFactorEnabled}
          trackColor={{ false: '#232B3D', true: '#C9A44C' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#232B3D"
          accessibilityLabel="Two-factor authentication"
        />
      </View>

      <View className="border-t border-border pt-4">
        <Text className="font-body-medium text-sm text-white">Session timeout</Text>
        <View className="mt-3 flex-row gap-2">
          {SESSION_TIMEOUT_OPTIONS.map((option) => {
            const isActive = option === sessionTimeout;
            return (
              <Pressable
                key={option}
                onPress={() => setSessionTimeout(option)}
                accessibilityRole="button"
                accessibilityLabel={`Session timeout ${option}`}
                accessibilityState={{ selected: isActive }}
                className={`flex-1 items-center rounded-xl border py-2.5 active:opacity-80 ${
                  isActive ? 'border-gold bg-gold/20' : 'border-border bg-background'
                }`}
              >
                <Text className={`font-body-medium text-xs ${isActive ? 'text-gold' : 'text-muted'}`}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
