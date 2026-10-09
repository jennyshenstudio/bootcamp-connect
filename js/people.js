// Bootcamp Connect prototype: Matchmaker, profile and members sheets
// Plain script (shared globals); load order is set in index.html.

// ----- Connect › People (specs/10-networking.md) -----
const PEOPLE_PAGE = 24;
let peopleShown = PEOPLE_PAGE;
const cohortLabel = p => p.cohort === CURRENT_COHORT ? 'Cohort ' + p.cohort : 'Cohort ' + p.cohort + ' alumni';
const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
const invitedBy = id => (demo.invites || []).find(i => i.from === id);

// Years of work experience, not counting the bootcamp, for the stage evidence line
function yearsOfExperience(p) {
  const months = s => { const [y, m] = s.split('-').map(Number); return y * 12 + m; };
  const now = new Date(), today = now.getFullYear() * 12 + now.getMonth() + 1;
  const total = (p.experience || []).filter(e => e.start && !(e.company || '').startsWith('Bootcamp Connect Cohort'))
    .reduce((n, e) => n + Math.max(0, (e.current || !e.end ? today : months(e.end)) - months(e.start)), 0);
  const years = Math.floor(total / 12);
  if (years < 1) return 'under a year\'s experience';
  return years === 1 ? '1 year\'s experience' : years + ' years\' experience';
}
function stageEvidence(p) {
  const done = (p.verified || []).length;
  return [p.stage, yearsOfExperience(p), cohortLabel(p), done ? plural(done, 'finished project') : '']
    .filter(Boolean).join(' · ');
}

function peopleFilters() {
  return {
    q: $('people-q').value.trim().toLowerCase(), track: $('people-track').value, stage: $('people-stage').value,
    cohort: $('people-cohort').value, conn: $('people-conn').value,
  };
}
function peopleMatch(p, f) {
  if (f.track && p.track !== f.track) return false;
  if (f.stage && p.stage !== f.stage) return false;
  if (f.cohort === 'current' && p.cohort !== CURRENT_COHORT) return false;
  if (f.cohort === 'alumni' && p.cohort === CURRENT_COHORT) return false;
  if (/^\d+$/.test(f.cohort) && p.cohort !== Number(f.cohort)) return false;
  if (f.conn === 'connected' && !demo.connected[p.id]) return false;
  if (f.conn === 'not' && demo.connected[p.id]) return false;
  if (!f.q) return true;
  const text = [fullName(p), p.headline, ...p.skills, ...companiesOf(p), ...schoolsOf(p)].join(' ').toLowerCase();
  return f.q.split(/\s+/).every(word => text.includes(word));
}
function filterPeople() { peopleShown = PEOPLE_PAGE; renderPeopleGrid(); }
function clearPeopleFilters() {
  ['people-q', 'people-track', 'people-stage', 'people-cohort', 'people-conn'].forEach(id => { $(id).value = ''; });
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
      '<span class="text-footnote text-label-2">' + esc([p.stage, cohortLabel(p)].filter(Boolean).join(' · ')) + '</span>' +
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
            '<p class="text-footnote text-label-2">' + esc([p.stage, cohortLabel(p)].filter(Boolean).join(' · ')) + '</p>' +
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
    '<p class="text-subhead text-label-2">Based on mutual connections, your cohort, where people have worked and studied, and skills.</p></div>' +
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
  if (!$('sheet').classList.contains('hidden') && $('sheet').dataset.person === id) openPerson(id, { keepFocus: true });
  if (!hadFocus) return;
  const card = document.querySelector('#people-view [data-invite="' + id + '"], #people-grid [data-person="' + id + '"], #people-suggested [data-person="' + id + '"]');
  const target = card ? card.querySelector('.mt-auto button:last-child, .justify-end button:last-child') : ($('people-invites-title') || $('people-suggested-title'));
  if (target) { if (!target.matches('button')) target.setAttribute('tabindex', '-1'); target.focus(); }
}

// ----- Profile viewer (sheet) -----
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
    ...d, id: 'me', colors: ['#0A84FF', '#BF5AF2'], cohort: d.cohort || CURRENT_COHORT,
    verified: (demo && demo.verified) || [], endorsements: (demo && demo.endorsements) || {},
  };
}

