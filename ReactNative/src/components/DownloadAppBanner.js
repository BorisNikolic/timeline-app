/**
 * DownloadAppBanner — native (iOS / Android) no-op.
 *
 * The "get the app" banner only makes sense in a web browser, so the real
 * implementation lives in DownloadAppBanner.web.js. On native this renders
 * nothing, so the shipping iOS / Android apps are completely unaffected.
 */
export default function DownloadAppBanner() {
  return null;
}
