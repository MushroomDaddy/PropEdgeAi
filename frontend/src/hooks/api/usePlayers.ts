import { useQuery } from '@tanstack/react-query';
import { api, buildQS } from '../../lib/api';

export function usePlayerSearch(q: string) {
  return useQuery({
    queryKey: ['players', 'search', q],
    queryFn: () => api.get<any[]>(`/api/players/search${buildQS({ q })}`),
    enabled: q.trim().length > 1,
    staleTime: 60_000,
  });
}

export function usePlayerProfile(id?: string) {
  return useQuery({
    queryKey: ['players', id],
    queryFn: () => api.get<any>(`/api/players/${id}/profile`),
    enabled: !!id,
    staleTime: 120_000,
  });
}

export function useLineMovement(propId?: string) {
  return useQuery({
    queryKey: ['line-movement', propId],
    queryFn: () => api.get<any[]>(`/api/props/${propId}/line-movement`),
    enabled: !!propId,
    staleTime: 60_000,
  });
}