// The profile sheet, in the order of spec 11
function openPerson(id, { keepFocus = false } = {}) {
  const p = profileView(id);
  const mine = id === 'me';
  const m = mine ? null : suggestionFor(id);
  const work = workFor(p);
  const groups = mine ? [] : DEMO_CHATS.filter(c => c.type === 'group' && c.members.includes(id));
  const dates = e => [fmtMonth(e.start), e.current ? 'Present' : fmtMonth(e.end)].filter(Boolean).join(' – ');
  const section = (title, body) => '<section class="space-y-2"><h3 class="font-semibold text-body">' + title + '</h3>' + body + '</section>';
  const link = (label, url) => url ? '<li><a href="' + esc(hrefOf(url)) + '" target="_blank" rel="noopener" class="text-subhead font-semibold text-blueText hover:underline">' + label + '<span class="sr-only"> (opens in new tab)</span></a></li>' : '';
  const links = link('LinkedIn', p.linkedin) + link(p.track === 'Business Developer' ? 'Portfolio' : 'GitHub', p.code) + link('Website', p.website);
  const available = p.available ? new Date(p.available + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
  const html =
    '<div class="relative">' +
      '<div class="h-24 sm:h-28 rounded-t-[inherit]" style="background:linear-gradient(135deg,' + p.colors[0] + ',' + p.colors[1] + ')"></div>' +
      '<div class="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-9 h-[5px] rounded-full bg-white/70"></div>' +
      sheetClose() +
    '</div>' +
    '<div class="relative px-5 sm:px-7 pb-7 -mt-12 space-y-5">' +
      '<div class="space-y-3">' +
        (mine ? myAvatar('w-24 h-24 text-title1 ring-4 ring-[var(--surface)]') : personAvatar(p, 'w-24 h-24 text-title1 ring-4 ring-[var(--surface)]')) +
        '<div>' +
          '<h2 id="sheet-title" class="text-title2 font-bold tracking-[-0.01em]">' + esc(fullName(p).trim() || 'Your name') + '</h2>' +
          '<p class="text-subhead text-label-2">' + esc(p.headline) + '</p>' +
          (p.currently ? '<p class="text-subhead mt-1"><span class="font-semibold">Currently working on:</span> ' + esc(p.currently) + '</p>' : '') +
        '</div>' +
        '<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">' + trackBadge(p.track) +
          (p.location ? '<span class="text-footnote text-label-2 inline-flex items-center gap-1"><svg class="icon w-3.5 h-3.5"><use href="#i-pin"/></svg>' + esc([p.location, p.setting].filter(Boolean).join(' · ')) + '</span>' : '') +
          (available ? '<span class="text-footnote text-label-2">Available from ' + esc(available) + '</span>' : '') +
        '</div>' +
        '<p class="text-footnote text-label-2">' + esc(stageEvidence(p)) + '</p>' +
        '<div class="flex flex-wrap gap-2">' + (mine ? '<button type="button" class="btn btn-secondary btn-sm" data-on-click="editMyProfile()">Edit your profile</button>' : connectButton(p, '')) + '</div>' +
      '</div>' +
      (m && m.reasons.length ? '<div class="entry !bg-appleGreen/10 space-y-1.5">' +
        '<p class="font-semibold text-subhead">Why you might connect</p>' +
        '<ul class="space-y-1">' + m.reasons.slice(0, 3).map(r => '<li class="flex items-start gap-2 text-footnote text-label-2"><svg class="icon w-4 h-4 text-greenText mt-px shrink-0"><use href="#i-check"/></svg>' + esc(r) + '</li>').join('') + '</ul>' +
      '</div>' : '') +
      workSectionHtml(p, work) +
      (p.about ? section('About', '<p class="text-subhead text-label-2">' + esc(p.about) + '</p>') : '') +
      ((p.skills || []).length || (p.learn || []).length ? skillsSectionHtml(p, work) : '') +
      ((p.experience || []).length ? section('Experience', '<ul class="space-y-3">' + p.experience.map(e =>
        '<li class="entry !p-3.5"><p class="font-semibold text-subhead">' + esc(e.title) + '</p><p class="text-footnote text-label-2">' + esc([e.company, dates(e)].filter(Boolean).join(' · ')) + '</p>' +
        (e.desc ? '<p class="text-footnote text-label-2 mt-1">' + esc(e.desc) + '</p>' : '') + '</li>').join('') + '</ul>') : '') +
      ((p.education || []).length ? section('Education', '<ul class="space-y-2">' + p.education.map(e =>
        '<li class="entry !p-3.5"><p class="font-semibold text-subhead">' + esc(e.school) + '</p><p class="text-footnote text-label-2">' + esc([e.course, [e.start, e.end].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')) + '</p></li>').join('') + '</ul>') : '') +
      (p.verified.length ? section('Verified experience', '<ul class="space-y-3">' + p.verified.map(v => verifiedEntryHtml({ ...v, start: '', with: v.with }, wid => wid === 'me' ? memberName('me') : person(wid).first)).join('') + '</ul>') : '') +
      section('Available for',
        ((p.goals || []).length ? '<div class="flex flex-wrap gap-1.5">' + p.goals.map(g => '<span class="px-2.5 py-1 rounded-full bg-appleBlue/10 text-blueText text-footnote font-semibold">' + esc(g) + '</span>').join('') + '</div>' : '') +
        '<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-footnote">' +
          (p.openTo && p.openTo.length ? '<dt class="text-label-2">Open to</dt><dd>' + esc(p.openTo.map(k => PAY_TYPES[k].label).join(', ')) + '</dd>' : '') +
          (p.hours ? '<dt class="text-label-2">Hours per week</dt><dd>' + esc(p.hours) + '</dd>' : '') +
          (p.idea ? '<dt class="text-label-2">Idea status</dt><dd>' + esc(p.idea) + '</dd>' : '') +
          ((p.industries || []).length ? '<dt class="text-label-2">Industries</dt><dd>' + esc(p.industries.join(', ')) + '</dd>' : '') +
        '</dl>') +
      (links ? section('Links', '<ul class="space-y-1">' + links + '</ul>') : '') +
      (groups.length ? section('Group chats together', '<div class="flex flex-wrap gap-2">' + groups.map(g =>
        '<button type="button" class="chip !text-footnote gap-1.5" data-on-click="openChatFromSheet(\'' + g.id + '\')"><svg class="icon w-4 h-4"><use href="#i-users"/></svg>' + esc(g.name) + '</button>').join('') + '</div>') : '') +
      '<p class="text-footnote text-label-2 pt-2 border-t border-hairline">Members can use AI to help write their profiles.</p>' +
    '</div>';
  openSheet(html, id);
  if (!keepFocus) $('sheet-close').focus();
}

function editMyProfile() { closeSheet(); switchTab('profile'); }
function openChatFromSheet(chatId) { closeSheet(); goToChat(chatId); }

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
