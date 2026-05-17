import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, buildQS } from '../../lib/api';

export function usePicks(status?: string) {
  return useQuery({
    queryKey: ['picks', status],
    queryFn: () => api.get<any[]>(`/api/picks${buildQS({ status })}`),
    staleTime: 30_000,
  });
}

export function usePickStats() {
  return useQuery({
    queryKey: ['picks', 'stats'],
    queryFn: () => api.get<any>('/api/picks/stats'),
    staleTime: 60_000,
  });
}

export function useAddPick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post<any>('/api/picks', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['picks'] });
    },
  });
}

export function useRemovePick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pickId: string) => api.delete<any>(`/api/picks/${pickId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['picks'] });
    },
  });
}

export function useEntries() {
  return useQuery({
    queryKey: ['entries'],
    queryFn: () => api.get<any[]>('/api/entries'),
    staleTime: 30_000,
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post<any>('/api/entries', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}

export function usePickCorrelations() {
  return useQuery({
    queryKey: ['picks', 'correlations'],
    queryFn: () => api.get<any[]>('/api/picks/correlations'),
    staleTime: 60_000,
  });
}
