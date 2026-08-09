import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '../types';
import { addTransaction, deleteTransaction, getTransactions, updateTransaction } from '../services';

const KEY = ['transactions'];

export function useTransactions() {
  return useQuery({ queryKey: KEY, queryFn: getTransactions });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Transaction, 'id'>) => addTransaction(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<Transaction[]>(KEY);
      const temp: Transaction = { ...input, id: `temp_${Date.now()}` };
      queryClient.setQueryData<Transaction[]>(KEY, (old) => [...(old ?? []), temp]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Transaction> }) => updateTransaction(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<Transaction[]>(KEY);
      queryClient.setQueryData<Transaction[]>(KEY, (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<Transaction[]>(KEY);
      queryClient.setQueryData<Transaction[]>(KEY, (old) => (old ?? []).filter((t) => t.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
