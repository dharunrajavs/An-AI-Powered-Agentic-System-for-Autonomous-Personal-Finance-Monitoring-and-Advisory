import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, CheckCircle2, ChevronRight, MessageCircle, Shield } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';
import { RootStackParamList } from '../../navigation/types';
import { requestSmsPermission } from '../../services';
import { useSmsMonitor } from '../../hooks';
import { useSmsTrackingStore } from '../../store/smsTrackingStore';

export function SmsTrackingSettings() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { start, stop } = useSmsMonitor();

  const monitoring = useSmsTrackingStore((s) => s.monitoring);
  const monitoringSupported = useSmsTrackingStore((s) => s.monitoringSupported);
  const detectedCount = useSmsTrackingStore((s) => s.detectedCount);
  const lastError = useSmsTrackingStore((s) => s.lastError);
  const setPermissionStatus = useSmsTrackingStore((s) => s.setPermissionStatus);

  const [checkingPermission, setCheckingPermission] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    requestSmsPermission().then((status) => {
      if (!mounted) return;
      setPermissionGranted(status.granted);
      setCheckingPermission(false);
      setPermissionStatus(status);
    });
    return () => {
      mounted = false;
    };
  }, [setPermissionStatus]);

  const handleToggle = async (enabled: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      if (enabled) {
        const ok = await start();
        if (ok) setPermissionGranted(true);
      } else {
        await stop();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRequestPermission = async () => {
    setBusy(true);
    try {
      const status = await requestSmsPermission();
      setPermissionGranted(status.granted);
      setPermissionStatus(status);
      if (status.granted) {
        await start();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-3">
      <Text className="text-on-surface-variant font-body text-sm leading-5">
        Automatically detect bank transaction SMS to track expenses, categorize spending, and get AI-powered insights.
      </Text>

      <View className="flex-row items-center justify-between bg-primary/5 rounded-xl px-4 py-3.5 border border-primary/20">
        <View className="flex-row items-center gap-2 flex-1">
          <MessageCircle color="#005c55" size={18} />
          <View className="flex-1">
            <Text className="text-on-surface font-body-semibold text-sm">Automatic monitoring</Text>
            <Text className="text-on-surface-variant font-body text-xs">
              {busy
                ? 'Updating…'
                : monitoring
                ? 'Active — new bank SMS will be recorded'
                : permissionGranted
                ? 'Inactive — enable to start listening'
                : 'Requires SMS permission'}
            </Text>
            {lastError ? (
              <Text className="text-alert font-body text-[11px] mt-0.5">{lastError}</Text>
            ) : null}
          </View>
        </View>
        {busy ? (
          <ActivityIndicator size="small" color="#005c55" />
        ) : (
          <Switch
            value={monitoring}
            onValueChange={handleToggle}
            disabled={!monitoringSupported}
            trackColor={{ false: '#dae2fd', true: '#0f766e' }}
            thumbColor={monitoring ? '#a3faef' : '#ffffff'}
          />
        )}
      </View>

      {!monitoringSupported ? (
        <View className="flex-row items-center gap-2 bg-surface-container-low rounded-xl p-3 border border-outline-variant/30">
          <AlertCircle color="#D9564B" size={16} />
          <Text className="text-on-surface-variant font-body text-xs flex-1">
            SMS monitoring is unavailable on this device. Use a development build (expo run:android) on Android.
          </Text>
        </View>
      ) : checkingPermission ? (
        <View className="flex-row items-center gap-2 bg-surface-container-low rounded-xl p-3 border border-outline-variant/30">
          <ActivityIndicator size="small" color="#005c55" />
          <Text className="text-on-surface-variant font-body text-xs">Checking permission…</Text>
        </View>
      ) : !permissionGranted ? (
        <View className="gap-2">
          <View className="flex-row items-center gap-2 bg-alert/10 rounded-xl p-3 border border-alert/20">
            <AlertCircle color="#D9564B" size={16} />
            <Text className="text-on-surface-variant font-body text-xs flex-1">
              SMS permission was denied or revoked. Grant access to detect transactions.
            </Text>
          </View>
          <Pressable
            onPress={handleRequestPermission}
            disabled={busy}
            className="items-center rounded-xl bg-primary py-3 active:opacity-80"
          >
            <Text className="text-on-primary font-body-semibold text-sm">
              {busy ? 'Requesting…' : 'Request SMS Permission'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row items-center gap-2 bg-success/10 rounded-xl p-3 border border-success/20">
          <CheckCircle2 color="#3FA96A" size={16} />
          <Text className="text-on-surface-variant font-body text-xs flex-1">
            Permission granted{detectedCount > 0 ? ` · ${detectedCount} transaction${detectedCount === 1 ? '' : 's'} detected` : ''}.
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => navigation.navigate('SmsTracking', { screen: 'AutomaticExpense' })}
        className="flex-row items-center justify-between bg-primary/5 rounded-xl px-4 py-3.5 border border-primary/20 active:opacity-80"
      >
        <View className="flex-row items-center gap-2">
          <MessageCircle color="#005c55" size={18} />
          <Text className="text-primary font-body-semibold text-sm">Configure SMS Tracking</Text>
        </View>
        <ChevronRight color="#005c55" size={18} />
      </Pressable>

      <View className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/30">
        <View className="flex-row items-center gap-1.5 mb-2">
          <Shield color="#005c55" size={14} />
          <Text className="text-on-surface-variant font-body-medium text-xs uppercase tracking-wider">Privacy</Text>
        </View>
        <Text className="text-on-surface-variant font-body text-xs leading-4">
          Reads only bank transaction SMS. Personal messages, OTPs, PINs and passwords are never stored or sent anywhere.
          Disable anytime.
        </Text>
      </View>
    </View>
  );
}