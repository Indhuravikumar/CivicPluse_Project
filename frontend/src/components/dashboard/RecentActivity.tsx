import { motion } from 'framer-motion';
import { useIssues } from '@/hooks/useIssues';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function RecentActivity() {
  const { data: issuesData, isLoading, isError } = useIssues({ limit: 4 });
  const reports = issuesData?.data || [];
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="h-full flex flex-col">
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full group">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border/50 mb-4">
          <h2 className="text-[12px] font-bold tracking-[0.15em] text-slate-500 dark:text-muted-foreground uppercase">
            Recent Civic Activity
          </h2>
        </div>

        {isError ? (
           <div className="flex-1 flex items-center justify-center text-[13px] text-rose-500 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-500/5 rounded-lg border border-dashed border-rose-100 dark:border-rose-900/30">
             Couldn't load recent activity.
           </div>
        ) : isLoading ? (
          <div className="space-y-4 animate-pulse flex-1">
            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-slate-100 dark:bg-muted/50 rounded w-full" />)}
          </div>
        ) : reports.length > 0 ? (
          <div className="flex flex-col gap-2 flex-1">
            {reports.map((issue) => (
              <div key={issue._id} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-accent/50 transition-colors">
                <span className="text-[14px] font-medium text-slate-900 dark:text-foreground truncate max-w-[60%]">{issue.title}</span>
                <span className={`text-[12px] font-medium capitalize ${issue.status === 'resolved' || issue.status === 'closed' ? 'text-emerald-600 dark:text-emerald-500' : issue.status === 'in_progress' ? 'text-blue-600 dark:text-blue-500' : 'text-amber-600 dark:text-amber-500'}`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[13px] text-slate-500 dark:text-muted-foreground bg-slate-50 dark:bg-transparent rounded-lg border border-dashed border-slate-200 dark:border-transparent p-4 text-center">
            No civic activity yet.
          </div>
        )}
        
        <Link to="/issues" className="text-[13px] font-medium text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-primary/80 transition-colors flex items-center gap-1.5 w-fit mt-4 pt-4 border-t border-slate-100 dark:border-border/50 w-full">
          View all issues <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ml-auto" />
        </Link>
      </div>
    </motion.div>
  );
}
