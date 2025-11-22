import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/shared/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import TimelinePage from './pages/Timeline';
import AuthPage from './pages/Auth';
import TimelineSettingsPage from './pages/TimelineSettingsPage';
import DashboardPage from './pages/DashboardPage';
import ArchivePage from './pages/ArchivePage';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Public route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="timeline/:timelineId" element={<TimelinePage />} />
          <Route path="timeline/:timelineId/settings" element={<TimelineSettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
