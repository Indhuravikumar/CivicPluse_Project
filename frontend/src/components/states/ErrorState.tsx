import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "CivicPulse couldn't display this information correctly.", 
  onRetry,
  isRetrying = false 
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-card border border-rose-100 dark:border-rose-900/30 rounded-2xl w-full h-full min-h-[300px]"
    >
      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-500 dark:text-rose-400" />
      </div>
      <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-[320px] mb-6 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Try again'}
        </button>
      )}
    </motion.div>
  );
}
