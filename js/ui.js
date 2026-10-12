// Bootcamp Connect prototype: tab navigation, feed actions, toast
// Plain script (shared globals); load order is set in index.html.

// ---------- App ----------
// 'person' is someone else's profile page (spec 15): not a tab of its own, so no tab button lights up
let currentTab = 'feed';
function switchTab(tabName) {
  currentTab = tabName;
  ['feed', 'matching', 'chat', 'profile', 'person'].forEach(tab => {
    document.getElementById('tab-' + tab).classList.toggle('hidden', tab !== tabName);
  });
  document.querySelectorAll('[data-tab]').forEach(btn => {
    const on = btn.dataset.tab === tabName;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on);
  });
  // Messages fits the window: the page doesn't scroll, the list and thread scroll inside
  $('app-main').classList.toggle('chat-mode', tabName === 'chat');
  if (tabName === 'chat') { window.scrollTo(0, 0); fitChatShell(); ensureChatSelection(); }
  if (tabName === 'matching') renderMatchmaker();
  if (tabName === 'feed') { renderFeed(); renderFeedSidebar(); }
  // Only the page on screen is drawn, so the two profile pages never repeat each other's ids
  if (tabName === 'person') renderPersonPage(); else $('person-page').innerHTML = '';
  if (tabName === 'profile') renderProfileTab(); else $('profile-page').innerHTML = '';
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

// Size the Messages panel to the space left between the page title and the bottom of the window
// (above the floating tab bar on phones), so the page itself never scrolls.
function fitChatShell() {
  const shell = $('chat-shell');
  if (!shell || $('tab-chat').classList.contains('hidden')) return;
  const phone = window.matchMedia('(max-width: 767px)').matches;
  if (phone && shell.classList.contains('thread-open')) { shell.style.height = ''; return; }
  const tabBar = document.querySelector('.tab-bar');
  const bottomGap = phone && tabBar ? window.innerHeight - tabBar.getBoundingClientRect().top + 12 : 24;
  const top = shell.getBoundingClientRect().top + window.scrollY;
  shell.style.height = Math.max(300, window.innerHeight - top - bottomGap) + 'px';
  $('app-main').style.setProperty('--chat-gap', bottomGap + 'px');
}
window.addEventListener('resize', fitChatShell);
