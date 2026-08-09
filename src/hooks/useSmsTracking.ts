import { useMutation } from '@tanstack/react-query';
import { requestSmsPermission, scanSmsTransactions } from '../services';
import { useSmsTrackingStore } from '../store/smsTrackingStore';

export function useRequestSmsPermission() {
  return useMutation({
    mutationFn: () => requestSmsPermission(),
  });
}

export function useScanSmsTransactions() {
  const setScanResults = useSmsTrackingStore((s) => s.setScanResults);
  const setScanComplete = useSmsTrackingStore((s) => s.setScanComplete);
  return useMutation({
    mutationFn: () => scanSmsTransactions(),
    onSuccess: (data) => {
      setScanResults(data.transactions, data.summary);
      setScanComplete(true);
    },
  });
}