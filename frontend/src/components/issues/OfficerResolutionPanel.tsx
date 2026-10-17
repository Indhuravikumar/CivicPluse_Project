import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUpdateIssueStatus, useResolveIssue } from '@/hooks/useIssues';
import { Button } from '@/components/ui/Button';
import { Issue } from '@/types';
import { CheckCircle2, PlayCircle, Upload, X } from 'lucide-react';

interface OfficerResolutionPanelProps {
  issue: Issue;
}

export function OfficerResolutionPanel({ issue }: OfficerResolutionPanelProps) {
  const { user } = useAuthStore();
  const updateStatus = useUpdateIssueStatus();
  const resolveIssue = useResolveIssue();

  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<File[]>([]);

  // Check if assigned to current officer
  const assignedToId = typeof issue.assignedTo === 'object' ? issue.assignedTo?._id : issue.assignedTo;
  const isAssignedOfficer = user?.role === 'officer' && assignedToId === user._id;

  if (user?.role !== 'officer') return null;

  if (!isAssignedOfficer) {
    return (
      <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm mt-6">
        <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-2">Officer Controls</h2>
        <p className="text-[14px] text-slate-500">Assigned to another officer.</p>
      </div>
    );
  }

  // Already resolved/closed
  if (issue.status === 'resolved' || issue.status === 'closed' || issue.status === 'rejected') {
    return null;
  }

  const handleStartWork = () => {
    updateStatus.mutate({ id: issue._id, status: 'in_progress', message: 'Officer started working on this issue.' });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 3)); // Max 3 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleResolve = () => {
    if (!notes.trim()) return;

    const formData = new FormData();
    formData.append('status', 'resolved');
    formData.append('message', 'Issue has been successfully resolved.');
    formData.append('resolutionNotes', notes);
    images.forEach(img => formData.append('images', img));

    resolveIssue.mutate({ id: issue._id, data: formData });
  };

  return (
    <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm mt-6">
      <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Officer Workspace</h2>

      {(issue.status === 'pending' || issue.status === 'assigned') && (
        <div>
          <p className="text-[14px] text-slate-600 dark:text-slate-400 mb-4">
            This issue is assigned to you. When you are ready to begin investigating or fixing the problem, start work.
          </p>
          <Button 
            onClick={handleStartWork} 
            disabled={updateStatus.isPending}
            className="w-full flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-5 h-5" />
            {updateStatus.isPending ? 'Starting...' : 'Start Work'}
          </Button>
        </div>
      )}

      {issue.status === 'in_progress' && (
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-slate-500 mb-1 block">Resolution Notes</label>
            <textarea
              className="w-full h-24 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe what was done to resolve this issue..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-slate-500 mb-2 block">Resolution Evidence (Optional)</label>
            <div className="flex flex-wrap gap-3">
              {images.map((file, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={URL.createObjectURL(file)} alt="Evidence" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500">Add Image</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <Button 
            onClick={handleResolve} 
            disabled={resolveIssue.isPending || !notes.trim()}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="w-5 h-5" />
            {resolveIssue.isPending ? 'Resolving...' : 'Mark as Resolved'}
          </Button>
        </div>
      )}
    </div>
  );
}
