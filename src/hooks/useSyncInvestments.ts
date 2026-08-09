import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncAssets } from '../services';

export function useSyncInvestments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncAssets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
