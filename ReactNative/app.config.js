/**
 * Dynamic Expo config.
 *
 * The entire app configuration still lives in app.json — this file only layers
 * on the web hosting base path, and ONLY when EXPO_WEB_BASE is set. That env var
 * is passed exclusively during the web export (see `npm run export:web`), so
 * native builds and `expo start` never see it: iOS / Android are byte-for-byte
 * unaffected by the web deployment path.
 *
 * Web deploy under a subpath (e.g. www.pyramidfestival.com/app):
 *   EXPO_WEB_BASE=/app npx expo export --platform web
 */
module.exports = ({ config }) => {
  const base = process.env.EXPO_WEB_BASE;
  if (base) {
    config.experiments = { ...(config.experiments || {}), baseUrl: base };
  }
  return config;
};
