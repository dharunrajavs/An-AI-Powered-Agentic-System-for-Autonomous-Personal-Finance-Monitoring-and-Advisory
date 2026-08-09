import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Budget } from '../types';
import { deleteBudget, getBudgets, upsertBudget } from '../services';

const KEY = ['budgets'];

export function useBudgets() {
  return useQuery({ queryKey: KEY, queryFn: getBudgets });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Budget) => upsertBudget(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<Budget[]>(KEY);
      queryClient.setQueryData<Budget[]>(KEY, (old) => {
        const arr = old ?? [];
        const idx = arr.findIndex((b) => b.id === input.id);
        if (idx >= 0) {
          const copy = [...arr];
          copy[idx] = input;
          return copy;
        }
        return [...arr, input];
      });
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<Budget[]>(KEY);
      queryClient.setQueryData<Budget[]>(KEY, (old) => (old ?? []).filter((b) => b.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
