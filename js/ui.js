// Bootcamp Connect prototype: tab navigation, feed actions, toast
// Plain script (shared globals); load order is set in prototype.html.

// ---------- App ----------
function switchTab(tabName) {
  ['feed', 'matching', 'chat', 'profile'].forEach(tab => {
    document.getElementById('tab-' + tab).classList.toggle('hidden', tab !== tabName);
  });
  document.querySelectorAll('[data-tab]').forEach(btn => {
    const on = btn.dataset.tab === tabName;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on);
  });
  if (tabName === 'chat') ensureChatSelection();
  if (tabName === 'matching') renderMatchmaker();
  if (tabName === 'feed') { renderFeed(); renderFeedSidebar(); }
}

function upvotePost(btn) {
  let countEl = btn.querySelector('.upvote-count');
  countEl.innerText = parseInt(countEl.innerText) + 1;
  btn.classList.add('bg-appleOrange/15', 'text-orangeText');
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}
