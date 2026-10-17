import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface AdminAssignmentPanelProps {
  issueId: string;
  currentDepartmentId?: string;
  currentOfficerId?: string;
}

export function AdminAssignmentPanel({ issueId, currentDepartmentId, currentOfficerId }: AdminAssignmentPanelProps) {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState(currentDepartmentId || '');
  const [selectedOfficer, setSelectedOfficer] = useState(currentOfficerId || '');

  // Fetch departments
  const { data: deptsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then(r => r.data)
  });

  // Fetch officers for selected dept
  const { data: officersData } = useQuery({
    queryKey: ['departments', selectedDept, 'officers'],
    queryFn: () => api.get(`/departments/${selectedDept}/officers`).then(r => r.data),
    enabled: !!selectedDept
  });

  useEffect(() => {
    // Reset selected officer when department changes, unless it's the initial load matching current
    if (selectedDept !== currentDepartmentId) {
      setSelectedOfficer('');
    } else {
      setSelectedOfficer(currentOfficerId || '');
    }
  }, [selectedDept, currentDepartmentId, currentOfficerId]);

  const assignMutation = useMutation({
    mutationFn: (data: { department?: string, assignedTo?: string }) => 
      api.patch(`/issues/${issueId}/assignment`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    }
  });

  const handleAssign = () => {
    assignMutation.mutate({ 
      department: selectedDept || undefined, 
      assignedTo: selectedOfficer || undefined 
    });
  };

  const departments = deptsData?.data || [];
  const officers = officersData?.data || [];

  return (
    <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm mt-6">
      <div className="mb-4">
        <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase">Manual Assignment Override</h2>
        <p className="text-[12px] text-slate-500 mt-1">Use this to manually re-assign the issue or correct the automatic assignment.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-[12px] font-medium text-slate-500 mb-1 block">Department</label>
          <select 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
          >
            <option value="">Select Department</option>
            {departments.map((d: any) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[12px] font-medium text-slate-500 mb-1 block">Officer</label>
          <select 
            value={selectedOfficer} 
            onChange={(e) => setSelectedOfficer(e.target.value)}
            disabled={!selectedDept || officers.length === 0}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm disabled:opacity-50"
          >
            <option value="">{officers.length === 0 && selectedDept ? 'No officers available' : 'Select Officer'}</option>
            {officers.map((o: any) => (
              <option key={o._id} value={o._id}>{o.name}</option>
            ))}
          </select>
        </div>

        <Button 
          onClick={handleAssign} 
          disabled={assignMutation.isPending || (!selectedDept && !selectedOfficer)}
          className="w-full"
        >
          {assignMutation.isPending ? 'Assigning...' : 'Assign Issue'}
        </Button>
      </div>
    </div>
  );
}
