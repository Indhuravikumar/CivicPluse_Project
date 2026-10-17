import { useAuthStore } from '@/store/authStore';
import { Moon, Sun, Monitor, MapPin, LogOut, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toaster';

export default function SettingsPage() {
  const { theme, setTheme, user, logout } = useAuthStore();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success('Appearance updated', 'Your theme preference has been saved.');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen font-sans text-foreground">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-[15px]">
          Manage your CivicPulse experience and preferences.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Appearance Section */}
        <section>
          <div className="mb-3">
            <h2 className="text-[12px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1">Appearance</h2>
          </div>
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Theme</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">Choose how CivicPulse looks on this device.</p>
              </div>
              
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-lg shrink-0">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                    theme === 'light' 
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section>
          <div className="mb-3">
            <h2 className="text-[12px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1">Location</h2>
          </div>
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mb-1">Location Access</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  Location access is used to identify nearby civic issues on the Live Map and intelligently route your reports.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-md">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">Permissions are managed securely by your browser.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section>
          <div className="mb-3">
            <h2 className="text-[12px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1">Account & Session</h2>
          </div>
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-0.5">Signed in as</p>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{user?.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{user?.email}</p>
              </div>
              
              <div className="shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
            
            <div className="px-5 py-3 sm:px-6 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-border/50 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">
                Signing out will clear your active session. You will need to sign in again to report issues or track their progress.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
