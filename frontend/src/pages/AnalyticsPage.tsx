import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTrends, useCategoryStats, useDeptPerformance, useSeverityStats } from '@/hooks/useAnalytics';
import { Search, MapPin, Activity, LayoutList, ShieldAlert, Building2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

export default function AnalyticsPage() {
  const navigate = useNavigate();

  const { data: trendsData, isLoading: isTrendsLoading } = useTrends(30);
  const { data: catData, isLoading: isCatLoading } = useCategoryStats();
  const { data: deptData, isLoading: isDeptLoading } = useDeptPerformance();
  const { data: sevData, isLoading: isSevLoading } = useSeverityStats();

  const trends = trendsData?.data || [];
  const categories = catData?.data || [];
  const depts = deptData?.data || [];
  const severities = sevData?.data || [];

  const isLoading = isTrendsLoading || isCatLoading || isDeptLoading || isSevLoading;

  // Calculate Overview Metrics from actual data
  const overview = useMemo(() => {
    let totalReports = 0;
    let resolved = 0;
    
    depts.forEach((d: any) => {
      totalReports += d.total;
      resolved += d.resolved;
    });

    const active = totalReports - resolved;
    const resolutionRate = totalReports > 0 ? Math.round((resolved / totalReports) * 100) : 0;

    return {
      totalReports,
      active,
      resolved,
      resolutionRate
    };
  }, [depts]);

  const getSnapshotText = () => {
    if (isLoading) return 'Loading civic snapshot...';
    if (overview.totalReports === 0) return 'No civic reports have been submitted yet.';
    if (overview.totalReports === 1) return '1 civic report has been submitted in the selected period. Current activity is limited, so there are not enough historical reports to establish a meaningful trend yet.';
    return `${overview.totalReports.toLocaleString()} civic reports have been submitted across your city in the selected period.`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen font-sans text-foreground">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            Civic Insights
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">
            Understand the civic issues being reported across your city.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 border border-slate-200 dark:border-border rounded-lg bg-white dark:bg-card text-[13px] font-medium text-slate-600 dark:text-slate-300">
            Last 30 days
          </div>
          <button 
            onClick={() => navigate('/issues')}
            className="hidden sm:flex items-center gap-2 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/80 border border-slate-200 dark:border-border px-4 py-2 rounded-lg transition-all"
          >
            <Search className="w-4 h-4" />
            View issues
          </button>
          <button 
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 text-[14px] font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-sm"
          >
            <MapPin className="w-4 h-4" />
            Live map
          </button>
        </div>
      </div>

      {/* Civic Snapshot */}
      <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-[12px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1">Civic Snapshot</h2>
          <p className="text-[15px] text-slate-700 dark:text-slate-300 font-medium leading-snug">
            {getSnapshotText()}
          </p>
        </div>
      </div>

      {/* Compact Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reports</span>
          <span className="text-[24px] font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
            {isLoading ? '-' : overview.totalReports.toLocaleString()}
          </span>
          <span className="text-[12px] text-slate-500 dark:text-slate-500">Across selected period</span>
        </div>
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active</span>
          <span className="text-[24px] font-bold text-blue-600 dark:text-blue-500 leading-none mb-1">
            {isLoading ? '-' : overview.active.toLocaleString()}
          </span>
          <span className="text-[12px] text-slate-500 dark:text-slate-500">Currently unresolved</span>
        </div>
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resolved</span>
          <span className="text-[24px] font-bold text-emerald-600 dark:text-emerald-500 leading-none mb-1">
            {isLoading ? '-' : overview.resolved.toLocaleString()}
          </span>
          <span className="text-[12px] text-slate-500 dark:text-slate-500">Successfully addressed</span>
        </div>
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resolution Rate</span>
          <span className="text-[24px] font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">
            {isLoading ? '-' : `${overview.resolutionRate}%`}
          </span>
          <span className="text-[12px] text-slate-500 dark:text-slate-500">City-wide</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        
        {/* Issue Reporting Trend / Sparse State */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[13px] font-bold tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" /> Reporting Activity
          </h2>
          
          {isLoading ? (
            <div className="w-full h-[200px] bg-slate-50 dark:bg-muted/30 rounded-xl animate-pulse" />
          ) : trends.length < 2 || overview.totalReports <= 1 ? (
            <div className="flex-1 bg-slate-50/50 dark:bg-muted/20 rounded-xl border border-dashed border-slate-200 dark:border-border p-6 flex flex-col items-center justify-center text-center">
              <span className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {overview.totalReports === 1 ? '1 report submitted' : 'No reports submitted'}
              </span>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-[250px]">
                Not enough historical data to show a meaningful trend yet. Keep reporting to build the civic activity picture.
              </p>
            </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="_id" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickFormatter={v => v.slice(5)} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reported" 
                    name="Reports" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorReported)" 
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[13px] font-bold tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-4 flex items-center gap-2">
            <LayoutList className="w-4 h-4 text-slate-400" /> Issue Categories
          </h2>
          
          {isLoading ? (
            <div className="w-full h-[200px] bg-slate-50 dark:bg-muted/30 rounded-xl animate-pulse" />
          ) : categories.length === 0 ? (
            <div className="flex-1 bg-slate-50/50 dark:bg-muted/20 rounded-xl border border-dashed border-slate-200 dark:border-border p-6 flex items-center justify-center text-center">
              <span className="text-[14px] text-slate-500 dark:text-slate-400">No category data available yet.</span>
            </div>
          ) : categories.length === 1 ? (
            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{categories[0]._id}</span>
                <span className="text-[13px] text-slate-500">{categories[0].count} report{categories[0].count !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-full h-3 bg-blue-50 dark:bg-blue-900/20 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-full" />
              </div>
              <span className="text-[12px] text-slate-500 mt-1">100% of reported issues belong to this category.</span>
            </div>
          ) : (
            <div className="w-full" style={{ height: Math.max(160, categories.length * 40) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} width={90} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px', padding: '4px 8px' }}
                  />
                  <Bar dataKey="count" name="Reports" radius={[0, 4, 4, 0]} barSize={16}>
                    {categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill="#3b82f6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Current Severity */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[13px] font-bold tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400" /> Severity Distribution
          </h2>
          
          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="w-full h-[150px] bg-slate-50 dark:bg-muted/30 rounded-xl animate-pulse" />
            ) : severities.length === 0 ? (
              <div className="flex-1 bg-slate-50/50 dark:bg-muted/20 rounded-xl border border-dashed border-slate-200 dark:border-border p-6 flex items-center justify-center text-center min-h-[150px]">
                <span className="text-[14px] text-slate-500 dark:text-slate-400">No severity data available yet.</span>
              </div>
            ) : severities.length <= 2 || overview.totalReports <= 3 ? (
              <div className="space-y-4">
                {severities.map((s: any) => {
                  const colorMap: Record<string, string> = {
                    low: 'bg-emerald-500', 
                    medium: 'bg-blue-500', 
                    high: 'bg-amber-500', 
                    critical: 'bg-rose-500' 
                  };
                  const percent = Math.round((s.count / overview.totalReports) * 100) || 100;
                  return (
                    <div key={s._id} className="space-y-2">
                      <div className="flex justify-between text-[13px] font-medium text-slate-700 dark:text-slate-300">
                        <span className="capitalize">{s._id}</span>
                        <span>{s.count}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colorMap[s._id.toLowerCase()] || 'bg-slate-400'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[200px] w-full flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={severities}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="count"
                      stroke="none"
                    >
                      {severities.map((entry: any, index: number) => {
                        const colorMap: Record<string, string> = {
                          low: '#10b981', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444'
                        };
                        return <Cell key={`cell-${index}`} fill={colorMap[entry._id.toLowerCase()] || '#94a3b8'} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '13px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 flex flex-col gap-3 justify-center pl-4 border-l border-slate-100 dark:border-border/50">
                  {severities.map((s: any) => {
                     const colorMap: Record<string, string> = {
                      low: 'bg-emerald-500', medium: 'bg-blue-500', high: 'bg-amber-500', critical: 'bg-rose-500' 
                    };
                    return (
                      <div key={s._id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colorMap[s._id.toLowerCase()] || 'bg-slate-400'}`} />
                        <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300 capitalize truncate">{s._id}</span>
                        <span className="text-[13px] text-slate-400 ml-auto">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Department Activity */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[13px] font-bold tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" /> Departments
          </h2>
          
          {isLoading ? (
            <div className="w-full h-[150px] bg-slate-50 dark:bg-muted/30 rounded-xl animate-pulse" />
          ) : depts.length === 0 ? (
            <div className="flex-1 bg-slate-50/50 dark:bg-muted/20 rounded-xl border border-dashed border-slate-200 dark:border-border p-6 flex flex-col items-center justify-center text-center min-h-[150px]">
              <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-300 mb-1">No department activity data yet.</span>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-[250px]">
                Department-level insights will appear as reports move through the resolution process.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto -mx-2 px-2">
              <div className="space-y-4">
                {depts.slice(0, 5).map((d: any) => (
                  <div key={d.name} className="flex items-center justify-between border-b border-slate-100 dark:border-border/50 last:border-0 pb-3 last:pb-0">
                    <div>
                      <h3 className="text-[14px] font-medium text-slate-900 dark:text-slate-100 mb-0.5">{d.name}</h3>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">
                        {d.total} report{d.total !== 1 ? 's' : ''} · {d.resolved} resolved
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                        {d.resolutionRate}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden inline-block">
                        <div 
                          className={`h-full rounded-full ${d.resolutionRate >= 80 ? 'bg-emerald-500' : d.resolutionRate >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                          style={{ width: `${d.resolutionRate}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
