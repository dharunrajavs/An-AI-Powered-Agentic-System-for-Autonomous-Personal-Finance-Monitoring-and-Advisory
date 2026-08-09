import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgentAction } from '../types';
import { getAgentActions, updateAgentActionStatus } from '../services';

const KEY = ['agent-actions'];

export function useAgentActions() {
  return useQuery({ queryKey: KEY, queryFn: getAgentActions });
}

export function useUpdateAgentActionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AgentAction['status'] }) => updateAgentActionStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<AgentAction[]>(KEY);
      queryClient.setQueryData<AgentAction[]>(KEY, (old) =>
        (old ?? []).map((a) => (a.id === id ? { ...a, status } : a)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
