import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  ChevronRight, 
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { useIssues } from '@/hooks/useIssues';
import { Issue } from '@/types';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'resolved':
    case 'closed': return 'bg-emerald-500';
    case 'in_progress': return 'bg-blue-500';
    case 'rejected': return 'bg-rose-500';
    case 'pending': return 'bg-amber-500';
    default: return 'bg-slate-400';
  }
};

const getStatusLabel = (status: string) => status.replace('_', ' ');

export default function MyReportsPage() {
  const { user } = useAuthStore();
  // Ensure we only fetch if we have a user
  const { data: issuesData, isLoading, isError } = useIssues({ reportedBy: user?._id, limit: 100 });
  const allReports = issuesData?.data || [];

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Pending' | 'Resolved'>('All');

  const { total, active, pending, resolved } = useMemo(() => {
    let active = 0, pending = 0, resolved = 0;
    allReports.forEach((r: Issue) => {
      const s = r.status.toLowerCase();
      if (s === 'resolved' || s === 'closed') resolved++;
      else if (s === 'pending') pending++;
      else active++;
    });
    return { total: allReports.length, active, pending, resolved };
  }, [allReports]);

  const filteredReports = useMemo(() => {
    if (activeFilter === 'All') return allReports;
    return allReports.filter((r: Issue) => {
      const s = r.status.toLowerCase();
      if (activeFilter === 'Resolved') return s === 'resolved' || s === 'closed';
      if (activeFilter === 'Pending') return s === 'pending';
      if (activeFilter === 'Active') return s !== 'resolved' && s !== 'closed' && s !== 'pending';
      return true;
    });
  }, [allReports, activeFilter]);

  const handleFilterClick = (filter: 'All' | 'Active' | 'Pending' | 'Resolved') => {
    setActiveFilter(prev => prev === filter ? 'All' : filter);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen text-foreground font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight">
            My Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">
            Track the civic issues you've reported and follow their progress.
          </p>
        </div>
        <Link to="/report">
          <button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all rounded-lg px-6 font-medium h-11 w-full sm:w-auto flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Report an issue
          </button>
        </Link>
      </div>

      {/* Overview & Filters Container */}
      {!isLoading && !isError && allReports.length > 0 && (
        <div className="mb-8 space-y-6 relative z-20">
          
          {/* Report Overview */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-5">Report Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="flex flex-col">
                <span className="text-[24px] font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{total}</span>
                <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Total reports</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[24px] font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{active}</span>
                <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Active</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[24px] font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{resolved}</span>
                <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Resolved</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[24px] font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{pending}</span>
                <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Pending</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Active', 'Pending', 'Resolved'] as const).map(filter => {
              const isSelected = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  aria-pressed={isSelected}
                  className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : 'bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-muted/80'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Feed */}
      <div className="space-y-4 relative z-10">
        
        {isError ? (
           <ErrorState 
             title="Couldn't load your reports"
             description="Something went wrong while loading your submitted reports."
             onRetry={() => window.location.reload()} // For now reload or react-query retry. Or if we refactored useIssues to export refetch we could use it. I will leave reload for now to keep it simple, since useIssues doesn't export refetch in all places.
           />
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="bg-slate-200 dark:bg-slate-800 h-28 rounded-2xl animate-pulse mb-6" />
            <div className="flex gap-2 mb-6">
              <div className="bg-slate-200 dark:bg-slate-800 h-10 w-20 rounded-lg animate-pulse" />
              <div className="bg-slate-200 dark:bg-slate-800 h-10 w-24 rounded-lg animate-pulse" />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm flex flex-col gap-4 animate-pulse">
                <div className="h-6 bg-slate-100 dark:bg-muted/50 rounded w-3/4" />
                <div className="flex gap-4">
                  <div className="h-4 bg-slate-100 dark:bg-muted/50 rounded w-1/4" />
                  <div className="h-4 bg-slate-100 dark:bg-muted/50 rounded w-1/4" />
                </div>
                <div className="h-10 bg-slate-100 dark:bg-muted/50 rounded w-full mt-2" />
              </div>
            ))}
          </div>
        ) : allReports.length === 0 ? (
          <EmptyState 
            icon={ClipboardList}
            title="No reports yet"
            description="You haven't reported any civic issues. When you report an issue, you'll be able to track its progress here."
            action={
              <Link to="/report" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all rounded-lg px-6 font-medium h-11 flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" />
                Report an issue
              </Link>
            }
          />
        ) : filteredReports.length === 0 ? (
          <EmptyState 
            icon={ClipboardList}
            title={`No ${activeFilter.toLowerCase()} reports`}
            description="Try another filter or view all your reports."
            action={
              <button onClick={() => setActiveFilter('All')} className="px-5 py-2 text-[14px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-900 dark:text-foreground rounded-lg transition-colors">
                View all
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report: Issue) => {
                
                const isResolved = report.status === 'resolved' || report.status === 'closed';
                const isPending = report.status === 'pending';
                const isActive = !isResolved && !isPending;
                
                return (
                  <motion.div 
                    key={report._id} 
                    layout
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`bg-white dark:bg-card border rounded-2xl shadow-sm transition-all flex flex-col sm:flex-row overflow-hidden group ${
                      isActive 
                        ? 'border-blue-200/60 dark:border-blue-500/30 shadow-blue-500/5 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md' 
                        : 'border-slate-200/80 dark:border-border hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
                    }`}>
                      
                      {/* Image Thumbnail (if any) */}
                      {report.images && report.images.length > 0 && (
                        <div className="w-full sm:w-40 h-32 sm:h-auto shrink-0 bg-slate-100 dark:bg-muted relative">
                          <img 
                            src={report.images[0]} 
                            alt="Issue" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {report.title}
                            </h3>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-border/50 shrink-0">
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(report.status)} ${isActive ? 'animate-pulse' : ''}`} />
                              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 capitalize tracking-wide">{getStatusLabel(report.status)}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400 mb-4">
                            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              {report.category}
                            </span>
                            <span className="opacity-50 hidden sm:inline">·</span>
                            <span className="capitalize">{report.severity} priority</span>
                            <span className="opacity-50 hidden sm:inline">·</span>
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">{report.location.address.split(',')[0]}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-100 dark:border-border/50">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[12px] text-slate-400 font-medium">
                              {isResolved ? 'Resolved' : 'Last updated'} {formatDistanceToNow(new Date(report.updatedAt || report.createdAt), { addSuffix: true })}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Submitted {format(new Date(report.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          
                          <Link to={`/issues/${report._id}`} className="shrink-0 w-full sm:w-auto">
                            <button className="w-full sm:w-auto text-[13px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-colors flex items-center justify-center sm:justify-end gap-1">
                              View report <ChevronRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                        
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
