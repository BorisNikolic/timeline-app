import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/shared/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import TimelinePage from './pages/Timeline';
import AuthPage from './pages/Auth';

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
          <Route index element={<Navigate to="/timeline" replace />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="*" element={<Navigate to="/timeline" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
