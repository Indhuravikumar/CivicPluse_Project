import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  theme: 'light' | 'dark';
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      theme: 'light',
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      updateUser: (updates) => set(s => ({ user: s.user ? { ...s.user, ...updates } : null })),
    }),
    { name: 'civicpulse-auth', partialize: s => ({ user: s.user, token: s.token, theme: s.theme }) }
  )
);
