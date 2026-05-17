import { useQuery } from '@tanstack/react-query';
import { api, buildQS } from '../../lib/api';

export function useResults(sport?: string, platform?: string, status?: string) {
  return useQuery({
    queryKey: ['results', sport, platform, status],
    queryFn: () => api.get<any[]>(`/api/results${buildQS({ sport, platform, status })}`),
    staleTime: 60_000,
  });
}

export function useResultsSummary() {
  return useQuery({
    queryKey: ['results', 'summary'],
    queryFn: () => api.get<any>('/api/results/summary'),
    staleTime: 60_000,
  });
}

export function useModelPerformance() {
  return useQuery({
    queryKey: ['results', 'model-performance'],
    queryFn: () => api.get<any[]>('/api/results/model-performance'),
    staleTime: 120_000,
  });
}
