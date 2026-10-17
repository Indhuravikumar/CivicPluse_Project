import React from 'react';
import { DashboardKpiGrid } from './DashboardKpiGrid';
import { MyWorkQueue } from './MyWorkQueue';
import { RecentActivity } from './RecentActivity';

interface OfficerDashboardProps {
  stats: any;
  issues: any[];
}

export function OfficerDashboard({ stats, issues }: OfficerDashboardProps) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 mt-2">
      {/* KPI Grid (8 metrics) */}
      <DashboardKpiGrid stats={stats} />
      
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8">
           <MyWorkQueue />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8">
           <RecentActivity />
        </div>
      </div>
    </div>
  );
}
