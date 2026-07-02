/**
 * Silence Expo Go's SDK-53 "remote push removed" notice from expo-notifications.
 *
 * expo-notifications logs this via console.error, so LogBox promotes it to a
 * blocking red overlay in dev. It's irrelevant to us — we only use LOCAL
 * (scheduled) notifications, which work in Expo Go; the message is purely about
 * *remote* push. Imported first in index.js (before expo-notifications is
 * evaluated) so the filters are installed before the message fires.
 */
import { LogBox } from 'react-native';

const NOISE = [
  /expo-notifications: Android Push notifications/,
  /Android Push notifications \(remote notifications\)/,
  /expo-notifications.*not fully supported in Expo Go/,
];

LogBox.ignoreLogs(NOISE);

// LogBox.ignoreLogs doesn't reliably suppress console.error-level logs, and
// expo-notifications emits the notice via console.error — so drop just those
// lines at the source. Dev-only: the message never fires in a production build,
// and this leaves all other console output untouched.
if (__DEV__) {
  const isNoise = (a) => typeof a === 'string' && NOISE.some((re) => re.test(a));
  for (const level of ['error', 'warn']) {
    const original = console[level];
    console[level] = (...args) => { if (!isNoise(args[0])) original(...args); };
  }
}
