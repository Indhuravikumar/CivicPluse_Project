import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, MapPin, Plus, Building2,
  BarChart3, Users, X, Zap, LogOut, User, ClipboardList, Settings as SettingsIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['citizen', 'officer', 'admin'] },
  { to: '/report', icon: Plus, label: 'Report Issue', roles: ['citizen'] },
  { to: '/my-reports', icon: ClipboardList, label: 'My Reports', roles: ['citizen'] },
  { to: '/issues', icon: AlertTriangle, label: 'Issues', roles: ['officer', 'admin'] },
  { to: '/departments', icon: Building2, label: 'Departments', roles: ['officer', 'admin'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin'] },
  { to: '/users', icon: Users, label: 'Users', roles: ['admin'] },
  { to: '/profile', icon: User, label: 'Profile', roles: ['citizen', 'officer', 'admin'] },
];

interface Props { open: boolean; onClose: () => void; }

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">CivicPulse</p>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">AI Platform</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <div className="bg-primary/10 rounded-lg px-3 py-2">
          <p className="text-xs font-medium text-primary capitalize">{user?.role} Account</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems
          .filter(item => item.roles.includes(user?.role || 'citizen'))
          .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent font-medium'
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border flex flex-col gap-1">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
              isActive
                ? 'bg-primary/10 text-primary dark:bg-primary/20 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent font-medium'
            )
          }
        >
          <SettingsIcon className="w-4 h-4 flex-shrink-0" />
          Settings
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 border-r border-border bg-card flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-60 bg-card border-r border-border lg:hidden"
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
