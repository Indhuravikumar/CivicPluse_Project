import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/ui/Toaster';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        useAuthStore.getState().logout();
        toast.error('Session Expired', 'Please sign in again.');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Permission Denied', "You don't have permission to perform this action.");
    } else if (error.response?.status === 404) {
      toast.error('Not Found', "The requested resource was not found.");
    } else if (error.response?.status >= 500) {
      toast.error('Server Error', "An unexpected error occurred.");
    } else if (!error.response) {
      toast.error('Network Error', "Please check your internet connection.");
    }
    return Promise.reject(error);
  }
);

export default api;
