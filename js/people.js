// Bootcamp Connect prototype: Matchmaker, profile and members sheets
// Plain script (shared globals); load order is set in index.html.

// ----- Matchmaker -----
function setPeopleFilter(f) {
  peopleFilter = f;
  document.querySelectorAll('#people-filter [data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === f));
  renderPeople();
}

function connectButton(p, extra) {
  if (demo.connected[p.id]) return '<button type="button" class="btn btn-secondary btn-sm ' + extra + '" data-on-click="messagePerson(\'' + p.id + '\')"><svg class="icon w-4 h-4"><use href="#i-chat"/></svg>Message</button>';
  if (demo.requested[p.id]) return '<button type="button" class="btn btn-gray btn-sm ' + extra + '" disabled aria-disabled="true">Requested</button>';
  return '<button type="button" class="btn btn-primary btn-sm ' + extra + '" data-on-click="connectPerson(\'' + p.id + '\')"><svg class="icon w-4 h-4"><use href="#i-plus"/></svg>Connect</button>';
}

function renderPeople() {
  if (!demo) return;
  const list = DEMO_PEOPLE
    .map(p => ({ p, m: matchFor(p) }))
    .filter(({ p }) => peopleFilter === 'all' || (peopleFilter === 'connected') === !!demo.connected[p.id])
    .sort((a, b) => b.m.score - a.m.score);
  $('people-grid').innerHTML = list.length ? list.map(({ p, m }) =>
    '<article class="card p-5 flex flex-col gap-3">' +
      '<div class="flex items-start gap-3">' +
        '<button type="button" class="tap rounded-full" data-on-click="openPerson(\'' + p.id + '\')" aria-label="View ' + esc(fullName(p)) + '\'s profile">' + personAvatar(p, 'w-14 h-14 text-title3') + '</button>' +
        '<div class="min-w-0 flex-1">' +
          '<div class="flex items-start justify-between gap-2">' +
            '<button type="button" class="font-semibold text-body text-left hover:underline" data-on-click="openPerson(\'' + p.id + '\')">' + esc(fullName(p)) + '</button>' +
            '<span class="shrink-0 bg-appleGreen/15 text-greenText text-footnote font-semibold px-2.5 py-0.5 rounded-full tabular-nums">' + m.score + '%</span>' +
          '</div>' +
          '<p class="text-footnote text-label-2 line-clamp-2">' + esc(p.headline) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="flex flex-wrap items-center gap-1.5">' + trackBadge(p.track) +
        '<span class="text-footnote text-label-2 inline-flex items-center gap-1"><svg class="icon w-3.5 h-3.5"><use href="#i-pin"/></svg>' + esc(p.location) + '</span>' +
        (demo.connected[p.id] ? '<span class="text-footnote text-greenText font-semibold inline-flex items-center gap-1"><svg class="icon w-3.5 h-3.5"><use href="#i-check"/></svg>Connected</span>' : '') +
      '</div>' +
      '<div class="flex flex-wrap gap-1">' + p.skills.slice(0, 4).map(s => '<span class="bg-fill text-label-2 text-caption px-2 py-0.5 rounded-md">' + esc(s) + '</span>').join('') + '</div>' +
      '<p class="text-footnote text-label-2"><span class="text-label font-medium">Looking for:</span> ' + esc(p.goals.join(', ')) + ' · ' + esc(p.hours) + ' hrs/week</p>' +
      '<div class="mt-auto pt-1 flex gap-2">' +
        '<button type="button" class="btn btn-gray btn-sm flex-1" data-on-click="openPerson(\'' + p.id + '\')">View profile</button>' +
        connectButton(p, 'flex-1') +
      '</div>' +
    '</article>'
  ).join('') : '<p class="text-subhead text-label-2 md:col-span-2 xl:col-span-3">No one here yet. Connect with people from the Suggested list.</p>';
}

function connectPerson(id) {
  const p = person(id);
  demo.requested[id] = true;
  saveDemo();
  refreshPersonViews(id);
  // Demo: requests are accepted after a moment
  setTimeout(() => {
    delete demo.requested[id];
    demo.connected[id] = true;
    saveDemo();
    refreshPersonViews(id);
    showToast(p.first + ' accepted your connection request');
  }, 1500);
}

function refreshPersonViews(id) {
  renderPeople();
  if (!$('sheet').classList.contains('hidden') && $('sheet').dataset.person === id) openPerson(id, { keepFocus: true });
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

function openPerson(id, { keepFocus = false } = {}) {
  const p = person(id);
  const m = matchFor(p);
  const groups = DEMO_CHATS.filter(c => c.type === 'group' && c.members.includes(id));
  const dates = e => [fmtMonth(e.start), e.current ? 'Present' : fmtMonth(e.end)].filter(Boolean).join(' – ');
  const section = (title, body) => '<section class="space-y-2"><h3 class="font-semibold text-body">' + title + '</h3>' + body + '</section>';
  const html =
    '<div class="relative">' +
      '<div class="h-24 sm:h-28 rounded-t-[inherit]" style="background:linear-gradient(135deg,' + p.colors[0] + ',' + p.colors[1] + ')"></div>' +
      '<div class="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-9 h-[5px] rounded-full bg-white/70"></div>' +
      sheetClose() +
    '</div>' +
    '<div class="relative px-5 sm:px-7 pb-7 -mt-12 space-y-5">' +
      '<div class="space-y-3">' +
        personAvatar(p, 'w-24 h-24 text-title1 ring-4 ring-[var(--surface)]') +
        '<div>' +
          '<h2 id="sheet-title" class="text-title2 font-bold tracking-[-0.01em]">' + esc(fullName(p)) + '</h2>' +
          '<p class="text-subhead text-label-2">' + esc(p.headline) + '</p>' +
        '</div>' +
        '<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">' + trackBadge(p.track) +
          '<span class="text-footnote text-label-2 inline-flex items-center gap-1"><svg class="icon w-3.5 h-3.5"><use href="#i-pin"/></svg>' + esc(p.location) + ' · ' + esc(p.setting) + '</span>' +
          '<span class="text-footnote text-label-2">Available from ' + esc(new Date(p.available + 'T00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })) + '</span>' +
        '</div>' +
        '<div class="flex flex-wrap gap-2">' + connectButton(p, '') + '</div>' +
      '</div>' +
      '<div class="entry !bg-appleGreen/10 space-y-1.5">' +
        '<p class="font-semibold text-subhead"><span class="text-greenText tabular-nums">' + m.score + '% match</span> with you</p>' +
        '<ul class="space-y-1">' + m.reasons.map(r => '<li class="flex items-start gap-2 text-footnote text-label-2"><svg class="icon w-4 h-4 text-greenText mt-px"><use href="#i-check"/></svg>' + esc(r) + '</li>').join('') + '</ul>' +
      '</div>' +
      section('About', '<p class="text-subhead text-label-2">' + esc(p.about) + '</p>') +
      section('Experience', '<ul class="space-y-3">' + p.experience.map(e =>
        '<li class="entry !p-3.5"><p class="font-semibold text-subhead">' + esc(e.title) + '</p><p class="text-footnote text-label-2">' + esc(e.company) + ' · ' + esc(dates(e)) + '</p>' +
        (e.desc ? '<p class="text-footnote text-label-2 mt-1">' + esc(e.desc) + '</p>' : '') + '</li>').join('') + '</ul>') +
      (p.verified.length ? section('Verified experience', '<ul class="space-y-3">' + p.verified.map(v => verifiedEntryHtml({ ...v, start: '', with: v.with }, wid => wid === 'me' ? memberName('me') : person(wid).first)).join('') + '</ul>') : '') +
      section('Skills', '<div class="flex flex-wrap gap-1.5">' + p.skills.map(s => '<span class="chip !cursor-default !min-h-[28px] !text-footnote">' + esc(s) + (p.endorsements[s] ? ' <span class="text-greenText font-semibold ml-1">' + p.endorsements[s] + '</span>' : '') + '</span>').join('') + '</div>' +
        '<p class="pf-label !mt-3">Wants to learn</p><div class="flex flex-wrap gap-1.5">' + p.learn.map(s => '<span class="px-2.5 py-1 rounded-full bg-applePurple/10 text-purpleText text-footnote font-semibold">' + esc(s) + '</span>').join('') + '</div>') +
      section('Projects', '<ul class="space-y-3">' + p.projects.map(pr =>
        '<li class="entry !p-3.5"><p class="font-semibold text-subhead">' + esc(pr.title) + '</p><p class="text-footnote text-label-2">' + esc(pr.role) + '</p><p class="text-footnote text-label-2 mt-1">' + esc(pr.desc) + '</p></li>').join('') + '</ul>') +
      section('Looking for',
        '<div class="flex flex-wrap gap-1.5">' + p.goals.map(g => '<span class="px-2.5 py-1 rounded-full bg-appleBlue/10 text-blueText text-footnote font-semibold">' + esc(g) + '</span>').join('') + '</div>' +
        '<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-footnote">' +
          '<dt class="text-label-2">Hours per week</dt><dd>' + esc(p.hours) + '</dd>' +
          '<dt class="text-label-2">Idea status</dt><dd>' + esc(p.idea) + '</dd>' +
          '<dt class="text-label-2">Open to</dt><dd>' + esc(p.openTo.map(k => PAY_TYPES[k].label).join(', ')) + '</dd>' +
          '<dt class="text-label-2">Industries</dt><dd>' + esc(p.industries.join(', ')) + '</dd>' +
        '</dl>') +
      (groups.length ? section('Group chats together', '<div class="flex flex-wrap gap-2">' + groups.map(g =>
        '<button type="button" class="chip !text-footnote gap-1.5" data-on-click="closeSheet(); goToChat(\'' + g.id + '\')"><svg class="icon w-4 h-4"><use href="#i-users"/></svg>' + esc(g.name) + '</button>').join('') + '</div>') : '') +
    '</div>';
  openSheet(html, id);
  if (!keepFocus) $('sheet-close').focus();
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
  const photo = me.profile && me.profile.photo;
  return '<div class="avatar ' + cls + '"' + (photo ? ' style="background-image:url(&quot;' + photo + '&quot;)"' : '') + ' aria-hidden="true">' + (photo ? '' : esc(initials(me.first, me.last))) + '</div>';
}
