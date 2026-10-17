import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/Toaster';
import { useIssues } from '@/hooks/useIssues';
import { Issue } from '@/types';
import { 
  LogOut, 
  MapPin, 
  Mail, 
  Phone, 
  User as UserIcon, 
  CheckCircle2, 
  Sun, 
  Moon
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, updateUser, theme, setTheme, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    address: user?.address || '', 
    ward: user?.ward || '' 
  });

  const { data: issuesData, isLoading: isLoadingIssues, isError: isErrorIssues } = useIssues({ reportedBy: user?._id, limit: 100 });
  const allReports = issuesData?.data || [];

  const { total, active, resolved } = useMemo(() => {
    let active = 0, resolved = 0;
    allReports.forEach((r: Issue) => {
      const s = r.status.toLowerCase();
      if (s === 'resolved' || s === 'closed') resolved++;
      else if (s !== 'pending') active++;
    });
    return { total: allReports.length, active, resolved };
  }, [allReports]);

  const updateMut = useMutation({
    mutationFn: (data: typeof form) => api.patch('/auth/profile', data).then(r => r.data),
    onSuccess: (data) => {
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated', 'Your account information has been saved.');
    },
    onError: () => toast.error('Failed to update profile', 'Please try again later.'),
  });

  const handleSave = () => {
    // Only save if there are changes
    const hasChanges = 
      form.name !== user?.name || 
      form.phone !== user?.phone || 
      form.address !== user?.address || 
      form.ward !== user?.ward;
      
    if (hasChanges) {
      updateMut.mutate(form);
    } else {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setForm({ 
      name: user?.name || '', 
      phone: user?.phone || '', 
      address: user?.address || '', 
      ward: user?.ward || '' 
    });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-[80vh] font-sans text-foreground">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-tight">
          Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">
          Manage your account and CivicPulse preferences.
        </p>
      </div>

      {/* Identity Profile */}
      <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-6 sm:p-8 shadow-sm flex items-center gap-6 mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight uppercase">
            {user.name?.charAt(0) || 'U'}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[22px] sm:text-[24px] font-bold tracking-tight">{user.name}</h2>
            {user.isVerified && (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
          </div>
          <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 capitalize mb-1">
            {user.role} Account
          </p>
          <p className="text-[13px] text-slate-400 dark:text-slate-500">
            Member since {format(new Date(user.createdAt || Date.now()), 'yyyy')}
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase">Account Information</h2>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit profile
            </button>
          )}
        </div>
        
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl shadow-sm overflow-hidden">
          {!editing ? (
            <div className="divide-y divide-slate-100 dark:divide-border/50">
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="w-32 text-[13px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><UserIcon className="w-4 h-4" /> Name</span>
                <span className="text-[15px] font-medium">{user.name}</span>
              </div>
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="w-32 text-[13px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                <span className="text-[15px]">{user.email}</span>
              </div>
              {user.phone && (
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-32 text-[13px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</span>
                  <span className="text-[15px]">{user.phone}</span>
                </div>
              )}
              {(user.address || user.ward) && (
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="w-32 text-[13px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                  <span className="text-[15px]">
                    {[user.address, user.ward ? `Ward ${user.ward}` : ''].filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-muted/10">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-1.5 opacity-60">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  Email <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Read only</span>
                </label>
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-muted/50 text-[15px] cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Phone number</label>
                <input 
                  type="tel" 
                  value={form.phone} 
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Address / City</label>
                  <input 
                    type="text" 
                    value={form.address} 
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Ward Number</label>
                  <input 
                    type="text" 
                    value={form.ward} 
                    onChange={(e) => setForm(f => ({ ...f, ward: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. Ward 42"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-lg font-medium text-[14px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={updateMut.isPending}
                  className="px-6 py-2.5 rounded-lg font-medium text-[14px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMut.isPending ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Civic Activity */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Civic Activity</h2>
        
        {isErrorIssues ? (
           <div className="bg-rose-50/50 dark:bg-rose-500/5 border border-dashed border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 text-center shadow-sm">
             <p className="text-[13px] text-rose-500 dark:text-rose-400">Couldn't load civic activity.</p>
           </div>
        ) : isLoadingIssues ? (
          <div className="grid grid-cols-3 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between h-[104px] sm:h-[120px]">
                <div className="h-4 bg-slate-100 dark:bg-muted/50 rounded w-1/2 mb-2 sm:mb-4" />
                <div className="h-8 sm:h-10 bg-slate-100 dark:bg-muted/50 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mb-2 sm:mb-4">Reports submitted</span>
              <span className="text-[24px] sm:text-[32px] font-bold text-slate-900 dark:text-slate-100 leading-none">
                {total}
              </span>
            </div>
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mb-2 sm:mb-4">Active reports</span>
              <span className="text-[24px] sm:text-[32px] font-bold text-blue-600 dark:text-blue-500 leading-none">
                {active}
              </span>
            </div>
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mb-2 sm:mb-4">Resolved</span>
              <span className="text-[24px] sm:text-[32px] font-bold text-emerald-600 dark:text-emerald-500 leading-none">
                {resolved}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="mb-12">
        <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Preferences</h2>
        
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl shadow-sm overflow-hidden">
          
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-medium text-slate-900 dark:text-slate-100">Appearance</p>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Customize the CivicPulse interface theme.</p>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-muted p-1 rounded-lg">
              <button 
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-card shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-card shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Account Actions */}
      <div className="pt-8 border-t border-slate-200 dark:border-border">
        <h2 className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-4">Account</h2>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-[14px] font-medium text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 px-5 py-2.5 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

    </div>
  );
}
