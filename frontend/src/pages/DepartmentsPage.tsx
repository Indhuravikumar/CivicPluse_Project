import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Search, ArrowRight, Plus, Droplets, Zap, ShieldAlert, Trash2, HeartPulse, X } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

// Helper to map department names to relevant icons if building2 is too generic
const getDepartmentIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('water') || n.includes('drainage')) return <Droplets className="w-5 h-5 text-blue-500" />;
  if (n.includes('power') || n.includes('light') || n.includes('electric')) return <Zap className="w-5 h-5 text-yellow-500" />;
  if (n.includes('waste') || n.includes('garbage') || n.includes('sanitation')) return <Trash2 className="w-5 h-5 text-emerald-500" />;
  if (n.includes('health') || n.includes('medical')) return <HeartPulse className="w-5 h-5 text-rose-500" />;
  if (n.includes('police') || n.includes('safety') || n.includes('traffic')) return <ShieldAlert className="w-5 h-5 text-indigo-500" />;
  return <Building2 className="w-5 h-5 text-slate-500" />;
};

export default function DepartmentsPage() {
  const { data, isLoading, isError } = useDepartments();
  const [searchInput, setSearchInput] = useState('');
  
  const allDepartments = data?.data || [];

  // Local filtering based on search input
  const filteredDepartments = useMemo(() => {
    if (!searchInput.trim()) return allDepartments;
    const term = searchInput.toLowerCase();
    return allDepartments.filter((d: any) => 
      d.name.toLowerCase().includes(term) ||
      d.description.toLowerCase().includes(term) ||
      d.categories.some((cat: string) => cat.toLowerCase().includes(term))
    );
  }, [allDepartments, searchInput]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen text-foreground font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight">
            Departments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">
            Explore the teams responsible for keeping the city moving.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-3 shadow-sm mb-6 flex items-center relative z-20">
        <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search departments..."
          className="flex-1 h-10 px-4 bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] placeholder:text-slate-400"
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')} className="p-2 text-slate-400 hover:text-slate-600 shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Feed */}
      <div className="space-y-4 relative z-10">
        
        {isError ? (
           <ErrorState 
             title="Couldn't load departments"
             description="Something went wrong while loading department information."
             onRetry={() => window.location.reload()}
           />
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm flex gap-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 dark:bg-muted/50 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 bg-slate-100 dark:bg-muted/50 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 dark:bg-muted/50 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 dark:bg-muted/50 rounded w-1/4 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : allDepartments.length === 0 ? (
          <EmptyState 
            icon={Building2}
            title="No departments available"
            description="Department information will appear here when it becomes available."
          />
        ) : filteredDepartments.length === 0 ? (
          <EmptyState 
            icon={Search}
            title="No departments found"
            description="Try a different search term."
            action={
              <button onClick={() => setSearchInput('')} className="px-5 py-2 text-[14px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-900 dark:text-foreground rounded-lg transition-colors">
                Clear search
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredDepartments.map((dept: any) => {
              
              const totalAssigned = dept.totalAssigned || 0;
              const totalResolved = dept.totalResolved || 0;
              const totalIssues = totalAssigned + totalResolved;
              
              // Only calculate resolution rate if there are actual issues to avoid 0% on empty departments
              const resolutionRate = totalIssues > 0 
                ? Math.round((totalResolved / totalIssues) * 100) 
                : null;

              return (
                <motion.div key={dept._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <Link to={`/departments/${dept._id}`} className="block group">
                    <div className="bg-white dark:bg-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row gap-5 items-start">
                      
                      {/* Department Icon */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 flex items-center justify-center shadow-sm">
                        {getDepartmentIcon(dept.name)}
                      </div>

                      {/* Info Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-[17px] sm:text-[19px] font-bold text-slate-900 dark:text-slate-50 leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {dept.name}
                            </h3>
                            <p className="text-[14px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                              {dept.description}
                            </p>
                          </div>
                          
                          {/* Desktop Arrow */}
                          <div className="hidden sm:flex shrink-0 w-8 h-8 mt-1 items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
                          
                          {/* Categories List */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                            {dept.categories && dept.categories.length > 0 ? (
                              dept.categories.slice(0, 3).map((cat: string, idx: number) => (
                                <span key={cat} className="flex items-center">
                                  {cat}
                                  {idx < Math.min(dept.categories.length, 3) - 1 && <span className="mx-2 opacity-50">·</span>}
                                </span>
                              ))
                            ) : (
                              <span>General Services</span>
                            )}
                            {dept.categories && dept.categories.length > 3 && (
                              <span className="opacity-70"> +{dept.categories.length - 3} more</span>
                            )}
                          </div>
                          
                          {/* Metrics Rollup */}
                          {(totalAssigned > 0 || totalResolved > 0) && (
                            <div className="flex items-center gap-5 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-none border-slate-100 dark:border-border shrink-0">
                              <div className="flex flex-col items-start sm:items-end">
                                <span className="text-[16px] font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">{totalAssigned}</span>
                                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Active</span>
                              </div>
                              {resolutionRate !== null && (
                                <div className="flex flex-col items-start sm:items-end">
                                  <span className={`text-[16px] font-bold leading-none mb-1 ${resolutionRate >= 80 ? 'text-emerald-600 dark:text-emerald-500' : resolutionRate >= 50 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {resolutionRate}%
                                  </span>
                                  <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Resolution</span>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
