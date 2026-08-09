import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ConnectedAccount } from '../types';
import { getConnectedAccounts, linkAccount, unlinkAccount } from '../services';

const KEY = ['connected-accounts'];

export function useConnectedAccounts() {
  return useQuery({ queryKey: KEY, queryFn: getConnectedAccounts });
}

export function useLinkAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: linkAccount,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<ConnectedAccount[]>(KEY);
      const temp: ConnectedAccount = {
        ...input,
        id: `temp_${Date.now()}`,
        syncStatus: 'syncing',
      };
      queryClient.setQueryData<ConnectedAccount[]>(KEY, (old) => [...(old ?? []), temp]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUnlinkAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unlinkAccount(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<ConnectedAccount[]>(KEY);
      queryClient.setQueryData<ConnectedAccount[]>(KEY, (old) => (old ?? []).filter((a) => a.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
