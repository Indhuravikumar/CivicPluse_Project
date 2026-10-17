import { DashboardStats } from '@/types';
import { DashboardKpiCard } from './DashboardKpiCard';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Activity, Users, Building2, TrendingUp } from 'lucide-react';

interface Props { stats?: DashboardStats; }

export function DashboardKpiGrid({ stats }: Props) {
  const totalIssues = stats?.totalIssues || 0;
  
  // Derived or mock semantic stats based on backend response structure (assumed fields from standard responses)
  const pending = stats ? (stats as any).pendingIssues || 0 : 0;
  const resolved = stats?.resolvedIssues || 0;
  const critical = stats ? (stats as any).criticalIssues || 0 : 0;
  const inProgress = stats?.inProgressIssues || 0;
  const activeCitizens = stats ? (stats as any).activeCitizens || 0 : 0;
  const activeDepts = stats ? (stats as any).activeDepartments || 0 : 0;
  const resolutionRate = stats?.resolutionRate ? Math.round(stats.resolutionRate) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-6">
      <DashboardKpiCard
        title="Total Issues"
        value={totalIssues}
        description="Reported city-wide"
        icon={AlertCircle}
        colorClass="text-blue-600 dark:text-blue-500"
        iconBgClass="bg-blue-50 dark:bg-blue-500/10"
        delay={0.1}
      />
      <DashboardKpiCard
        title="Pending"
        value={pending}
        description="Awaiting assignment"
        icon={Clock}
        colorClass="text-amber-600 dark:text-amber-500"
        iconBgClass="bg-amber-50 dark:bg-amber-500/10"
        delay={0.15}
      />
      <DashboardKpiCard
        title="Resolved"
        value={resolved}
        description="Successfully closed"
        icon={CheckCircle2}
        colorClass="text-emerald-600 dark:text-emerald-500"
        iconBgClass="bg-emerald-50 dark:bg-emerald-500/10"
        delay={0.2}
      />
      <DashboardKpiCard
        title="Critical"
        value={critical}
        description="Requires immediate action"
        icon={AlertTriangle}
        colorClass="text-red-600 dark:text-red-500"
        iconBgClass="bg-red-50 dark:bg-red-500/10"
        delay={0.25}
      />
      
      {/* Row 2 */}
      <DashboardKpiCard
        title="In Progress"
        value={inProgress}
        description="Actively being addressed"
        icon={Activity}
        colorClass="text-indigo-600 dark:text-indigo-500"
        iconBgClass="bg-indigo-50 dark:bg-indigo-500/10"
        delay={0.3}
      />
      <DashboardKpiCard
        title="Citizens"
        value={activeCitizens || 'N/A'}
        description="Active reporters"
        icon={Users}
        colorClass="text-teal-600 dark:text-teal-500"
        iconBgClass="bg-teal-50 dark:bg-teal-500/10"
        delay={0.35}
      />
      <DashboardKpiCard
        title="Departments"
        value={activeDepts || 'N/A'}
        description="Connected agencies"
        icon={Building2}
        colorClass="text-purple-600 dark:text-purple-500"
        iconBgClass="bg-purple-50 dark:bg-purple-500/10"
        delay={0.4}
      />
      <DashboardKpiCard
        title="Resolution Rate"
        value={totalIssues > 0 ? `${resolutionRate}%` : 'N/A'}
        description="Overall efficiency"
        icon={TrendingUp}
        colorClass="text-emerald-600 dark:text-emerald-500"
        iconBgClass="bg-emerald-50 dark:bg-emerald-500/10"
        delay={0.45}
      />
    </div>
  );
}
