import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useLearningInsights() {
  return useQuery({
    queryKey: ['model', 'learning-insights'],
    queryFn: () => api.get<any>('/api/model/learning-insights'),
    staleTime: 300_000,
  });
}
