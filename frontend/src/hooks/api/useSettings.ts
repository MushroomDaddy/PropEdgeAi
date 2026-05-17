import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<any>('/api/settings'),
    staleTime: 300_000,
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.put<any>('/api/settings', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
