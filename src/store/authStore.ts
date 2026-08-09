import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  signInWithGoogle as apiSignInWithGoogle,
  signInWithFacebook as apiSignInWithFacebook,
  signInWithApple as apiSignInWithApple,
} from '../services';

interface AuthState {
  hasSeenSplash: boolean;
  hasSeenCarousel: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedSyncing: boolean;
  hasCompletedSmsTracking: boolean;
  email: string | null;
  name: string | null;
  login: (email: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signUpWithPhone: (email: string, name: string) => void;
  logout: () => void;
  completeSplash: () => void;
  completeCarousel: () => void;
  completeOnboarding: () => void;
  completeSyncing: () => void;
  completeSmsTracking: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasSeenSplash: false,
      hasSeenCarousel: false,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      hasCompletedSyncing: false,
      hasCompletedSmsTracking: false,
      email: null,
      name: null,

      login: (email) =>
        set({
          isAuthenticated: true,
          email,
          name: null,
          hasSeenCarousel: true,
          hasCompletedSmsTracking: false,
          hasCompletedOnboarding: false,
          hasCompletedSyncing: false,
        }),

      signUpWithPhone: (email, name) => {
        set({
          isAuthenticated: true,
          email,
          name,
          hasSeenCarousel: true,
          hasCompletedSmsTracking: false,
          hasCompletedOnboarding: false,
          hasCompletedSyncing: false,
        });
      },

      signIn: async (email, password) => {
        await apiSignIn(email, password);
        set({ isAuthenticated: true, email });
      },

      signUp: async (email, password, name) => {
        await apiSignUp(email, password, name);
        set({
          isAuthenticated: true,
          email,
          name,
          hasSeenCarousel: true,
          hasCompletedSmsTracking: false,
          hasCompletedOnboarding: false,
          hasCompletedSyncing: false,
        });
      },

      logout: async () => {
        try {
          await apiSignOut();
        } catch {
          // proceed even if API call fails
        }
        set({
          isAuthenticated: false,
          email: null,
          name: null,
          hasCompletedSmsTracking: false,
          hasCompletedOnboarding: false,
          hasCompletedSyncing: false,
        });
      },

      completeSplash: () => set({ hasSeenSplash: true }),
      completeCarousel: () => set({ hasSeenCarousel: true }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      completeSyncing: () => set({ hasCompletedSyncing: true }),
      completeSmsTracking: () => set({ hasCompletedSmsTracking: true }),

      signInWithGoogle: async () => {
        const result = await apiSignInWithGoogle();
        if ('user' in result) {
          set({ isAuthenticated: true, email: result.user.email });
        }
      },

      signInWithFacebook: async () => {
        const result = await apiSignInWithFacebook();
        if ('user' in result) {
          set({ isAuthenticated: true, email: result.user.email });
        }
      },

      signInWithApple: async () => {
        const result = await apiSignInWithApple();
        if ('user' in result) {
          set({ isAuthenticated: true, email: result.user.email });
        }
      },
    }),
    {
      name: 'finance-advisor-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
