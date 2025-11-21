import { useState, useEffect, useRef } from 'react';
import { authApi, handleApiError } from '../../services/api-client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const COLD_START_TIMEOUT = 90;

interface LoginFormProps {
  onSuccess?: () => void;
}

function ColdStartLoader({ secondsRemaining }: { secondsRemaining: number }) {
  const progress = ((COLD_START_TIMEOUT - secondsRemaining) / COLD_START_TIMEOUT) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Waking up server...
        </h3>

        <div className="text-3xl font-mono font-bold text-blue-600 mb-3">
          {secondsRemaining}s
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-600">
          This app runs on a <span className="font-medium">free tier</span> server that sleeps after 15 minutes of inactivity.
          It typically wakes up in 30-60 seconds.
        </p>

        <p className="text-xs text-gray-400 mt-2">
          Thank you for your patience!
        </p>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(COLD_START_TIMEOUT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setSecondsRemaining(COLD_START_TIMEOUT);
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response.token, response.user);
      toast.success(`Welcome back, ${response.user.name}!`);
      onSuccess?.();
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <ColdStartLoader secondsRemaining={secondsRemaining} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="you@example.com"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="••••••••"
          disabled={isLoading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
      </form>
    </>
  );
}

export default LoginForm;
