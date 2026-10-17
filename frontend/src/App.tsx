import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './lib/api';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IssuesPage from './pages/IssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import ReportIssuePage from './pages/ReportIssuePage';
import MapPage from './pages/MapPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DepartmentDetailPage from './pages/DepartmentDetailPage';
import MyReportsPage from './pages/MyReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import { Toaster } from './components/ui/Toaster';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  const { theme, token, updateUser } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(!!token);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          updateUser(res.data.user);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, [token, updateUser]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="issues" element={<ProtectedRoute roles={['officer', 'admin']}><IssuesPage /></ProtectedRoute>} />
          <Route path="issues/:id" element={<IssueDetailPage />} />
          <Route path="report" element={<ProtectedRoute roles={['citizen']}><ReportIssuePage /></ProtectedRoute>} />
          <Route path="map" element={<ProtectedRoute roles={['admin']}><MapPage /></ProtectedRoute>} />
          <Route path="my-reports" element={<ProtectedRoute roles={['citizen']}><MyReportsPage /></ProtectedRoute>} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="departments" element={<ProtectedRoute roles={['officer', 'admin']}><DepartmentsPage /></ProtectedRoute>} />
          <Route path="departments/:id" element={<ProtectedRoute roles={['officer', 'admin']}><DepartmentDetailPage /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute roles={['admin']}><AnalyticsPage /></ProtectedRoute>} />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
