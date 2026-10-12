// Bootcamp Connect prototype: Matchmaker, profile and members sheets
// Plain script (shared globals); load order is set in index.html.

// ----- Connect › People (specs/10-networking.md) -----
const PEOPLE_PAGE = 24;
let peopleShown = PEOPLE_PAGE;
const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
const invitedBy = id => (demo.invites || []).find(i => i.from === id);

// Years of work experience, not counting the bootcamp, for the stage evidence line
function yearsOfExperience(p) {
  const months = s => { const [y, m] = s.split('-').map(Number); return y * 12 + m; };
  const now = new Date(), today = now.getFullYear() * 12 + now.getMonth() + 1;
  const total = (p.experience || []).filter(e => e.start && (e.company || '') !== 'Bootcamp Connect')
    .reduce((n, e) => n + Math.max(0, (e.current || !e.end ? today : months(e.end)) - months(e.start)), 0);
  const years = Math.floor(total / 12);
  if (years < 1) return 'under a year\'s experience';
  return years === 1 ? '1 year\'s experience' : years + ' years\' experience';
}
function stageEvidence(p) {
  const done = (p.verified || []).length;
  return [p.stage, yearsOfExperience(p), done ? plural(done, 'finished project') : '']
    .filter(Boolean).join(' · ');
}

function peopleFilters() {
  return {
    q: $('people-q').value.trim().toLowerCase(), track: $('people-track').value, stage: $('people-stage').value,
    conn: $('people-conn').value,
  };
}
function peopleMatch(p, f) {
  if (f.track && p.track !== f.track) return false;
  if (f.stage && p.stage !== f.stage) return false;
  if (f.conn === 'connected' && !demo.connected[p.id]) return false;
  if (f.conn === 'not' && demo.connected[p.id]) return false;
  if (!f.q) return true;
  const text = [fullName(p), p.headline, ...p.skills, ...companiesOf(p), ...schoolsOf(p)].join(' ').toLowerCase();
  return f.q.split(/\s+/).every(word => text.includes(word));
}
function filterPeople() { peopleShown = PEOPLE_PAGE; renderPeopleGrid(); }
function clearPeopleFilters() {
  ['people-q', 'people-track', 'people-stage', 'people-conn'].forEach(id => { $(id).value = ''; });
  filterPeople();
  $('people-q').focus();
}
function showMorePeople() {
  const first = peopleShown;
  peopleShown += PEOPLE_PAGE;
  renderPeopleGrid();
  const next = document.querySelectorAll('#people-grid article')[first];
  if (next) next.querySelector('button').focus();
}

function connectButton(p, extra) {
  if (demo.connected[p.id]) return '<button type="button" class="btn btn-secondary btn-sm ' + extra + '" data-on-click="messagePerson(\'' + p.id + '\')"><svg class="icon w-4 h-4"><use href="#i-chat"/></svg>Message</button>';
  if (demo.requested[p.id]) return '<button type="button" class="btn btn-gray btn-sm ' + extra + '" data-on-click="withdrawRequest(\'' + p.id + '\')" aria-label="Withdraw your request to ' + esc(p.first) + '">Withdraw request</button>';
  if (invitedBy(p.id)) return '<button type="button" class="btn btn-primary btn-sm ' + extra + '" data-on-click="acceptInvite(\'' + p.id + '\')"><svg class="icon w-4 h-4"><use href="#i-check"/></svg>Accept</button>';
  return '<button type="button" class="btn btn-primary btn-sm ' + extra + '" data-on-click="openConnect(\'' + p.id + '\')" aria-label="Connect with ' + esc(fullName(p)) + '"><svg class="icon w-4 h-4"><use href="#i-plus"/></svg>Connect</button>';
}
function connectionStatus(p) {
  if (demo.connected[p.id]) return '<span class="text-footnote text-greenText font-semibold inline-flex items-center gap-1"><svg class="icon w-3.5 h-3.5"><use href="#i-check"/></svg>Connected</span>';
  if (demo.requested[p.id]) return '<span class="text-footnote text-label-2 font-semibold">Request sent</span>';
  if (invitedBy(p.id)) return '<span class="text-footnote text-blueText font-semibold">Wants to connect</span>';
  return '';
}

