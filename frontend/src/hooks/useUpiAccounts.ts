import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UpiAccount, UpiProvider } from '../types';
import {
  getUpiAccounts,
  linkUpiAccount,
  unlinkUpiAccount,
  setPrimaryUpiAccount,
  syncUpiTransactions,
  verifyUpiId,
  getUpiProviders,
} from '../services';

const KEY = ['upi-accounts'];

export function useUpiAccounts() {
  return useQuery({ queryKey: KEY, queryFn: getUpiAccounts });
}

export function useUpiProviders() {
  return useQuery({ queryKey: ['upi-providers'], queryFn: getUpiProviders });
}

export function useVerifyUpiId() {
  return useMutation({ mutationFn: (upiId: string) => verifyUpiId(upiId) });
}

export function useLinkUpiAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ upiId, provider }: { upiId: string; provider: UpiProvider }) => linkUpiAccount(upiId, provider),
    onMutate: async ({ upiId, provider }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<UpiAccount[]>(KEY);
      const temp: UpiAccount = {
        id: `temp_${Date.now()}`,
        upiId,
        provider,
        accountHolder: '',
        bankName: '',
        isPrimary: (previous ?? []).length === 0,
        linkedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<UpiAccount[]>(KEY, (old) => [...(old ?? []), temp]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUnlinkUpiAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unlinkUpiAccount(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<UpiAccount[]>(KEY);
      queryClient.setQueryData<UpiAccount[]>(KEY, (old) => (old ?? []).filter((a) => a.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetPrimaryUpiAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setPrimaryUpiAccount(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<UpiAccount[]>(KEY);
      queryClient.setQueryData<UpiAccount[]>(KEY, (old) =>
        (old ?? []).map((a) => ({ ...a, isPrimary: a.id === id }))
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSyncUpiTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncUpiTransactions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upi-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
