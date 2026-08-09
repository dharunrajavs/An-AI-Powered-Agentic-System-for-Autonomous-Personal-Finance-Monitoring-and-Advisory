import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgentPreferences, UserProfile } from '../types';
import { getAgentPreferences, getProfile, updateAgentPreferences, updateProfile } from '../services';

const PROFILE_KEY = ['profile'];
const PREFERENCES_KEY = ['agent-preferences'];

export function useProfile() {
  return useQuery({ queryKey: PROFILE_KEY, queryFn: getProfile });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserProfile>) => updateProfile(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_KEY });
      const previous = queryClient.getQueryData<UserProfile>(PROFILE_KEY);
      queryClient.setQueryData<UserProfile>(PROFILE_KEY, (old) => (old ? { ...old, ...patch } : old));
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(PROFILE_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useAgentPreferences() {
  return useQuery({ queryKey: PREFERENCES_KEY, queryFn: getAgentPreferences });
}

export function useUpdateAgentPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<AgentPreferences>) => updateAgentPreferences(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: PREFERENCES_KEY });
      const previous = queryClient.getQueryData<AgentPreferences>(PREFERENCES_KEY);
      queryClient.setQueryData<AgentPreferences>(PREFERENCES_KEY, (old) => (old ? { ...old, ...patch } : old));
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(PREFERENCES_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY }),
  });
}