// One member card. `reasons` is how many reasons to list (the mutual connections line is shown separately).
function personCard(p, s, reasons) {
  const listed = s.reasons.filter(r => !/mutual connection/.test(r)).slice(0, reasons);
  return '<article class="card p-5 flex flex-col gap-3" data-person="' + p.id + '">' +
    '<div class="flex items-start gap-3">' +
      '<button type="button" class="tap rounded-full" data-on-click="openPerson(\'' + p.id + '\')" aria-label="View ' + esc(fullName(p)) + '\'s profile">' + personAvatar(p, 'w-14 h-14 text-title3') + '</button>' +
      '<div class="min-w-0 flex-1">' +
        '<button type="button" class="font-semibold text-body text-left hover:underline" data-on-click="openPerson(\'' + p.id + '\')">' + esc(fullName(p)) + '</button>' +
        '<p class="text-footnote text-label-2 line-clamp-2">' + esc(p.headline) + '</p>' +
      '</div>' +
    '</div>' +
    '<div class="flex flex-wrap items-center gap-x-2 gap-y-1.5">' + trackBadge(p.track) +
      '<span class="text-footnote text-label-2">' + esc(p.stage || '') + '</span>' +
    '</div>' +
    '<p class="text-footnote text-label-2 inline-flex items-center gap-1"><svg class="icon w-3.5 h-3.5"><use href="#i-users"/></svg>' + plural(s.mutual.length, 'mutual connection') + ' · ' + esc(p.location.replace(/, UK$/, '')) + '</p>' +
    (listed.length ? '<ul class="space-y-1">' + listed.map(r => '<li class="flex items-start gap-1.5 text-footnote text-label-2"><svg class="icon w-4 h-4 text-greenText mt-px shrink-0"><use href="#i-check"/></svg>' + esc(r) + '</li>').join('') + '</ul>' : '') +
    '<div class="flex flex-wrap gap-1">' + p.skills.slice(0, 4).map(sk => '<span class="bg-fill text-label-2 text-caption px-2 py-0.5 rounded-md">' + esc(sk) + '</span>').join('') + '</div>' +
    connectionStatus(p) +
    '<div class="mt-auto pt-1 flex gap-2">' +
      '<button type="button" class="btn btn-gray btn-sm flex-1" data-on-click="openPerson(\'' + p.id + '\')">View profile</button>' +
      connectButton(p, 'flex-1') +
    '</div>' +
  '</article>';
}

function renderPeople() {
  if (!demo || !$('people-grid')) return;
  renderInvites();
  renderSuggested();
  renderPeopleGrid();
}

function renderInvites() {
  const list = (demo.invites || []).filter(i => person(i.from) && !demo.connected[i.from]);
  $('people-invites').classList.toggle('hidden', !list.length);
  $('people-invites').innerHTML = list.length ? '<h3 id="people-invites-title" class="text-title3 font-bold" tabindex="-1">Invitations (' + list.length + ')</h3>' +
    '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' + list.map(i => {
      const p = person(i.from);
      return '<article class="card p-5 flex flex-col gap-3" data-invite="' + p.id + '">' +
        '<div class="flex items-start gap-3">' +
          '<button type="button" class="tap rounded-full" data-on-click="openPerson(\'' + p.id + '\')" aria-label="View ' + esc(fullName(p)) + '\'s profile">' + personAvatar(p, 'w-12 h-12 text-subhead') + '</button>' +
          '<div class="min-w-0 flex-1">' +
            '<button type="button" class="font-semibold text-body text-left hover:underline" data-on-click="openPerson(\'' + p.id + '\')">' + esc(fullName(p)) + '</button>' +
            '<p class="text-footnote text-label-2">' + esc(p.headline) + '</p>' +
            '<p class="text-footnote text-label-2">' + esc(p.stage || '') + '</p>' +
          '</div>' +
        '</div>' +
        (i.note ? '<blockquote class="entry !p-3 text-subhead">' + esc(i.note) + '</blockquote>' : '') +
        '<div class="flex gap-2 justify-end">' +
          '<button type="button" class="btn btn-gray btn-sm" data-on-click="ignoreInvite(\'' + p.id + '\')" aria-label="Ignore invitation from ' + esc(fullName(p)) + '">Ignore</button>' +
          '<button type="button" class="btn btn-primary btn-sm" data-on-click="acceptInvite(\'' + p.id + '\')" aria-label="Accept invitation from ' + esc(fullName(p)) + '">Accept</button>' +
        '</div>' +
      '</article>';
    }).join('') + '</div>' : '';
}

function rankedPeople() {
  return DEMO_PEOPLE.map(p => ({ p, s: suggestionFor(p.id) }))
    .sort((a, b) => b.s.score - a.s.score || fullName(a.p).localeCompare(fullName(b.p)));
}

