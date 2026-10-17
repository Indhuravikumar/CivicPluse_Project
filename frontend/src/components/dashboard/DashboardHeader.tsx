import { User } from '@/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface Props { user: User | null; }

export function DashboardHeader({ user }: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Citizen';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2"
    >
      <div>
        <h1 className="text-[32px] sm:text-[34px] font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight flex items-center gap-2">
          {greeting}, {firstName} <span className="animate-wave origin-bottom-right">👋</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px] sm:text-[16px]">
          Here's what's happening in your city today.
        </p>
      </div>
      {user?.role === 'citizen' && (
        <Link to="/report">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all rounded-lg px-6 font-medium h-11">
            <Plus className="w-4 h-4 mr-2" />
            Report an issue
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
