import { useQuery } from '@tanstack/react-query';
import { api, buildQS } from '../../lib/api';

export function useBankroll(platform?: string) {
  return useQuery({
    queryKey: ['bankroll', platform],
    queryFn: () => api.get<any[]>(`/api/bankroll${buildQS({ platform })}`),
    staleTime: 60_000,
  });
}

export function useBankrollTransactions(platform?: string) {
  return useQuery({
    queryKey: ['bankroll', 'transactions', platform],
    queryFn: () => api.get<any[]>(`/api/bankroll/transactions${buildQS({ platform })}`),
    staleTime: 60_000,
  });
}

export function useBankrollSummary() {
  return useQuery({
    queryKey: ['bankroll', 'summary'],
    queryFn: () => api.get<any>('/api/bankroll/summary'),
    staleTime: 60_000,
  });
}
