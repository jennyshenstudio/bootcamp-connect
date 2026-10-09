// Bootcamp Connect: the live site's backend (specs/09-real-accounts.md, D032).
// The only file that will talk to Supabase. Without its settings, the app runs as the demo.
// Plain script (shared globals); load order is set in index.html.

// Supplied by the live build (D032). Absent in the demo, the artifact and `npm start`.
const BACKEND_SETTINGS = window.BC_BACKEND || null;

function isLiveSite() {
  return Boolean(BACKEND_SETTINGS && BACKEND_SETTINGS.url && BACKEND_SETTINGS.key);
}
