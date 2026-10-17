import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props { onMenuClick: () => void; }

export default function Topbar({ onMenuClick }: Props) {
  const { user, toggleTheme, theme } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 30000,
  });

  const unread = notifData?.unreadCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/issues?search=${encodeURIComponent(search)}`);
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-3 flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-md hover:bg-accent transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-accent transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-1.5 rounded-md hover:bg-accent transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-1.5 border-l border-border ml-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-none">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