function renderSuggested() {
  const list = rankedPeople().filter(({ p }) => !demo.connected[p.id] && !demo.requested[p.id] && !invitedBy(p.id)).slice(0, 5);
  $('people-suggested').innerHTML = '<div><h3 id="people-suggested-title" class="text-title3 font-bold">Suggested for you</h3>' +
    '<p class="text-subhead text-label-2">Based on mutual connections, where people have worked and studied, and skills.</p></div>' +
    (list.length ? '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">' + list.map(({ p, s }) => personCard(p, s, 2)).join('') + '</div>'
      : '<p class="text-subhead text-label-2">You\'re connected with everyone we\'d suggest. Search all members below.</p>');
}

function renderPeopleGrid() {
  const f = peopleFilters();
  const list = rankedPeople().filter(({ p }) => peopleMatch(p, f));
  const filtered = Object.values(f).some(Boolean);
  $('people-clear').classList.toggle('hidden', !filtered);
  $('people-count').textContent = list.length ? 'Showing ' + Math.min(peopleShown, list.length) + ' of ' + plural(list.length, 'member') : 'No members found';
  $('people-grid').innerHTML = list.length ? list.slice(0, peopleShown).map(({ p, s }) => personCard(p, s, 1)).join('')
    : '<p class="text-subhead text-label-2 md:col-span-2 xl:col-span-3">No members match. Try a different search or clear the filters.</p>';
  $('people-more').classList.toggle('hidden', list.length <= peopleShown);
}

// ----- Connecting (LinkedIn model: view the profile, send a request with an optional note) -----
const NOTE_MAX = 300;
function openConnect(id) {
  const p = person(id);
  openSheet(sheetClose() +
    '<div class="p-6 sm:p-7 space-y-4">' +
      '<div class="flex items-center gap-3 pr-10">' + personAvatar(p, 'w-12 h-12 text-subhead') +
        '<div><h2 id="sheet-title" class="text-title3 font-bold">Connect with ' + esc(fullName(p)) + '</h2>' +
        '<p class="text-footnote text-label-2">' + esc(p.headline) + '</p></div></div>' +
      '<div><label for="connect-note" class="pf-label">Add a note (optional)</label>' +
        '<p id="connect-note-hint" class="pf-hint mb-1.5">Say why you\'d like to connect, for example a project you have in common.</p>' +
        '<textarea id="connect-note" rows="4" maxlength="' + NOTE_MAX + '" class="pf-input resize-y" aria-describedby="connect-note-hint connect-note-count" data-on-input="updateNoteCount()"></textarea>' +
        '<p id="connect-note-count" class="pf-hint mt-1" aria-live="polite">You have ' + NOTE_MAX + ' characters remaining</p></div>' +
      '<div class="flex gap-2 justify-end">' +
        '<button type="button" class="btn btn-gray" data-on-click="closeSheet()">Cancel</button>' +
        '<button type="button" class="btn btn-primary" data-on-click="sendRequest(\'' + id + '\')">Send request</button>' +
      '</div>' +
    '</div>', 'connect-' + id);
  $('connect-note').focus();
}
function updateNoteCount() {
  const left = NOTE_MAX - $('connect-note').value.length;
  $('connect-note-count').textContent = 'You have ' + left + ' character' + (left === 1 ? '' : 's') + ' remaining';
}

