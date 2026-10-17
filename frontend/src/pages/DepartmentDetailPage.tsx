import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ArrowLeft, 
  Droplets, 
  Zap, 
  Trash2, 
  HeartPulse, 
  ShieldAlert, 
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useDepartment } from '@/hooks/useDepartments';
import { useIssues } from '@/hooks/useIssues';
import { Issue } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

const getDepartmentIcon = (name: string, className = "w-5 h-5") => {
  if (!name) return <Building2 className={className} />;
  const n = name.toLowerCase();
  if (n.includes('water') || n.includes('drainage')) return <Droplets className={className} />;
  if (n.includes('power') || n.includes('light') || n.includes('electric')) return <Zap className={className} />;
  if (n.includes('waste') || n.includes('garbage') || n.includes('sanitation')) return <Trash2 className={className} />;
  if (n.includes('health') || n.includes('medical')) return <HeartPulse className={className} />;
  if (n.includes('police') || n.includes('safety') || n.includes('traffic')) return <ShieldAlert className={className} />;
  return <Building2 className={className} />;
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'resolved':
    case 'closed': return 'bg-emerald-500';
    case 'in_progress': return 'bg-amber-500';
    case 'rejected': return 'bg-rose-500';
    default: return 'bg-blue-500';
  }
};

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: deptData, isLoading: isLoadingDept, isError: isErrorDept } = useDepartment(id);
  const { data: issuesData, isLoading: isLoadingIssues } = useIssues({ department: id, limit: 10 });
  
  const dept = deptData?.data;
  const issues = issuesData?.data || [];
  
  const totalAssigned = dept?.totalAssigned || 0;
  const totalResolved = dept?.totalResolved || 0;
  const totalIssues = totalAssigned + totalResolved;
  const resolutionRate = totalIssues > 0 ? Math.round((totalResolved / totalIssues) * 100) : null;
  
  if (isErrorDept) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 min-h-[60vh]">
        <ErrorState 
          title="Department not found"
          description="The department you're looking for isn't available or something went wrong while loading it."
          onRetry={() => window.history.back()}
        />
      </div>
    );
  }

  if (isLoadingDept) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-pulse">
        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded mb-8" />
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="w-1/3 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-800 my-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!dept) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen font-sans">
      
      {/* Top Nav */}
      <Link to="/departments" className="inline-flex items-center text-[14px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
        Back to Departments
      </Link>

      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0 shadow-sm text-blue-600 dark:text-blue-400">
            {getDepartmentIcon(dept.name, "w-8 h-8 sm:w-10 sm:h-10")}
          </div>
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-2">
              {dept.name}
            </h1>
            <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {dept.description}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-slate-200/80 dark:border-border my-8" />

      {/* Overview Metrics */}
      <div className="mb-10">
        <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Department Overview</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mb-2">Active Issues</span>
            <span className="text-[28px] font-bold text-slate-900 dark:text-slate-100">{totalAssigned}</span>
          </div>
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mb-2">Resolved</span>
            <span className="text-[28px] font-bold text-slate-900 dark:text-slate-100">{totalResolved}</span>
          </div>
          {resolutionRate !== null && (
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mb-2">Resolution Rate</span>
              <span className={`text-[28px] font-bold ${resolutionRate >= 80 ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-900 dark:text-slate-100'}`}>
                {resolutionRate}%
              </span>
            </div>
          )}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mb-2">Service Status</span>
            <span className="text-[16px] font-semibold text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 mt-auto pb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column (About & Responsibilities) */}
        <div className="space-y-8 lg:col-span-1">
          <div>
            <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">About this department</h2>
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm">
              <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {dept.description}
              </p>
              
              {dept.slaHours && (
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-border/50 flex items-center gap-3 text-[14px] text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Target SLA: <strong className="text-slate-900 dark:text-slate-200 font-medium">{dept.slaHours} hours</strong></span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Areas of Responsibility</h2>
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-3 shadow-sm flex flex-col gap-1">
              {dept.categories && dept.categories.length > 0 ? (
                dept.categories.map((cat: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-[14px] text-slate-500">General municipal services</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Active Issues) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase">Issues Being Handled</h2>
            {issues.length > 0 && (
              <Link to="/issues" className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            )}
          </div>
          
          <div className="space-y-3">
            {isLoadingIssues ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-5 h-24 animate-pulse" />
              ))
            ) : issues.length === 0 ? (
              <EmptyState 
                icon={ShieldAlert}
                title="No active issues"
                description="There are currently no reported issues assigned to this department."
              />
            ) : (
              issues.map((issue: Issue) => (
                <Link key={issue._id} to={`/issues/${issue._id}`} className="block group">
                  <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {issue.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        <span>{issue.category}</span>
                        <span className="opacity-50">·</span>
                        <span className="capitalize">{issue.severity} Priority</span>
                        <span className="opacity-50">·</span>
                        <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-border/50 flex-1 justify-center sm:flex-none">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(issue.status)}`} />
                        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 capitalize tracking-wide">{issue.status.replace('_', ' ')}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all hidden sm:block" />
                    </div>

                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
