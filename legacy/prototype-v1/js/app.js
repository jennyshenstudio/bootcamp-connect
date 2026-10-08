// Archived v1 prototype script (moved out of its inline <script>, D027).
// Buttons use data attributes instead of inline onclick handlers.

function switchTab(tabId) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  // Remove active state from nav buttons
  document.querySelectorAll('.segmented-btn').forEach(btn => btn.classList.remove('active'));

  // Show target tab
  document.getElementById('tab-' + tabId).classList.remove('hidden');
  // Highlight nav button
  document.getElementById('nav-' + tabId).classList.add('active');
}

function handleConnect(btn) {
  btn.innerText = "✓ Request Sent";
  btn.classList.remove('btn-apple-primary');
  btn.classList.add('bg-slate-200', 'text-slate-700', 'cursor-default');
}

function openPostModal() {
  alert("Modal Trigger: In the full app, this opens the project posting form!");
}

document.addEventListener('click', event => {
  const btn = event.target.closest('[data-tab], [data-action]');
  if (!btn) return;
  if (btn.dataset.tab) switchTab(btn.dataset.tab);
  else if (btn.dataset.action === 'post') openPostModal();
  else if (btn.dataset.action === 'connect') handleConnect(btn);
});
