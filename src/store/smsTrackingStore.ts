import { create } from 'zustand';
import { MonthlySummary, ParsedSmsTransaction, SmsPermissionStatus } from '../types';

interface SmsTrackingState {
  permissionStatus: SmsPermissionStatus | null;
  transactions: ParsedSmsTransaction[];
  summary: MonthlySummary | null;
  scanComplete: boolean;
  setPermissionStatus: (status: SmsPermissionStatus) => void;
  setScanResults: (transactions: ParsedSmsTransaction[], summary: MonthlySummary) => void;
  setScanComplete: (complete: boolean) => void;
  reset: () => void;
}

const initialState = {
  permissionStatus: null,
  transactions: [],
  summary: null,
  scanComplete: false,
};

export const useSmsTrackingStore = create<SmsTrackingState>()((set) => ({
  ...initialState,
  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setScanResults: (transactions, summary) => set({ transactions, summary }),
  setScanComplete: (complete) => set({ scanComplete: complete }),
  reset: () => set(initialState),
}));