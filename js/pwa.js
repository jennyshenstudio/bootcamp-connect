// Bootcamp Connect: installable web app (D028). Plain script; loads last.
// Registers the service worker on the built site only (dist/, where index.html has data-build).
// It is skipped for file:// pages, the local source copy, and the claude.ai artifact.

(function registerServiceWorker() {
  const built = document.documentElement.hasAttribute('data-build');
  if (!built || !('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Offline support is a bonus: the app works the same without it
    });
  });
})();
