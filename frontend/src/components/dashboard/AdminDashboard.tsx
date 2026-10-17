import React from 'react';
import { DashboardKpiGrid } from './DashboardKpiGrid';
import { IssueTrendChart } from './IssueTrendChart';
import { CategoryDistribution } from './CategoryDistribution';
import { RecentActivity } from './RecentActivity';

interface AdminDashboardProps {
  stats: any;
  issues: any[];
}

export function AdminDashboard({ stats, issues }: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 mt-2">
      {/* KPI Grid (8 metrics) */}
      <DashboardKpiGrid stats={stats} />
      
      {/* Analytics Row: Trends & Categories */}
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-7 xl:col-span-8">
          <IssueTrendChart issues={issues} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <CategoryDistribution issues={issues} />
        </div>
      </div>
      
      {/* Bottom Row: Activity Summaries */}
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-12 xl:col-span-12">
           <RecentActivity />
        </div>
      </div>
    </div>
  );
}
