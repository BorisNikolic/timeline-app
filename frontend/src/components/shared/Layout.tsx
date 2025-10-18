import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-2 py-4 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Festival Timeline</h1>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user.name}</span>
                <button
                  onClick={logout}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto px-2 py-8 sm:px-4 lg:px-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-4">
        <div className="mx-auto px-2 text-center text-sm text-gray-500 sm:px-4 lg:px-6">
          &copy; {new Date().getFullYear()} Festival Timeline. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;
