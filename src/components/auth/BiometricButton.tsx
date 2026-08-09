import React, { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';

interface BiometricButtonProps {
  /** Called after a successful biometric authentication. */
  onSuccess: () => void;
  label?: string;
}

/**
 * Face ID / Touch ID entry point. Renders nothing until we've confirmed the
 * device actually has biometric hardware with at least one enrolled credential.
 */
export function BiometricButton({ onSuccess, label = 'Sign in with biometrics' }: BiometricButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (isMounted) {
          setIsAvailable(hasHardware && isEnrolled);
        }
      } catch {
        if (isMounted) {
          setIsAvailable(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAvailable) {
    return null;
  }

  const handlePress = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to Finance Advisor',
      });
      if (result.success) {
        onSuccess();
      }
    } catch {
      // No-op: gracefully ignore environments where the native module misbehaves.
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="mt-5 flex-row items-center justify-center self-center rounded-full border border-border bg-surface px-5 py-3 active:opacity-80"
    >
      <Fingerprint color="#C9A44C" size={20} />
      <Text className="ml-2 font-body-medium text-sm text-white">{label}</Text>
    </Pressable>
  );
}
