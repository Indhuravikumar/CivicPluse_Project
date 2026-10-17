import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, MapPin, ArrowRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useIssues } from '@/hooks/useIssues';
import { useAuthStore } from '@/store/authStore';
import { timeAgo, CATEGORY_ICON } from '@/lib/utils';
import { EmptyState } from '@/components/states/EmptyState';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'resolved':
    case 'closed': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
    case 'in_progress': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
    case 'rejected': return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-100 dark:border-red-500/20';
    default: return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'text-red-700 dark:text-red-400';
    case 'high': return 'text-orange-700 dark:text-orange-400';
    case 'medium': return 'text-blue-700 dark:text-blue-400';
    default: return 'text-slate-600 dark:text-slate-400';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />;
    case 'high': return <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />;
    default: return <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />;
  }
};

export function MyWorkQueue() {
  const { user } = useAuthStore();
  
  // Fetch issues assigned to the authenticated officer, sorted by priority
  const { data, isLoading, isError } = useIssues({
    assignedTo: user?._id,
    sortBy: 'priority',
    limit: 5,
  });

  const issues = data?.data || [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-border">
        <div>
          <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" /> My Work Queue
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Issues currently assigned to you</p>
        </div>
        {issues.length > 0 && (
          <Link to="/issues" className="text-[13px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            View all &rarr;
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-[13px] text-slate-500">
            Failed to load your work queue.
          </div>
        ) : issues.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <EmptyState 
              icon={ShieldAlert}
              title="No issues assigned to you"
              description="New issues assigned to your department will appear here."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {issues.map(issue => (
              <Link key={issue._id} to={`/issues/${issue._id}`} className="block group">
                <div className="relative flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm bg-slate-50/50 dark:bg-muted/30 hover:bg-white dark:hover:bg-muted/60 transition-all">
                  
                  {/* Icon & Title Row */}
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-8">
                        {issue.title}
                      </h3>
                      
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-400">{CATEGORY_ICON[issue.category] || '📋'}</span>
                          {issue.category}
                        </span>
                        
                        <span className="opacity-40">&bull;</span>
                        
                        <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]">
                          <MapPin className="w-3 h-3" />
                          {issue.location?.address?.split(',')[0] || 'Unknown location'}
                        </span>
                      </div>
                      
                      {/* Bottom row badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        
                        {(issue.severity === 'critical' || issue.severity === 'high') && (
                          <span className={`text-[11px] font-bold uppercase tracking-wide ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 ml-auto sm:ml-2">
                          <Clock className="w-3 h-3" />
                          Assigned {timeAgo(issue.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Right Action */}
                  <div className="hidden sm:flex items-center justify-center shrink-0 self-center">
                    <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 flex items-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                      Open issue <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                  
                  {/* Mobile Right Action */}
                  <div className="sm:hidden absolute top-4 right-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
