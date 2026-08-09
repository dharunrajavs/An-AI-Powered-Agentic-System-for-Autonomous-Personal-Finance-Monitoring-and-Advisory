import { create } from 'zustand';

export interface ToastState {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface UiState {
  toast: ToastState | null;
  reducedMotion: boolean;
  showToast: (message: string, variant?: ToastState['variant']) => void;
  hideToast: () => void;
  setReducedMotion: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  reducedMotion: false,
  showToast: (message, variant = 'info') => set({ toast: { id: `toast_${Date.now()}`, message, variant } }),
  hideToast: () => set({ toast: null }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
}));
