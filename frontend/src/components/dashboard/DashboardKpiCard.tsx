import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: string;
  colorClass: string;
  iconBgClass: string;
  delay?: number;
}

export function DashboardKpiCard({ title, value, description, icon: Icon, trend, colorClass, iconBgClass, delay = 0 }: KpiCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="bg-white dark:bg-card rounded-xl border border-slate-200/80 dark:border-border shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all p-5 h-full flex flex-col group">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[13px] font-semibold text-slate-600 dark:text-muted-foreground">{title}</h3>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgClass} transition-transform group-hover:scale-110`}>
            <Icon className={`w-4 h-4 ${colorClass}`} />
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-slate-50 leading-none">
              {value}
            </span>
            {trend && (
              <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {trend}
              </span>
            )}
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1.5">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
