import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats, TrendData, CategoryStat, DeptPerformance } from '@/types';

export function useDashboardStats(options?: { enabled?: boolean }) {
  return useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    refetchInterval: 60000,
    ...options,
  });
}

export function useTrends(days = 30) {
  return useQuery<{ success: boolean; data: TrendData[] }>({
    queryKey: ['analytics', 'trends', days],
    queryFn: () => api.get('/analytics/trends', { params: { days } }).then(r => r.data),
  });
}

export function useCategoryStats() {
  return useQuery<{ success: boolean; data: CategoryStat[] }>({
    queryKey: ['analytics', 'categories'],
    queryFn: () => api.get('/analytics/categories').then(r => r.data),
  });
}

export function useDeptPerformance() {
  return useQuery<{ success: boolean; data: DeptPerformance[] }>({
    queryKey: ['analytics', 'departments'],
    queryFn: () => api.get('/analytics/departments').then(r => r.data),
  });
}

export function useSeverityStats() {
  return useQuery<{ success: boolean; data: { _id: string; count: number }[] }>({
    queryKey: ['analytics', 'severity'],
    queryFn: () => api.get('/analytics/severity').then(r => r.data),
  });
}

export function useHeatmapData() {
  return useQuery({
    queryKey: ['analytics', 'heatmap'],
    queryFn: () => api.get('/analytics/heatmap').then(r => r.data),
  });
}

export function useOfficerStats(options?: { enabled?: boolean }) {
  return useQuery<{ success: boolean; data: any }>({
    queryKey: ['analytics', 'officer'],
    queryFn: () => api.get('/analytics/officer').then(r => r.data),
    refetchInterval: 60000,
    ...options,
  });
}
