import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSmsTrackingStore } from '../store/smsTrackingStore';
import {
  ensureSmsMonitoring,
  isSmsMonitorSupported,
  isSmsMonitoringActive,
  processIncomingSms,
  processSyncQueue,
  startSmsMonitoring,
  stopSmsMonitoring,
  subscribeToIncomingSms,
} from '../services/sms/monitor';

const MONITOR_KEY = 'finance-advisor-sms-monitor';

let NetInfo: { addEventListener?: (listener: (state: { isConnected?: boolean; isInternetReachable?: boolean }) => void) => () => void } | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const netinfo = require('@react-native-community/netinfo');
  NetInfo = netinfo.default ?? netinfo;
} catch {
  // NetInfo not available, network auto-sync disabled
}

export function useSmsMonitor() {
  const queryClient = useQueryClient();
  const setMonitoring = useSmsTrackingStore((s) => s.setMonitoring);
  const setMonitoringSupported = useSmsTrackingStore((s) => s.setMonitoringSupported);
  const onDetected = useSmsTrackingStore((s) => s.onDetected);
  const onMonitorError = useSmsTrackingStore((s) => s.onMonitorError);
  const startRef = useRef<() => void>(() => undefined);

  const handleSms = useCallback(async (sms: { body: string; sender: string }) => {
    const result = await processIncomingSms(sms.body, sms.sender);
    if (result.saved) {
      onDetected(result.transaction);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
    } else if (result.reason === 'error') {
      onMonitorError(result.message ?? 'Failed to process SMS');
    }
  }, [queryClient, onDetected, onMonitorError]);

  const processQueue = useCallback(async () => {
    const { processSyncQueue } = await import('../services/sms/monitor');
    const result = await processSyncQueue();
    if (result.processed > 0) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
    }
  }, [queryClient]);

  const start = useCallback(async (): Promise<boolean> => {
    const supported = isSmsMonitorSupported();
    setMonitoringSupported(supported);
    if (!supported) return false;

    const ok = await ensureSmsMonitoring(handleSms);
    setMonitoring(ok);
    if (ok) {
      await AsyncStorage.setItem(MONITOR_KEY, 'enabled');
      // Process any queued transactions when monitoring starts
      processQueue();
    }
    return ok;
  }, [handleSms, setMonitoring, setMonitoringSupported, processQueue]);

  const stop = useCallback(async () => {
    await stopSmsMonitoring();
    setMonitoring(false);
    await AsyncStorage.setItem(MONITOR_KEY, 'disabled');
  }, [setMonitoring]);

  const startIfPreviouslyEnabled = useCallback(async () => {
    const supported = isSmsMonitorSupported();
    setMonitoringSupported(supported);
    if (!supported) return;

    const stored = await AsyncStorage.getItem(MONITOR_KEY);
    if (stored !== 'enabled') return;

    subscribeToIncomingSms(handleSms);
    const active = await isSmsMonitoringActive();
    if (active) {
      setMonitoring(true);
      processQueue();
      return;
    }
    const ok = await startSmsMonitoring();
    setMonitoring(ok);
    if (ok) processQueue();
  }, [handleSms, setMonitoring, setMonitoringSupported]);

  // Process queue when network comes back online
  useEffect(() => {
    if (!NetInfo?.addEventListener) return;
    const unsubscribe = NetInfo.addEventListener((state: { isConnected?: boolean; isInternetReachable?: boolean }) => {
      if (state.isConnected && state.isInternetReachable) {
        processQueue();
      }
    });
    return () => unsubscribe();
  }, [processQueue]);

  useEffect(() => {
    startIfPreviouslyEnabled();
    const unsubscribe = subscribeToIncomingSms(handleSms);
    return () => {
      unsubscribe();
    };
  }, [startIfPreviouslyEnabled, handleSms]);

  startRef.current = start;

  return { start, stop, processQueue };
}

export async function disableSmsMonitoringPermanently(): Promise<void> {
  await stopSmsMonitoring();
  await AsyncStorage.setItem(MONITOR_KEY, 'disabled');
}

export { startSmsMonitoring, stopSmsMonitoring, isSmsMonitoringActive };