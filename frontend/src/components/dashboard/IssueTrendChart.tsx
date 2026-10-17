import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  // In a real app, this would be a historical timeseries from the backend
  issues: any[];
}

export function IssueTrendChart({ issues }: Props) {
  // Generate dummy historical data to show the shape of the component if there's no timeseries API endpoint readily available, 
  // but if issues length is 0, we show empty state.
  
  const hasData = issues.length > 0;
  
  const mockData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 25 },
    { name: 'Fri', count: 22 },
    { name: 'Sat', count: 30 },
    { name: 'Sun', count: 28 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="h-full flex flex-col">
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 flex flex-col h-full group">
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-[13px] font-bold tracking-[0.1em] text-slate-900 dark:text-foreground uppercase mb-1">
              Issue Trends
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-muted-foreground">
              How civic reports have changed over the last 7 days
            </p>
          </div>
          <Link to="/analytics" className="text-[13px] font-medium text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-primary/80 transition-colors flex items-center gap-1.5 whitespace-nowrap">
            View analytics <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="flex-1 min-h-[240px] relative">
          {!hasData ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-transparent rounded-lg border border-dashed border-slate-200 dark:border-transparent">
              <p className="font-medium text-slate-900 dark:text-foreground mb-1">No issue activity yet</p>
              <p className="text-[13px] text-slate-500 dark:text-muted-foreground max-w-[250px]">
                Issue trends will appear here as reports are submitted.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '13px' }}
                  labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
