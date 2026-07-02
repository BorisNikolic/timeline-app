/**
 * useCountdown — ticks every second toward a target epoch (ms).
 * Returns { d, h, m, s, live }. `live` is true once the target is reached.
 */
import { useState, useEffect } from 'react';

export function useCountdown(targetMs) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let diff = Math.max(0, (targetMs || 0) - now);
  const d = Math.floor(diff / 864e5); diff -= d * 864e5;
  const h = Math.floor(diff / 36e5); diff -= h * 36e5;
  const m = Math.floor(diff / 6e4); diff -= m * 6e4;
  const s = Math.floor(diff / 1e3);
  return { d, h, m, s, live: !!targetMs && targetMs <= now };
}

export default useCountdown;
