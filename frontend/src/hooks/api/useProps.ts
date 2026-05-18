import { useQuery, useMutation } from '@tanstack/react-query';
import { api, buildQS } from '../../lib/api';

export function useProps(sport?: string, platform?: string) {
  return useQuery({
    queryKey: ['props', sport, platform],
    queryFn: () => api.get<any[]>(`/api/props${buildQS({ sport, platform })}`),
    staleTime: 60_000,
  });
}

export function useTopEdges(limit = 20) {
  return useQuery({
    queryKey: ['props', 'top-edges', limit],
    queryFn: () => api.get<any[]>(`/api/props/top-edges?limit=${limit}`),
    staleTime: 60_000,
  });
}

export function useTopValue(limit = 20) {
  return useQuery({
    queryKey: ['props', 'top-value', limit],
    queryFn: async () => {
      const data = await api.get<any>(`/api/props/top-value?limit=${limit}&t=${Date.now()}`);
      console.log('DASHBOARD DATA FETCHED:', data);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 0,
    gcTime: 0,
  });
}

export function usePropsStats() {
  return useQuery({
    queryKey: ['props', 'stats'],
    queryFn: () => api.get<any>(`/api/props/stats?t=${Date.now()}`),
    staleTime: 0,
    gcTime: 0,
  });
}

export function useDiversificationSuggestions() {
  return useMutation({
    mutationFn: (body: { sport?: string; platform?: string; count?: number }) =>
      api.post<any[]>('/api/props/diversification-suggestions', body),
  });
}
