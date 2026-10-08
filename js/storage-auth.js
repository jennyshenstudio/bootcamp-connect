// Bootcamp Connect prototype: storage and authentication (specs/01-auth.md)
// Plain script (shared globals); load order is set in index.html.

// ---------- Local prototype storage (this browser only) ----------
const ACCOUNTS_KEY = 'bc_accounts';
const SESSION_KEY = 'bc_session';

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function remove(key) {
  try { localStorage.removeItem(key); } catch {}
}

// Passwords are never stored; only profile details
function getAccounts() { return load(ACCOUNTS_KEY, {}); }
function saveAccount(account) {
  const accounts = getAccounts();
  accounts[account.email] = account;
  return save(ACCOUNTS_KEY, accounts);
}

// ---------- Auth (specs/01-auth.md) ----------
let authMode = 'signup';

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === 'signup';
  document.getElementById('mode-signup').classList.toggle('active', isSignup);
  document.getElementById('mode-signup').classList.toggle('text-label-2', !isSignup);
  document.getElementById('mode-login').classList.toggle('active', !isSignup);
  document.getElementById('mode-login').classList.toggle('text-label-2', isSignup);
  document.querySelectorAll('[data-signup-only]').forEach(el => el.classList.toggle('hidden', !isSignup));
  document.querySelectorAll('[data-login-only]').forEach(el => el.classList.toggle('hidden', isSignup));
  document.getElementById('auth-title').textContent = isSignup ? 'Create your account' : 'Welcome back';
  document.getElementById('auth-subtitle').textContent = isSignup
    ? 'Join to collaborate on projects, find co-founders, and share ideas.'
    : 'Log in to pick up where you left off.';
  document.getElementById('divider-text').textContent = isSignup ? 'or sign up with email' : 'or log in with email';
  document.getElementById('auth-submit').textContent = isSignup ? 'Create account & enter dashboard →' : 'Log in →';
  const pw = document.getElementById('password');
  pw.autocomplete = isSignup ? 'new-password' : 'current-password';
  pw.placeholder = isSignup ? 'At least 8 characters' : 'Your password';
  document.getElementById('first-name').required = isSignup;
  document.getElementById('last-name').required = isSignup;
  document.getElementById('forgot-note').classList.add('hidden');
  hideFormError();
  clearError('track');
  clearError('terms');
}

function getSelectedTrack() {
  const checked = document.querySelector('input[name="track"]:checked');
  return checked ? checked.value : null;
}

function showError(field) { document.getElementById(field + '-error').classList.remove('hidden'); }
function clearError(field) { document.getElementById(field + '-error').classList.add('hidden'); }

function showFormError(html) {
  const el = document.getElementById('auth-error');
  el.innerHTML = html;
  el.classList.remove('hidden');
}
function hideFormError() { document.getElementById('auth-error').classList.add('hidden'); }

function showForgot() { document.getElementById('forgot-note').classList.remove('hidden'); }

// Track + Terms are required for any sign-up (Google or email)
function validateTrackAndTerms() {
  let ok = true;
  if (!getSelectedTrack()) { showError('track'); ok = false; }
  if (!document.getElementById('terms').checked) { showError('terms'); ok = false; }
  if (!ok) {
    const firstError = document.querySelector('#auth-form p[id$="-error"]:not(.hidden)');
    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return ok;
}

function handleGoogle() {
  // Prototype: simulates a successful Google OAuth round-trip
  hideFormError();
  const googleAccount = Object.values(getAccounts()).find(a => a.provider === 'google');

  if (authMode === 'login') {
    if (googleAccount) return enterDashboard(googleAccount);
    showFormError('No Google account is linked yet. <button type="button" class="underline font-semibold" data-on-click="setAuthMode(\'signup\')">Sign up</button>, pick your track, then choose Continue with Google.');
    return;
  }

  if (!validateTrackAndTerms()) return;
  const first = document.getElementById('first-name').value.trim() || 'Google';
  const last = document.getElementById('last-name').value.trim() || 'User';
  const account = { email: 'google-user@gmail.com', first, last, track: getSelectedTrack(), provider: 'google' };
  saveAccount(account);
  enterDashboard(account, { isNew: true });
}

function handleAuthSubmit(e) {
  e.preventDefault();
  hideFormError();
  const form = e.target;
  const email = document.getElementById('email').value.trim().toLowerCase();

  if (authMode === 'login') {
    if (!form.reportValidity()) return;
    const account = getAccounts()[email];
    if (!account) {
      showFormError('No account found for <strong>' + escapeHtml(email) + '</strong>. Check the spelling or <button type="button" class="underline font-semibold" data-on-click="setAuthMode(\'signup\')">create an account</button>.');
      return;
    }
    return enterDashboard(account);
  }

  const trackAndTermsOk = validateTrackAndTerms();
  if (!form.reportValidity() || !trackAndTermsOk) return;
  if (getAccounts()[email]) {
    showFormError('An account with this email already exists. <button type="button" class="underline font-semibold" data-on-click="setAuthMode(\'login\')">Log in instead</button>.');
    return;
  }
  const account = {
    email,
    first: document.getElementById('first-name').value.trim(),
    last: document.getElementById('last-name').value.trim(),
    track: getSelectedTrack(),
    provider: 'email',
  };
  saveAccount(account);
  enterDashboard(account, { isNew: true });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderUser(account) {
  const pill = document.getElementById('user-pill');
  const base = 'hidden lg:block text-footnote px-3 py-1 rounded-full font-semibold ';
  if (account.track === 'Business Developer') {
    pill.className = base + 'bg-applePurple/15 text-purpleText';
    pill.textContent = 'Business Dev Track';
  } else {
    pill.className = base + 'bg-appleBlue/10 text-blueText';
    pill.textContent = 'Software Dev Track';
  }
  const avatar = document.getElementById('user-avatar');
  setAvatar(avatar, account.profile && account.profile.photo, initials(account.first, account.last));
  avatar.title = account.first + ' ' + account.last + ' · ' + account.email;
}

function enterDashboard(account, { animate = true, isNew = false } = {}) {
  save(SESSION_KEY, account.email);
  document.getElementById('toast').classList.add('hidden');
  renderUser(account);
  loadProfileForm(account);
  initDemo();
  document.getElementById('profile-banner').classList.toggle('hidden', !isNew);
  switchTab(isNew ? 'profile' : 'feed');

  const auth = document.getElementById('auth-screen');
  const dashboard = document.getElementById('app-dashboard');
  if (!animate) {
    auth.classList.add('hidden');
    dashboard.classList.remove('hidden', 'opacity-0');
    return;
  }
  auth.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    auth.classList.add('hidden');
    dashboard.classList.remove('hidden');
    window.scrollTo(0, 0);
    requestAnimationFrame(() => requestAnimationFrame(() => dashboard.classList.remove('opacity-0')));
  }, 300);
}

function logout() {
  closeSheet();
  demo = null;
  const email = load(SESSION_KEY, '');
  remove(SESSION_KEY);

  const auth = document.getElementById('auth-screen');
  const dashboard = document.getElementById('app-dashboard');
  dashboard.classList.add('opacity-0');
  setTimeout(() => {
    dashboard.classList.add('hidden');
    document.getElementById('auth-form').reset();
    setAuthMode('login');
    if (email && !email.startsWith('google-user')) document.getElementById('email').value = email;
    auth.classList.remove('hidden');
    window.scrollTo(0, 0);
    requestAnimationFrame(() => requestAnimationFrame(() => auth.classList.remove('opacity-0', 'pointer-events-none')));
    showToast("You've been logged out.");
  }, 300);
}
