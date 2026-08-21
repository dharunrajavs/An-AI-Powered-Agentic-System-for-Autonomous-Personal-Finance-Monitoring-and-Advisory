import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dismissInsight, getAgentInsights } from '../services';
import { AGENT_INSIGHTS_POLL_MS } from '../services/config';
import { AgentInsight } from '../types';

const KEY = ['agent-insights'];

const SEVERITY_RANK: Record<AgentInsight['severity'], number> = { high: 0, medium: 1, low: 2 };

export function useAgentInsights() {
  return useQuery({
    queryKey: KEY,
    queryFn: getAgentInsights,
    refetchInterval: AGENT_INSIGHTS_POLL_MS,
    select: (data: AgentInsight[]) =>
      [...data].sort(
        (a, b) =>
          SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
          Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
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
