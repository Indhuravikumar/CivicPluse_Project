import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Issue, PaginatedResponse } from '@/types';
import { toast } from '@/components/ui/Toaster';

export interface IssueFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  severity?: string;
  sortBy?: string;
  search?: string;
  department?: string;
  reportedBy?: string;
}

export function useIssues(filters: IssueFilters = {}) {
  return useQuery<PaginatedResponse<Issue>>({
    queryKey: ['issues', filters],
    queryFn: () => api.get('/issues', { params: filters }).then(r => r.data),
  });
}

export function useIssue(id: string) {
  return useQuery<{ success: boolean; data: Issue }>({
    queryKey: ['issue', id],
    queryFn: () => api.get(`/issues/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => api.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue reported!', 'Your issue has been submitted for review.');
    },
    onError: () => toast.error('Failed to submit issue', 'Please try again.'),
  });
}

export function useUpdateIssueStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, message }: { id: string; status: string; message?: string }) =>
      api.patch(`/issues/${id}/status`, { status, message }).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issue', id] });
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status'),
  });
}

export function useResolveIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      api.patch(`/issues/${id}/status`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issue', id] });
      toast.success('Issue resolved successfully');
    },
    onError: () => toast.error('Failed to resolve issue'),
  });
}

export function useUpvoteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/issues/${id}/upvote`).then(r => r.data),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ['issue', id] }),
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/issues/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue deleted');
    },
    onError: () => toast.error('Failed to delete issue'),
  });
}
