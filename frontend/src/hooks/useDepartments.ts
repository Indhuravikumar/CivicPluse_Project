import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Department } from '@/types';

export function useDepartments() {
  return useQuery<{ success: boolean; data: Department[] }>({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartment(id?: string) {
  return useQuery<{ success: boolean; data: Department }>({
    queryKey: ['department', id],
    queryFn: () => api.get(`/departments/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
