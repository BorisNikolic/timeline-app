import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-festival-cream">
      {/* Header - Inspired by Pyramid Festival's clean navigation */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-3xl font-bold text-primary-500">🎪</span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-festival-navy to-primary-600 bg-clip-text text-transparent">
                  Festival Timeline
                </h1>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-sm text-gray-600">Welcome, {user.name}</span>
                <button
                  onClick={logout}
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
    </div>
  );
}

export default Layout;
