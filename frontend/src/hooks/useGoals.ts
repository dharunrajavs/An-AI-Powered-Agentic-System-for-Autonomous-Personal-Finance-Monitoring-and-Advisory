import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Goal } from '../types';
import { deleteGoal, getGoals, upsertGoal } from '../services';

const KEY = ['goals'];

export function useGoals() {
  return useQuery({ queryKey: KEY, queryFn: getGoals });
}

export function useUpsertGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Goal) => upsertGoal(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old) => {
        const arr = old ?? [];
        const idx = arr.findIndex((g) => g.id === input.id);
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

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<Goal[]>(KEY);
      queryClient.setQueryData<Goal[]>(KEY, (old) => (old ?? []).filter((g) => g.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