// Demo: most members accept after a moment; a few leave the request waiting. Senders are never told
// about a decline, as on LinkedIn.
const leavesWaiting = id => id.includes('-') && [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 4 === 0;

function sendRequest(id) {
  const p = person(id);
  demo.requested[id] = { note: $('connect-note').value.trim(), at: Date.now() };
  saveDemo();
  closeSheet();
  refreshPersonViews(id);
  showToast('Request sent to ' + p.first);
  if (leavesWaiting(id)) return;
  setTimeout(() => {
    if (!demo.requested[id]) return;
    delete demo.requested[id];
    demo.connected[id] = true;
    saveDemo();
    refreshPersonViews(id);
    showToast(p.first + ' accepted your connection request');
  }, 1500);
}
function withdrawRequest(id) {
  delete demo.requested[id];
  saveDemo();
  refreshPersonViews(id);
  showToast('Request to ' + person(id).first + ' withdrawn');
}
function acceptInvite(id) {
  demo.invites = demo.invites.filter(i => i.from !== id);
  demo.connected[id] = true;
  saveDemo();
  refreshPersonViews(id);
  showToast('You\'re now connected with ' + person(id).first);
}
function ignoreInvite(id) {
  demo.invites = demo.invites.filter(i => i.from !== id);
  saveDemo();
  refreshPersonViews(id);
  showToast('Invitation ignored');
}

// Re-render after a change, keeping keyboard focus on the same member's card where possible
function refreshPersonViews(id) {
  const hadFocus = document.activeElement && document.activeElement.closest && document.activeElement.closest('#people-view');
  renderPeople();
  if (currentTab === 'person' && $('person-page').dataset.person === id) refreshProfilePages();
  if (!hadFocus) return;
  const card = document.querySelector('#people-view [data-invite="' + id + '"], #people-grid [data-person="' + id + '"], #people-suggested [data-person="' + id + '"]');
  const target = card ? card.querySelector('.mt-auto button:last-child, .justify-end button:last-child') : ($('people-invites-title') || $('people-suggested-title'));
  if (target) { if (!target.matches('button')) target.setAttribute('tabindex', '-1'); target.focus(); }
}

// ----- Sheets -----
let sheetOnClose = null;   // optional cleanup when a sheet closes (e.g. discard an unposted draft)

function openSheet(html, key, { wide = false } = {}) {
  const sheet = $('sheet');
  if (sheet.classList.contains('hidden')) sheetReturnFocus = document.activeElement;
  else if (sheetOnClose && key !== sheet.dataset.person) { const f = sheetOnClose; sheetOnClose = null; f(); }
  $('sheet-panel').classList.toggle('sm:max-w-3xl', wide);
  $('sheet-panel').classList.toggle('sm:max-w-xl', !wide);
  $('sheet-panel').innerHTML = html;
  sheet.dataset.person = key || '';
  sheet.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}
function closeSheet() {
  if (sheetOnClose) { const f = sheetOnClose; sheetOnClose = null; f(); }
  $('sheet').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  if (sheetReturnFocus && document.contains(sheetReturnFocus)) sheetReturnFocus.focus();
  sheetReturnFocus = null;
  if (profileRefreshPending) refreshProfilePages();   // changes made in the sheet show on the page underneath (spec 15)
}

function sheetClose() {
  return '<button type="button" id="sheet-close" class="btn btn-gray !min-h-0 !w-9 !h-9 !p-0 absolute top-3 right-3 z-10" data-on-click="closeSheet()" aria-label="Close"><svg class="icon w-4 h-4"><use href="#i-close"/></svg></button>';
}

// Everything a profile shows, for a sample member or for you (your profile uses what's in the form,
// so the preview shows unsaved changes too)
function profileView(id) {
  if (id !== 'me') return person(id);
  const d = collectProfile();
  return {
    ...d, id: 'me', colors: ['#0A84FF', '#BF5AF2'],
    verified: (demo && demo.verified) || [], endorsements: (demo && demo.endorsements) || {},
  };
}


function openMembers(chatId) {
  const chat = allChats().find(c => c.id === chatId);
  const me = currentAccount() || { first: 'You', last: '' };
  const rows = chat.members.map(id => {
    const p = person(id);
    return '<li><button type="button" class="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-fill text-left min-h-[56px]" data-on-click="openPerson(\'' + id + '\')">' +
      personAvatar(p, 'w-10 h-10 text-subhead') +
      '<span class="min-w-0 flex-1"><span class="block font-semibold text-subhead">' + esc(fullName(p)) + '</span><span class="block text-footnote text-label-2 truncate">' + esc(p.headline) + '</span></span>' +
      '<svg class="icon w-4 h-4 text-label-3"><use href="#i-chevron"/></svg></button></li>';
  }).join('');
  openSheet(
    '<div class="relative p-5 sm:p-7 space-y-4">' + sheetClose() +
      '<div class="flex items-center gap-3 pr-10">' + chatAvatar(chat, 'w-14 h-14 text-title3') +
        '<div><h2 id="sheet-title" class="text-title3 font-bold">' + esc(chat.name) + '</h2><p class="text-footnote text-label-2">' + (chat.members.length + 1) + ' members</p></div></div>' +
      '<ul class="space-y-0.5">' + rows +
        '<li class="flex items-center gap-3 px-2 py-2 min-h-[56px]">' + myAvatar('w-10 h-10 text-subhead') +
        '<span class="font-semibold text-subhead">' + esc((me.first + ' ' + me.last).trim()) + ' <span class="text-label-2 font-normal">(you)</span></span></li>' +
      '</ul></div>', '');
  $('sheet-close').focus();
}

function myAvatar(cls) {
  const me = currentAccount() || {};
  const photo = profileOf(me).photo;
  return '<div class="avatar ' + cls + '"' + (photo ? ' style="background-image:url(&quot;' + photo + '&quot;)"' : '') + ' aria-hidden="true">' + (photo ? '' : esc(initials(me.first, me.last))) + '</div>';
}
