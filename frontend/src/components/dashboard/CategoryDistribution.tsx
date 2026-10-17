import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  issues: any[];
}

export function CategoryDistribution({ issues }: Props) {
  const hasData = issues.length > 0;
  
  // Calculate distribution
  const categoryCounts = issues.reduce((acc: any, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(categoryCounts)
    .map(([name, count]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      count 
    }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5); // Top 5 categories

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="h-full flex flex-col">
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 flex flex-col h-full group">
        
        <div className="mb-8">
          <h2 className="text-[13px] font-bold tracking-[0.1em] text-slate-900 dark:text-foreground uppercase mb-1">
            By Category
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-muted-foreground">
            Top reported civic issues
          </p>
        </div>

        <div className="flex-1 min-h-[240px] relative">
          {!hasData ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-transparent rounded-lg border border-dashed border-slate-200 dark:border-transparent">
              <p className="font-medium text-slate-900 dark:text-foreground mb-1">No category data</p>
              <p className="text-[13px] text-slate-500 dark:text-muted-foreground max-w-[200px]">
                Category distribution will appear as reports are submitted.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '13px' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: number) => [`${value} reports`]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
