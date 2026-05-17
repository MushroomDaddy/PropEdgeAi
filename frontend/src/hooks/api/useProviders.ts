import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useProviderStatus() {
  return useQuery({
    queryKey: ['providers', 'status'],
    queryFn: () => api.get<any[]>('/api/providers/status'),
    staleTime: 60_000,
  });
}

export function useAdminSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (endpoint: string) => api.post<any>(`/api/admin/sync/${endpoint}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}
