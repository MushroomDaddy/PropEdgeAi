import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useImports() {
  return useQuery({
    queryKey: ['imports'],
    queryFn: () => api.get<any[]>('/api/imports'),
    staleTime: 30_000,
  });
}

export function useManualImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post<any>('/api/imports/manual', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['imports'] });
      qc.invalidateQueries({ queryKey: ['picks'] });
    },
  });
}

export function useCsvImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { rows: any[] }) => api.post<any>('/api/imports/csv', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['imports'] });
      qc.invalidateQueries({ queryKey: ['picks'] });
    },
  });
}
