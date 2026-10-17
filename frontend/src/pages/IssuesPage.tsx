import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Clock, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { useIssues } from '@/hooks/useIssues';
import { timeAgo, CATEGORY_ICON } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

const CATEGORIES = ['Pothole', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage', 'Road Damage', 'Fallen Tree', 'Broken Footpath', 'Traffic Signal', 'Encroachment', 'Other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function IssuesPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    statusTab: 'all', // 'all', 'open', 'in_progress', 'resolved'
    category: '', 
    severity: '', 
    sortBy: 'newest', 
    search: searchParams.get('search') || '',
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  // Map tabs to API status
  const getStatusQuery = () => {
    switch (filters.statusTab) {
      case 'open': return 'pending,assigned';
      case 'in_progress': return 'in_progress';
      case 'resolved': return 'resolved,closed';
      default: return ''; // all
    }
  };

  const { data, isLoading, isError, refetch, isRefetching } = useIssues({ 
    page, 
    limit: 10, 
    status: getStatusQuery(),
    category: filters.category,
    severity: filters.severity,
    sortBy: filters.sortBy,
    search: filters.search
  });
  
  const issues = data?.data || [];
  const pagination = data?.pagination;

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(f => ({ ...f, search: searchInput }));
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setFilters(f => ({ ...f, search: '' }));
    setPage(1);
  };

  const setFilter = (k: string, v: string) => {
    setFilters(f => ({ ...f, [k]: v }));
    setPage(1);
  };

  const activeFilterCount = (filters.category ? 1 : 0) + (filters.severity ? 1 : 0) + (filters.search ? 1 : 0) + (filters.sortBy !== 'newest' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchInput('');
    setFilters({ statusTab: 'all', category: '', severity: '', sortBy: 'newest', search: '' });
    setPage(1);
  };

  const StatusTabs = () => (
    <div className="flex bg-slate-100 dark:bg-muted p-1 rounded-lg w-fit overflow-x-auto no-scrollbar">
      {[
        { id: 'all', label: 'All Issues' },
        { id: 'open', label: 'Open' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'resolved', label: 'Resolved' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setFilter('statusTab', tab.id)}
          className={`px-4 py-2 text-[13px] font-medium rounded-md whitespace-nowrap transition-all ${
            filters.statusTab === tab.id 
              ? 'bg-white dark:bg-card text-blue-600 dark:text-primary shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen text-foreground font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight mb-2 flex items-center gap-3">
            Civic Issues
            {isLoading && <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 animate-spin" />}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px]">Browse and track civic issues reported across the city.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm mb-6 flex flex-col gap-4 relative z-20">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <StatusTabs />
          
          <form onSubmit={applySearch} className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border rounded-lg text-[13px] text-slate-900 dark:text-foreground placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-border/50">
          <select value={filters.category} onChange={e => setFilter('category', e.target.value)} className="bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select value={filters.severity} onChange={e => setFilter('severity', e.target.value)} className="bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="">All Priorities</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} Priority</option>)}
          </select>
          
          <select value={filters.sortBy} onChange={e => setFilter('sortBy', e.target.value)} className="bg-slate-50 dark:bg-muted/50 border border-slate-200 dark:border-border text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most_voted">Most supported</option>
          </select>

          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-[12px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 ml-auto transition-colors">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Feed */}
      <div className="space-y-4 relative z-10">
        
        {isError ? (
          <ErrorState 
            title="Couldn't load civic issues"
            description="Something went wrong while retrieving the issues. Please try again."
            onRetry={() => refetch()}
            isRetrying={isRefetching}
          />
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm flex gap-4 animate-pulse">
                <div className="w-16 h-16 bg-slate-100 dark:bg-muted/50 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-slate-100 dark:bg-muted/50 rounded w-2/3 max-w-[300px]" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-slate-100 dark:bg-muted/50 rounded w-20" />
                    <div className="h-5 bg-slate-100 dark:bg-muted/50 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          activeFilterCount > 0 ? (
            <EmptyState 
              icon={Search}
              title="No issues match your filters"
              description="Try adjusting your search query or clearing your current filters."
              action={
                <button onClick={clearAllFilters} className="px-5 py-2 text-[14px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-900 dark:text-foreground rounded-lg transition-colors">
                  Clear all filters
                </button>
              }
            />
          ) : (
            <EmptyState 
              icon={AlertTriangle}
              title="No civic issues reported yet"
              description="There are currently no civic issues reported in the system."
            />
          )
        ) : (
          <div className="flex flex-col gap-3">
            {issues.map((issue) => (
              <motion.div key={issue._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <Link to={`/issues/${issue._id}`} className="block group">
                  <div className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                    
                    {issue.images && issue.images.length > 0 ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted">
                        <img src={issue.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0 border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 flex items-center justify-center text-3xl">
                        {CATEGORY_ICON[issue.category] || '📋'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          issue.status === 'resolved' || issue.status === 'closed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          issue.status === 'in_progress' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                          issue.status === 'rejected' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        
                        {issue.severity === 'critical' || issue.severity === 'high' ? (
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${issue.severity === 'critical' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'}`}>
                            {issue.severity} priority
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-[16px] sm:text-[18px] font-semibold text-slate-900 dark:text-slate-50 mb-1.5 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {issue.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{issue.category}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> <span className="truncate max-w-[150px] sm:max-w-[300px]">{issue.location.address}</span></span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {timeAgo(issue.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex self-center w-8 h-8 items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-border mt-8 pt-6">
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Showing page <span className="font-medium text-slate-900 dark:text-slate-200">{page}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{pagination.pages}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-[13px] font-medium bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="px-4 py-2 text-[13px] font-medium bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
