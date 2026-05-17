import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useChatMessages() {
  return useQuery({
    queryKey: ['chat', 'messages'],
    queryFn: () => api.get<any[]>('/api/chat/messages'),
    staleTime: 0,
  });
}

export function useAskAnalyst() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) =>
      api.post<{ response: string }>('/api/chat/ask', { message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
}
