import { create } from 'zustand';
import { MonthlySummary, ParsedSmsTransaction, SmsPermissionStatus } from '../types';

interface SmsTrackingState {
  permissionStatus: SmsPermissionStatus | null;
  transactions: ParsedSmsTransaction[];
  summary: MonthlySummary | null;
  scanComplete: boolean;
  monitoring: boolean;
  monitoringSupported: boolean;
  detectedCount: number;
  lastDetectedAt: string | null;
  lastError: string | null;
  setPermissionStatus: (status: SmsPermissionStatus) => void;
  setScanResults: (transactions: ParsedSmsTransaction[], summary: MonthlySummary) => void;
  setScanComplete: (complete: boolean) => void;
  setMonitoring: (monitoring: boolean) => void;
  setMonitoringSupported: (supported: boolean) => void;
  onDetected: (transaction: ParsedSmsTransaction) => void;
  onMonitorError: (message: string) => void;
  reset: () => void;
}

const initialState = {
  permissionStatus: null,
  transactions: [],
  summary: null,
  scanComplete: false,
  monitoring: false,
  monitoringSupported: true,
  detectedCount: 0,
  lastDetectedAt: null,
  lastError: null,
};

export const useSmsTrackingStore = create<SmsTrackingState>()((set) => ({
  ...initialState,
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setScanResults: (transactions, summary) => set({ transactions, summary }),
  setScanComplete: (complete) => set({ scanComplete: complete }),
  setMonitoring: (monitoring) => set({ monitoring, lastError: monitoring ? null : undefined as never }),
  setMonitoringSupported: (supported) => set({ monitoringSupported: supported }),
  onDetected: (transaction) =>
    set((s) => ({
      detectedCount: s.detectedCount + 1,
      lastDetectedAt: new Date().toISOString(),
      transactions: [transaction, ...s.transactions],
    })),
  onMonitorError: (message) => set({ lastError: message }),
  reset: () => set(initialState),
}));