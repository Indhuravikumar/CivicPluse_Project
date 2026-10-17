import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, CircleDashed } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/Toaster';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const { data: notifData, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const notifications: Notification[] = notifData?.data || [];
  const unreadCount = notifData?.unreadCount || 0;

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all').then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
      toast.success('All caught up', 'All notifications have been marked as read.');
    },
  });

  const filteredNotifications = useMemo(() => {
    if (filter === 'Unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      markRead.mutate(n._id);
    }
    if (n.issue?._id) {
      navigate(`/issues/${n.issue._id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
              Notifications
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">
              Stay up to date with changes to your reports.
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="flex items-center gap-2 text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/80 border border-slate-200 dark:border-border px-4 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {!isLoading && !isError && notifications.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          {(['All', 'Unread'] as const).map(f => {
            const isSelected = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-muted/50'
                }`}
              >
                {f} {f === 'Unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            );
          })}
        </div>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {isError ? (
          <ErrorState 
            title="Couldn't load notifications"
            description="Something went wrong while loading your notifications."
            onRetry={() => window.location.reload()} 
          />
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700/50 mt-2 shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState 
            icon={CheckCheck}
            title="You're all caught up."
            description="Updates about your reports will appear here when there is activity."
          />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState 
            icon={CheckCheck}
            title="You're all caught up."
            description="You don't have any unread notifications."
            action={
              <button 
                onClick={() => setFilter('All')} 
                className="px-5 py-2 text-[14px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-900 dark:text-slate-100 rounded-lg transition-colors"
              >
                View all
              </button>
            }
          />
        ) : (
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl shadow-sm overflow-hidden">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((n: Notification, index: number) => (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleNotificationClick(n)}
                  className={`
                    relative p-5 sm:p-6 flex items-start gap-4 cursor-pointer transition-colors
                    ${index !== filteredNotifications.length - 1 ? 'border-b border-slate-100 dark:border-border/50' : ''}
                    ${!n.isRead ? 'bg-blue-50/40 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-muted/50'}
                  `}
                >
                  <div className="mt-1.5 shrink-0">
                    {!n.isRead ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-500/20" />
                    ) : (
                      <CircleDashed className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-[15px] sm:text-[16px] leading-snug mb-1 transition-colors ${
                      !n.isRead 
                        ? 'font-bold text-slate-900 dark:text-slate-100' 
                        : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}>
                      {n.title}
                    </h3>
                    
                    {n.issue?.title && (
                      <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                        {n.issue.title}
                      </p>
                    )}
                    
                    <span className={`text-[12px] font-medium ${!n.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
