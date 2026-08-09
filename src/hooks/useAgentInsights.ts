import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dismissInsight, getAgentInsights } from '../services';
import { AGENT_INSIGHTS_POLL_MS } from '../services/config';

const KEY = ['agent-insights'];

export function useAgentInsights() {
  return useQuery({
    queryKey: KEY,
    queryFn: getAgentInsights,
    refetchInterval: AGENT_INSIGHTS_POLL_MS,
  });
}

export function useDismissInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissInsight,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData(KEY);
      queryClient.setQueryData(KEY, (old: any) => (old ?? []).filter((i: any) => i.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
