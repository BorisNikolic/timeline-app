/**
 * Web PWA setup (web-only). Injects the manifest + install/iOS meta tags into
 * the auto-generated Expo index.html, then registers the offline service worker
 * and precaches the app shell so the site loads without a connection after the
 * first online visit.
 *
 * The base path is derived from the loaded JS bundle, so this works both at '/'
 * (local dev) and '/app' (production subpath) with no hardcoding.
 *
 * Native (iOS/Android) loads registerServiceWorker.js instead — a no-op.
 */

function basePath() {
  const script = document.querySelector('script[src*="/_expo/static/js/"]');
  if (script) {
    const m = (script.getAttribute('src') || '').match(/^(.*)\/_expo\//);
    if (m) return m[1] || '';
  }
  return '';
}

function injectHead(base) {
  const ensureLink = (rel, href, extra) => {
    if (document.querySelector(`link[rel="${rel}"]`)) return;
    const l = document.createElement('link');
    l.rel = rel;
    l.href = href;
    if (extra) Object.assign(l, extra);
    document.head.appendChild(l);
  };
  const ensureMeta = (name, content) => {
    if (document.querySelector(`meta[name="${name}"]`)) return;
    const m = document.createElement('meta');
    m.name = name;
    m.content = content;
    document.head.appendChild(m);
  };

  ensureLink('manifest', base + '/manifest.json');
  ensureLink('apple-touch-icon', base + '/icon-192.png');
  ensureMeta('theme-color', '#1E1E3F');
  ensureMeta('apple-mobile-web-app-capable', 'yes');
  ensureMeta('mobile-web-app-capable', 'yes');
  ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  ensureMeta('apple-mobile-web-app-title', 'Pyramid');
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const base = basePath();
  injectHead(base);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(base + '/sw.js', { scope: base + '/' })
        .then(async () => {
          // Precache the shell so even the first session works offline afterwards.
          const reg = await navigator.serviceWorker.ready;
          const target = reg.active || navigator.serviceWorker.controller;
          if (!target) return;
          const mainScript = document.querySelector('script[src*="/_expo/static/js/"]');
          const urls = [base + '/', window.location.href];
          if (mainScript && mainScript.src) urls.push(mainScript.src);
          target.postMessage({ type: 'CACHE_URLS', urls });
        })
        .catch(() => {});
    });
  }
}
