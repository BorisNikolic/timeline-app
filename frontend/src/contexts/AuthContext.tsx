import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { preferencesApi, timelinesApi } from '../services/timelinesApi';
import { useTimelineStore } from '../stores/timelineStore';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setCurrentTimeline, clearCurrentTimeline } = useTimelineStore();

  /**
   * Load user's last timeline preference from backend
   * Called after successful login or on page refresh with existing session
   */
  const loadLastTimeline = useCallback(async () => {
    try {
      const preferences = await preferencesApi.get();
      if (preferences?.lastTimelineId) {
        // Verify we still have access and get the role
        const timeline = await timelinesApi.getById(preferences.lastTimelineId);
        if (timeline && timeline.userRole) {
          setCurrentTimeline(preferences.lastTimelineId, timeline.userRole);
          return;
        }
      }

      // No valid last timeline - try to get first available
      const timelines = await timelinesApi.getAll(false);
      if (timelines.length > 0) {
        const firstTimeline = timelines[0];
        setCurrentTimeline(firstTimeline.id, firstTimeline.userRole);
        // Update preference for next time
        preferencesApi.setLastTimeline(firstTimeline.id).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to load last timeline:', error);
      // Non-critical error - user can manually select a timeline
    }
  }, [setCurrentTimeline]);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Load last timeline after restoring session
        loadLastTimeline();
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, [loadLastTimeline]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    // Load last timeline after login
    loadLastTimeline();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    clearCurrentTimeline();
    // Use BASE_URL to support GitHub Pages subdirectory deployment
    const basePath = import.meta.env.BASE_URL || '/';
    window.location.href = `${basePath}auth`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
