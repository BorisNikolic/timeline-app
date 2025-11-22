import { useState, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTimelineSelection } from '../../hooks/usePreferences';
import { useTimelines } from '../../hooks/useTimelines';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import TimelineSwitcher from './TimelineSwitcher';
import { getThemeColorValue, ThemeColor } from '../../constants/themeColors';

function Layout() {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const { currentTimelineId } = useTimelineSelection();
  const { data: timelines } = useTimelines(false);

  // Get current timeline's theme color for header accent (T111)
  const currentTimeline = useMemo(
    () => timelines?.find((t) => t.id === currentTimelineId),
    [timelines, currentTimelineId]
  );
  const themeColor = currentTimeline?.themeColor as ThemeColor | undefined;
  const headerAccentColor = themeColor ? getThemeColorValue(themeColor) : undefined;

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-festival-cream">
      {/* Header - Inspired by Pyramid Festival's clean navigation */}
      {/* T111: Theme color accent bar at top of header */}
      <header className="border-b border-gray-200 bg-white shadow-sm relative">
        {headerAccentColor && (
          <div
            className="absolute top-0 left-0 right-0 h-1 transition-colors duration-300"
            style={{ backgroundColor: headerAccentColor }}
          />
        )}
        <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-1">
                <span className="text-3xl font-bold text-primary-500">🎪</span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-festival-navy to-primary-600 bg-clip-text text-transparent">
                  Festival Timeline
                </h1>
              </Link>
              {/* Dashboard link */}
              <Link
                to="/dashboard"
                className={`hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              {/* Timeline Switcher */}
              <TimelineSwitcher />
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-sm text-gray-600">Welcome, {user.name}</span>
                <button
                  onClick={handleLogoutClick}
                  className="rounded-lg border-2 border-festival-coral bg-transparent px-4 py-1.5 text-sm font-semibold text-festival-coral transition-all hover:bg-festival-coral hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer - Inspired by Pyramid Festival's deep navy footer */}
      <footer className="mt-auto bg-festival-navy py-6 text-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-bold text-white">Festival Timeline</h2>
              <p className="mt-1 text-sm text-gray-300">
                Organize your festival events with ease
              </p>
            </div>
            <div className="text-center text-sm">
              &copy; {new Date().getFullYear()} Festival Timeline. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showLogoutDialog}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your events."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
}

export default Layout;
