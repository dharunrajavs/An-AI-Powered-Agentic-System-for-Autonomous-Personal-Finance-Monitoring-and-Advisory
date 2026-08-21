import { create } from 'zustand';

export interface SpendingAlert {
  id: string;
  category: string;
  spent: number;
  limit: number;
  percentage: number;
  threshold: 50 | 75 | 90 | 100;
  dismissed: boolean;
  createdAt: string;
}

interface SpendingAlertState {
  alerts: SpendingAlert[];
  setAlerts: (alerts: SpendingAlert[]) => void;
  dismissAlert: (id: string) => void;
  clearDismissed: () => void;
}

export const useSpendingAlertStore = create<SpendingAlertState>()((set) => ({
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    })),
  clearDismissed: () => set((state) => ({ alerts: state.alerts.filter((a) => !a.dismissed) })),
}));
