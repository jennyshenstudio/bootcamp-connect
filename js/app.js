// Bootcamp Connect prototype: start-up wiring (runs after every other script)
// Plain script (shared globals); load order is set in prototype.html.

// Drag and drop onto the import area
(function wireDrop() {
  const drop = $('import-drop');
  ['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('border-appleBlue', 'bg-appleBlue/5'); }));
  ['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('border-appleBlue', 'bg-appleBlue/5'); }));
  drop.addEventListener('drop', e => handleImportFile(e.dataTransfer.files[0]));
})();

// Static chip groups, then live preview wiring
renderChips('pf-setting', 'pf-setting', 'radio', SETTINGS);
renderChips('pf-goals', 'pf-goals', 'checkbox', GOALS);
renderChips('pf-hours', 'pf-hours', 'radio', HOURS);
renderChips('pf-idea', 'pf-idea', 'radio', IDEA_STATUS);
renderChips('pf-industries', 'pf-industries', 'checkbox', INDUSTRIES);
renderChips('pf-open', 'pf-open', 'checkbox', Object.keys(PAY_TYPES), Object.values(PAY_TYPES).map(t => t.label));

$('profile-form').addEventListener('input', e => {
  const t = e.target;
  t.classList.remove('invalid');
  if (t.id && $(t.id + '-error')) clearError(t.id);
  if (t.id === 'pf-first' || t.id === 'pf-last') updatePhotoUI();
  updateCounters();
  updatePreview();
});
$('profile-form').addEventListener('change', updatePreview);

document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('sheet').classList.contains('hidden')) closeSheet(); });

// Restore an existing session in this browser
(function init() {
  setAuthMode('signup');
  const email = load(SESSION_KEY, '');
  const account = email && getAccounts()[email];
  if (account) enterDashboard(account, { animate: false });
})();
