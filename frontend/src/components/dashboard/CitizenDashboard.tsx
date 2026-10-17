import React from 'react';
import { QuickReportCard } from './QuickReportCard';
import { MyReportsSummary } from './MyReportsSummary';
import { RecentReports } from './RecentReports';

interface CitizenDashboardProps {
  issues: any[];
}

export function CitizenDashboard({ issues }: CitizenDashboardProps) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 mt-2">
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8">
           {/* Replace Trend Chart with a large Recent Reports view for citizen */}
           <RecentReports />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8">
           <QuickReportCard />
           <MyReportsSummary />
        </div>
      </div>
    </div>
  );
}
