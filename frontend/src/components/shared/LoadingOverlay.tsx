import { useState, useEffect, useRef } from 'react';

const COLD_START_TIMEOUT = 90;
const SHOW_MESSAGE_AFTER = 3; // Show cold start message after 3 seconds

interface LoadingOverlayProps {
  isLoading: boolean;
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
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

  if (!isLoading) return null;

  const showColdStartMessage = elapsedSeconds >= SHOW_MESSAGE_AFTER;
  const secondsRemaining = Math.max(0, COLD_START_TIMEOUT - elapsedSeconds);
  const progress = (elapsedSeconds / COLD_START_TIMEOUT) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>

        {!showColdStartMessage ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Waking up server...
            </h3>

            <div className="text-3xl font-mono font-bold text-blue-600 mb-3">
              {secondsRemaining}s
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>

            <p className="text-sm text-gray-600">
              This app runs on a <span className="font-medium">free tier</span> server
              that sleeps after 15 minutes of inactivity.
              It typically wakes up in 30-60 seconds.
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Thank you for your patience!
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default LoadingOverlay;
