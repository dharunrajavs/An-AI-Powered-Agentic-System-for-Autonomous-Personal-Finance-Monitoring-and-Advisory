import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '../types';
import { getChatMessages, sendChatMessage } from '../services';

const KEY = ['chat-messages'];

export function useChatMessages() {
  return useQuery({ queryKey: KEY, queryFn: getChatMessages });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendChatMessage(text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<ChatMessage[]>(KEY);
      const optimistic: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        text,
        createdAt: new Date().toISOString(),
      };
      const placeholder: ChatMessage = {
        id: `agent_${Date.now()}`,
        role: 'agent',
        text: '',
        createdAt: new Date().toISOString(),
        streaming: true,
      };
      queryClient.setQueryData<ChatMessage[]>(KEY, (old) => [...(old ?? []), optimistic, placeholder]);
      return { previous };
    },
    onSuccess: (messages) => queryClient.setQueryData(KEY, messages),
    onError: (_err, _text, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
    },
  });
}
