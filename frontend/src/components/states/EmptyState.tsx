import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl w-full h-full min-h-[300px]"
    >
      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-[320px] mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
