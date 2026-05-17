import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get<any[]>('/api/leaderboard'),
    staleTime: 120_000,
  });
}
