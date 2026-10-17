import { motion } from 'framer-motion';
import { useIssues } from '@/hooks/useIssues';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function MyReportsSummary() {
  const { data: issuesData, isLoading, isError } = useIssues({ limit: 50 });
  const reports = issuesData?.data || [];
  
  const total = issuesData?.pagination?.total || reports.length;
  const inProgress = reports.filter(r => r.status === 'in_progress').length;
  const resolved = reports.filter(r => r.status === 'resolved' || r.status === 'closed').length;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="h-full flex flex-col">
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full group">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-border/50 mb-4">
          <h2 className="text-[12px] font-bold tracking-[0.15em] text-slate-500 dark:text-muted-foreground uppercase">
            Your Reports
          </h2>
        </div>

        {isError ? (
           <div className="flex-1 flex items-center justify-center text-[13px] text-rose-500 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-500/5 rounded-lg border border-dashed border-rose-100 dark:border-rose-900/30 text-center px-4">
             Couldn't load your reports.
           </div>
        ) : isLoading ? (
          <div className="space-y-4 animate-pulse flex-1">
            {[1, 2, 3].map(i => <div key={i} className="h-4 bg-slate-100 dark:bg-muted/50 rounded w-full" />)}
          </div>
        ) : total > 0 ? (
          <div className="flex flex-col gap-3 flex-1 justify-center">
            <div className="flex justify-between text-[14px]">
              <span className="text-slate-600 dark:text-slate-300">Submitted</span>
              <span className="font-semibold text-slate-900 dark:text-slate-50">{total}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-slate-600 dark:text-slate-300">In Progress</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{inProgress}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-slate-600 dark:text-slate-300">Resolved</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{resolved}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[13px] text-slate-500 dark:text-muted-foreground bg-slate-50 dark:bg-transparent rounded-lg border border-dashed border-slate-200 dark:border-transparent p-4 text-center">
             <p>No reports yet.</p>
             <p className="mt-1 opacity-80">Report an issue to track it here.</p>
          </div>
        )}
        
        <Link to="/issues" className="text-[13px] font-medium text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-primary/80 transition-colors flex items-center gap-1.5 w-fit mt-4 pt-4 border-t border-slate-100 dark:border-border/50 w-full">
          View your reports <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ml-auto" />
        </Link>
      </div>
    </motion.div>
  );
}
