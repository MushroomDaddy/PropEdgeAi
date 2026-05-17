import { useQuery } from '@tanstack/react-query';
import { api, buildQS } from '../../lib/api';

export function useGames(sport?: string) {
  return useQuery({
    queryKey: ['games', sport],
    queryFn: () => api.get<any[]>(`/api/games${buildQS({ sport })}`),
    staleTime: 60_000,
  });
}

export function useUpcomingGames(sport?: string) {
  return useQuery({
    queryKey: ['games', 'upcoming', sport],
    queryFn: () => api.get<any[]>(`/api/games/upcoming${buildQS({ sport })}`),
    staleTime: 60_000,
  });
}

export function useLiveGames() {
  return useQuery({
    queryKey: ['games', 'live'],
    queryFn: () => api.get<any[]>('/api/games/live'),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useGameDetail(gameId?: string) {
  return useQuery({
    queryKey: ['games', gameId],
    queryFn: () => api.get<any>(`/api/games/${gameId}`),
    enabled: !!gameId,
    staleTime: 30_000,
  });
}
