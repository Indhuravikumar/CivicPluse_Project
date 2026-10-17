import { useAuthStore } from '@/store/authStore';
import { useDashboardStats, useOfficerStats } from '@/hooks/useAnalytics';
import { useIssues } from '@/hooks/useIssues';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { OfficerDashboard } from '@/components/dashboard/OfficerDashboard';
import { CitizenDashboard } from '@/components/dashboard/CitizenDashboard';
import { ErrorState } from '@/components/states/ErrorState';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  
  const adminStats = useDashboardStats({ enabled: isAdmin });
  const officerStats = useOfficerStats({ enabled: isOfficer });
  
  const { data: issuesData } = useIssues({ limit: 100 }); 
  
  const stats = isAdmin ? adminStats.data?.data : isOfficer ? officerStats.data?.data : null;
  const issues = issuesData?.data || [];
  
  const isLoading = (isAdmin && adminStats.isLoading) || (isOfficer && officerStats.isLoading);
  const isError = (isAdmin && adminStats.isError) || (isOfficer && officerStats.isError);

  // Global loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 animate-pulse space-y-8">
        <div className="h-16 bg-slate-100 dark:bg-muted rounded-lg w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-muted rounded-xl" />)}
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-64 bg-slate-100 dark:bg-muted rounded-2xl" />
          <div className="lg:col-span-5 h-64 bg-slate-100 dark:bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  // Global error state
  if (isError) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 min-h-[70vh]">
        <ErrorState 
          title="Couldn't load dashboard"
          description="We couldn't retrieve the latest city information at this time."
          onRetry={() => isAdmin ? adminStats.refetch() : officerStats.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 min-h-screen text-foreground transition-colors font-sans">
      <DashboardHeader user={user} />
      
      {user?.role === 'admin' && <AdminDashboard stats={stats} issues={issues} />}
      {user?.role === 'officer' && <OfficerDashboard stats={stats} issues={issues} />}
      {user?.role === 'citizen' && <CitizenDashboard issues={issues} />}
    </div>
  );
}
