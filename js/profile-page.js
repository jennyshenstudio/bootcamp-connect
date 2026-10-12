// Bootcamp Connect prototype: the profile page (specs/15-profile-page.md, D050)
// Plain script (shared globals); load order is set in index.html.

const MAX_PINS = 3;
const POSTS_ON_PROFILE = 2;
let profileMode = 'page';      // your Profile tab shows your page, or the form after Edit profile
let personReturnTab = 'feed';  // where Back on someone else's page goes
let showAllPosts = false;
const TAB_NAMES = { feed: 'Feed', matching: 'Connect', chat: 'Messages', profile: 'your profile' };

const postsBy = id => allPosts().filter(p => p.author === id);
const myPins = () => (currentAccount() ? profileOf(currentAccount()).pinned : []) || [];
const sameTitle = (a, b) => (a || '').toLowerCase() === (b || '').toLowerCase();
const postWhen = post => post.ts ? relTime(post.ts) : post.time;
const postLine = post => post.title || (post.body || '').split('\n')[0];
const isSaved = post => !!(demo.postState[post.id] && demo.postState[post.id].saved);
const dateRange = e => [fmtMonth(e.start), e.current ? 'Present' : fmtMonth(e.end)].filter(Boolean).join(' – ');

// A member's pins that still exist, in the order pinned. Your work is pinned by its lasting id, so renaming
// it keeps the pin; sample members' work by title. n is the piece's place in workFor.
const workKey = w => w.id || w.title;
function pinsFor(p, work) {
  return (p.pinned || []).map(pin => {
    if (pin.kind === 'work') {
      const n = work.findIndex(w => w.by === p.id && (pin.id ? w.id === pin.id : sameTitle(w.title, pin.title)));
      return n < 0 ? null : { kind: 'work', key: workKey(work[n]), item: work[n], n };
    }
    const post = postById(pin.id);
    return post && post.author === p.id ? { kind: 'post', key: pin.id, item: post } : null;
  }).filter(Boolean).slice(0, MAX_PINS);
}

// ----- Opening a page -----
function openPerson(id) {
  closeSheet();
  // While you're editing, your Profile tab stays on the form until you save or cancel, so your page only shows what's saved
  if (id === 'me') { switchTab('profile'); focusPageTitle(); return; }
  if (currentTab !== 'person') personReturnTab = currentTab;
  showAllPosts = false;
  $('person-page').dataset.person = id;
  switchTab('person');
  focusPageTitle();
}
function leavePerson() { switchTab(personReturnTab); }
function focusPageTitle() {
  window.scrollTo(0, 0);
  const title = $('profile-name');
  if (title) title.focus({ preventScroll: true });
}

function renderPersonPage() {
  const id = $('person-page').dataset.person;
  $('person-page').innerHTML = id ? profilePageHtml(id) : '';
  paintBanners($('person-page'));
}
// The banner's colours are set here, not in a style attribute (D027)
function paintBanners(box) {
  box.querySelectorAll('[data-banner]').forEach(el => { const [a, b] = el.dataset.banner.split(','); el.style.background = 'linear-gradient(135deg,' + a + ',' + b + ')'; });
}
function renderProfileTab() {
  const editing = profileMode === 'edit';
  $('profile-edit').classList.toggle('hidden', !editing);
  $('profile-page').classList.toggle('hidden', editing);
  $('profile-page').innerHTML = editing ? '' : profilePageHtml('me');
  paintBanners($('profile-page'));
}
// Re-draw whichever page is showing, keeping keyboard focus on the same control where it can
let profileRefreshPending = false;
function refreshProfilePages(focusKey) {
  // A sheet on top keeps its page as it is, so closing the sheet can return focus to the button that opened it
  if (!$('sheet').classList.contains('hidden')) { profileRefreshPending = true; return; }
  profileRefreshPending = false;
  const box = currentTab === 'person' ? $('person-page') : currentTab === 'profile' && profileMode === 'page' ? $('profile-page') : null;
  if (!box || !box.innerHTML) return;
  const focused = document.activeElement;
  const key = focusKey || (box.contains(focused) && (focused.dataset.pin || focused.dataset.focusKey || (focused.closest('[data-actions]') && 'actions')));
  if (box === $('person-page')) renderPersonPage(); else renderProfileTab();
  if (!key) return;
  const k = CSS.escape(key);
  const again = key === 'actions' ? box.querySelector('[data-actions] button') : box.querySelector('[data-pin="' + k + '"], [data-focus-key="' + k + '"]') || $(key) || $('profile-name');
  if (again) again.focus();
}

// ----- Your own page and the form -----
function editMyProfile() {
  closeSheet();
  profileMode = 'edit';
  switchTab('profile');
  window.scrollTo(0, 0);
  $('profile-edit-title').focus({ preventScroll: true });
}
function cancelEditProfile() {
  loadProfileForm(currentAccount());
  updatePreview();
  profileMode = 'page';
  switchTab('profile');
  focusPageTitle();
}

// ----- Pinning (your own page only) -----
function pinWork(n, where) { const w = workFor(profileView('me'))[n]; if (w) togglePin('work', workKey(w), where); }
function pinPost(id, where) { togglePin('post', id, where); }
function togglePin(kind, key, where) {
  const me = profileView('me');
  const live = pinsFor(me, workFor(me)).map(x => ({ kind: x.kind, id: x.key }));
  const at = live.findIndex(x => x.kind === kind && x.id === key);
  if (at < 0 && live.length >= MAX_PINS) return showToast('You can pin up to 3. Unpin one first.');
  const pins = at < 0 ? live.concat({ kind, id: key }) : live.filter((_, i) => i !== at);
  if (!updateProfile(currentAccount(), { pinned: pins })) return showToast("Couldn't save your pins. This browser's storage is full.");
  // Unpinning from the Pinned section removes the button, so focus goes to the section's heading
  const pinKey = kind + ':' + key;
  refreshProfilePages(where === 'pinned' && at >= 0 ? 'pinned-title' : where + ':' + pinKey);
  showToast(at < 0 ? 'Pinned to your profile' : 'Unpinned');
}
// False if the pin couldn't be removed because storage is full
function unpinDeletedPost(id) {
  const pins = myPins();
  if (!pins.some(x => x.kind === 'post' && x.id === id)) return true;
  return updateProfile(currentAccount(), { pinned: pins.filter(x => !(x.kind === 'post' && x.id === id)) });
}
function pinButton(kind, key, arg, where, pinned) {
  const call = kind === 'work' ? 'pinWork(' + arg + ', \'' + where + '\')' : 'pinPost(\'' + arg + '\', \'' + where + '\')';
  return '<button type="button" class="btn btn-plain btn-sm" data-pin="' + where + ':' + kind + ':' + esc(key) + '" data-on-click="' + call + '" aria-pressed="' + pinned + '">' +
    (pinned ? 'Unpin' : 'Pin') + '</button>';
}

function showAllProfilePosts() { showAllPosts = true; refreshProfilePages('posts-more'); }

// ----- The page -----
const pageCard = (inner, cls = '') => '<section class="card p-5 sm:p-6 space-y-3 ' + cls + '">' + inner + '</section>';
const pageHeading = (text, id) => '<h2' + (id ? ' id="' + id + '" tabindex="-1"' : '') + ' class="text-title3 font-bold focus:outline-none">' + text + '</h2>';
const sideHeading = text => '<h2 class="font-semibold text-body">' + text + '</h2>';

function profilePageHtml(id) {
  const p = profileView(id);
  const mine = id === 'me';
  const work = workFor(p);
  const pins = pinsFor(p, work);
  const why = mine ? '' : whyConnectHtml(suggestionFor(id));
  const main = pinnedHtml(p, pins, mine) +
    (p.about ? pageCard(pageHeading('About') + '<p class="text-subhead whitespace-pre-line">' + esc(p.about) + '</p>') : '') +
    (work.length ? pageCard(workSectionHtml(p, work, { tag: 'h2', extra: mine ? (w, n) => w.by === 'me' ? pinButton('work', workKey(w), n, 'work', pins.some(x => x.kind === 'work' && x.n === n)) : '' : null })) : '') +
    postsHtml(p, mine, pins) +
    ((p.skills || []).length || (p.learn || []).length ? pageCard(skillsSectionHtml(p, work, 'h2')) : '') +
    experienceHtml(p);
  const side = (why ? '<div class="hidden lg:block">' + why + '</div>' : '') +
    (mine ? savedHtml() : '') +
    pageCard(sideHeading('CV') + '<p class="text-footnote text-label-2">Made from this profile: experience, education, skills and work.</p>' +
      '<button type="button" class="btn btn-gray btn-sm w-full" data-focus-key="cv" data-on-click="openCv(\'' + id + '\')"><svg class="icon w-4 h-4"><use href="#i-doc"/></svg>View CV</button>') +
    availableHtml(p) + linksHtml(p) + (mine ? '' : groupsHtml(id));
  return (mine ? '' : '<button type="button" class="btn btn-plain btn-sm -ml-2 mb-3" data-on-click="leavePerson()"><svg class="icon w-4 h-4 rotate-180"><use href="#i-chevron"/></svg>Back to ' + TAB_NAMES[personReturnTab] + '</button>') +
    '<article class="space-y-5" aria-labelledby="profile-name">' +
      topCardHtml(p, mine) +
      (why ? '<div class="lg:hidden">' + why + '</div>' : '') +
      '<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">' +
        '<div class="space-y-4 min-w-0">' + main + '</div>' +
        '<aside class="space-y-4 min-w-0" aria-label="More about ' + esc(fullName(p).trim() || 'you') + '">' + side + '</aside>' +
      '</div>' +
      '<p class="text-footnote text-label-2">Members can use AI to help write their profiles.</p>' +
    '</article>';
}

function topCardHtml(p, mine) {
  const available = p.available ? new Date(p.available + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
  const mutual = mine ? [] : mutualConnections(p.id);
  const connections = mine ? memberView('me').connections : p.connections || 0;
  const avatar = mine ? myAvatar('w-24 h-24 sm:w-28 sm:h-28 text-title1 ring-4 ring-[var(--surface)]') : personAvatar(p, 'w-24 h-24 sm:w-28 sm:h-28 text-title1 ring-4 ring-[var(--surface)]');
  return '<section class="card !p-0 overflow-hidden">' +
    '<div class="h-24 sm:h-32" data-banner="' + esc(p.colors.join(',')) + '"></div>' +
    '<div class="px-5 sm:px-7 pb-6 -mt-12 space-y-3">' + avatar +
      '<div class="flex flex-wrap items-start justify-between gap-4">' +
        '<div class="min-w-0 space-y-1.5">' +
          '<h1 id="profile-name" tabindex="-1" class="text-title1 font-bold tracking-[-0.02em] focus:outline-none">' + esc(fullName(p).trim() || 'Your name') + '</h1>' +
          (p.headline ? '<p class="text-body">' + esc(p.headline) + '</p>' : mine ? '<p class="text-body text-label-2">Add a headline so people know what you do.</p>' : '') +
          (p.currently ? '<p class="text-subhead"><span class="font-semibold">Currently working on:</span> ' + esc(p.currently) + '</p>' : '') +
          '<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">' + trackBadge(p.track) +
            (stageEvidence(p) ? '<span class="text-footnote text-label-2">' + esc(stageEvidence(p)) + '</span>' : '') +
            (p.location ? '<span class="text-footnote text-label-2 inline-flex items-center gap-1"><svg class="icon w-3.5 h-3.5"><use href="#i-pin"/></svg>' + esc([p.location, p.setting].filter(Boolean).join(' · ')) + '</span>' : '') +
            (available ? '<span class="text-footnote text-label-2">Available from ' + esc(available) + '</span>' : '') +
          '</div>' +
          '<p class="text-footnote font-semibold text-blueText">' + plural(connections, 'connection') + (mutual.length ? '<span class="text-label-2 font-normal"> · ' + plural(mutual.length, 'mutual connection') + '</span>' : '') + '</p>' +
        '</div>' +
        '<div class="flex flex-wrap gap-2" data-actions>' + (mine
          ? '<button type="button" class="btn btn-primary btn-sm" data-focus-key="edit" data-on-click="editMyProfile()">Edit profile</button>'
          : connectButton(p, '')) + '</div>' +
      '</div>' +
    '</div>' +
  '</section>';
}

function whyConnectHtml(m) {
  if (!m.reasons.length) return '';
  return '<section class="card p-5 !bg-appleGreen/10 space-y-2">' + sideHeading('Why you might connect') +
    '<ul class="space-y-1.5">' + m.reasons.slice(0, 3).map(r => '<li class="flex items-start gap-2 text-subhead"><svg class="icon w-4 h-4 text-greenText mt-0.5 shrink-0"><use href="#i-check"/></svg>' + esc(r) + '</li>').join('') + '</ul></section>';
}

function pinnedHtml(p, pins, mine) {
  if (!pins.length) return mine ? pageCard(pageHeading('Pinned', 'pinned-title') + '<p class="text-subhead text-label-2">Pin up to 3 pieces of work or posts to show them first. Use Pin on your work or posts below.</p>') : '';
  const item = x => {
    const unpin = mine ? pinButton(x.kind, x.key, x.kind === 'work' ? x.n : x.key, 'pinned', true) : '';
    if (x.kind === 'work') {
      const w = x.item;
      return '<li class="entry !p-3 flex flex-col gap-2">' +
        (w.screenshot ? '<img src="' + w.screenshot + '" alt="Screenshot of ' + esc(w.title) + '" class="w-full h-28 object-cover object-top rounded-xl border border-hairline">' : '') +
        '<p class="text-footnote font-semibold text-label-2">Work</p>' +
        '<h3 class="font-semibold text-subhead">' + esc(w.title) + '</h3>' +
        (factsLine(w.facts) ? '<p class="text-footnote text-label-2">' + esc(factsLine(w.facts)) + '</p>' : '') +
        '<div class="mt-auto flex flex-wrap gap-1"><button type="button" class="btn btn-gray btn-sm" data-on-click="openWork(\'' + p.id + '\', ' + x.n + ')" aria-label="Read more about ' + esc(w.title) + '">Read more</button>' + unpin + '</div></li>';
    }
    const post = x.item;
    const likes = (post.likes || 0) + (demo.postState[post.id] && demo.postState[post.id].liked ? 1 : 0);
    return '<li class="entry !p-3 flex flex-col gap-2"><p>' + typeChip(post) + '</p>' +
      '<h3 class="font-semibold text-subhead line-clamp-3">' + esc(postLine(post)) + '</h3>' +
      '<p class="text-footnote text-label-2">' + esc(postWhen(post)) + ' · ' + plural(likes, 'like') + '</p>' +
      '<div class="mt-auto flex flex-wrap gap-1"><button type="button" class="btn btn-gray btn-sm" data-focus-key="pinned-open:' + post.id + '" data-on-click="openPost(\'' + post.id + '\')" aria-label="Open the post: ' + esc(postLine(post)) + '">Open</button>' + unpin + '</div></li>';
  };
  return pageCard(pageHeading('Pinned', 'pinned-title') + '<ul class="grid grid-cols-1 sm:grid-cols-3 gap-3">' + pins.map(item).join('') + '</ul>');
}

function postsHtml(p, mine, pins) {
  const posts = postsBy(p.id);
  if (!posts.length) return mine ? pageCard(pageHeading('Posts') + '<p class="text-subhead text-label-2">You haven\'t posted yet.</p>') : '';
  const shown = showAllPosts ? posts : posts.slice(0, POSTS_ON_PROFILE);
  const row = post => '<li class="py-3 first:pt-0 border-t first:border-t-0 border-hairline flex flex-wrap items-start justify-between gap-3">' +
    '<div class="min-w-0 flex-1 basis-60 space-y-1"><p class="flex flex-wrap items-center gap-2">' + typeChip(post) + '<span class="text-footnote text-label-2">' + esc(postWhen(post)) + '</span></p>' +
      '<p class="text-subhead line-clamp-2">' + esc(postLine(post)) + '</p></div>' +
    '<div class="flex flex-wrap gap-1">' + (mine ? pinButton('post', post.id, post.id, 'posts', pins.some(x => x.kind === 'post' && x.key === post.id)) : '') +
      '<button type="button" class="btn btn-gray btn-sm" data-focus-key="posts-open:' + post.id + '" data-on-click="openPost(\'' + post.id + '\')" aria-label="Open the post: ' + esc(postLine(post)) + '">Open</button></div></li>';
  return pageCard('<div class="flex items-baseline justify-between gap-3">' + pageHeading('Posts', 'posts-title') + '<span class="text-footnote text-label-2">' + plural(posts.length, 'post') + '</span></div>' +
    '<ul>' + shown.map(row).join('') + '</ul>' +
    (shown.length < posts.length ? '<button type="button" class="btn btn-plain btn-sm w-full" data-focus-key="posts-more" data-on-click="showAllProfilePosts()">Show all posts (' + posts.length + ')</button>' : ''));
}

function experienceHtml(p) {
  const list = items => '<ul class="space-y-3">' + items + '</ul>';
  return ((p.experience || []).length ? pageCard(pageHeading('Experience') + list(p.experience.map(e =>
      '<li class="entry !p-3.5"><h3 class="font-semibold text-subhead">' + esc(e.title) + '</h3><p class="text-footnote text-label-2">' + esc([e.company, dateRange(e)].filter(Boolean).join(' · ')) + '</p>' +
      (e.desc ? '<p class="text-footnote text-label-2 mt-1">' + esc(e.desc) + '</p>' : '') + '</li>').join(''))) : '') +
    ((p.education || []).length ? pageCard(pageHeading('Education') + list(p.education.map(e =>
      '<li class="entry !p-3.5"><h3 class="font-semibold text-subhead">' + esc(e.school) + '</h3><p class="text-footnote text-label-2">' + esc([e.course, [e.start, e.end].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')) + '</p></li>').join(''))) : '') +
    ((p.verified || []).length ? pageCard(pageHeading('Verified experience') + list(p.verified.map(v => verifiedEntryHtml({ ...v, start: '', with: v.with }, wid => wid === 'me' ? memberName('me') : person(wid).first)).join(''))) : '');
}

function availableHtml(p) {
  const rows = [
    p.openTo && p.openTo.length ? ['Open to', p.openTo.map(k => PAY_TYPES[k].label).join(', ')] : null,
    p.hours ? ['Hours per week', p.hours] : null,
    p.idea ? ['Idea status', p.idea] : null,
    (p.industries || []).length ? ['Industries', p.industries.join(', ')] : null,
  ].filter(Boolean);
  if (!rows.length && !(p.goals || []).length) return '';
  return pageCard(sideHeading('Available for') +
    ((p.goals || []).length ? '<div class="flex flex-wrap gap-1.5">' + p.goals.map(g => '<span class="px-2.5 py-1 rounded-full bg-appleBlue/10 text-blueText text-footnote font-semibold">' + esc(g) + '</span>').join('') + '</div>' : '') +
    '<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-footnote">' + rows.map(([k, v]) => '<dt class="text-label-2">' + k + '</dt><dd>' + esc(v) + '</dd>').join('') + '</dl>');
}

function linksHtml(p) {
  const link = (label, url) => url ? '<li><a href="' + esc(hrefOf(url)) + '" target="_blank" rel="noopener" class="text-subhead font-semibold text-blueText hover:underline">' + label + '<span class="sr-only"> (opens in new tab)</span></a></li>' : '';
  const links = link('LinkedIn', p.linkedin) + link(p.track === 'Business Developer' ? 'Portfolio' : 'GitHub', p.code) + link('Website', p.website);
  return links ? pageCard(sideHeading('Links') + '<ul class="space-y-1">' + links + '</ul>') : '';
}

function groupsHtml(id) {
  const groups = DEMO_CHATS.filter(c => c.type === 'group' && c.members.includes(id));
  return groups.length ? pageCard(sideHeading('Group chats together') + '<div class="flex flex-wrap gap-2">' + groups.map(g =>
    '<button type="button" class="chip !text-footnote gap-1.5" data-on-click="goToChat(\'' + g.id + '\')"><svg class="icon w-4 h-4"><use href="#i-users"/></svg>' + esc(g.name) + '</button>').join('') + '</div>') : '';
}

function savedHtml() {
  const saved = allPosts().filter(isSaved);
  return pageCard('<div>' + sideHeading('Saved') + '<p class="text-footnote text-label-2">Only you can see this.</p></div>' +
    (saved.length ? '<ul class="space-y-2">' + saved.map(post => '<li class="flex items-start justify-between gap-2">' +
      '<div class="min-w-0"><p>' + typeChip(post) + '</p><p class="text-subhead line-clamp-2 mt-1">' + esc(postLine(post)) + '</p></div>' +
      '<button type="button" class="btn btn-gray btn-sm shrink-0" data-focus-key="saved-open:' + post.id + '" data-on-click="openPost(\'' + post.id + '\')" aria-label="Open the saved post: ' + esc(postLine(post)) + '">Open</button></li>').join('') + '</ul>'
      : '<p class="text-subhead text-label-2">Nothing saved yet. Use Save on a resource or opportunity to keep it here.</p>'), 'saved-card');
}

// ----- CV, made from the profile: no email address or phone number -----
function openCv(id) {
  const p = profileView(id);
  const work = workFor(p).filter(w => w.by === p.id);
  const part = (title, body) => body ? '<section class="space-y-2"><h3 class="text-footnote font-bold uppercase tracking-[0.06em] text-label-2 border-b border-hairline pb-1">' + title + '</h3>' + body + '</section>' : '';
  const links = [p.linkedin, p.code, p.website].map(hrefOf).filter(Boolean);
  const name = fullName(p).trim() || 'Your name';
  openSheet(sheetClose() +
    '<div id="cv" class="p-6 sm:p-9 space-y-5">' +
      '<div class="pr-10 space-y-1"><h2 id="sheet-title" class="text-title1 font-bold">' + esc(name) + '</h2>' +
        (p.headline ? '<p class="text-body">' + esc(p.headline) + '</p>' : '') +
        '<p class="text-footnote text-label-2">' + esc([p.track, p.location].filter(Boolean).join(' · ')) + '</p>' +
        (links.length ? '<p class="text-footnote text-label-2 break-all">' + links.map(esc).join(' · ') + '</p>' : '') + '</div>' +
      part('About', p.about ? '<p class="text-subhead">' + esc(p.about) + '</p>' : '') +
      part('Experience', (p.experience || []).filter(e => e.title).map(e => '<div><p class="font-semibold text-subhead">' + esc(e.title) + (e.company ? ', ' + esc(e.company) : '') + '</p>' +
        '<p class="text-footnote text-label-2">' + esc(dateRange(e)) + '</p>' + (e.desc ? '<p class="text-subhead">' + esc(e.desc) + '</p>' : '') + '</div>').join('')) +
      part('Work', work.map(w => '<div><p class="font-semibold text-subhead">' + esc(w.title) + '</p>' + (factsLine(w.facts) ? '<p class="text-footnote text-label-2">' + esc(factsLine(w.facts)) + '</p>' : '') +
        '<p class="text-subhead">' + esc(w.summary || w.result || w.did || '') + '</p></div>').join('')) +
      part('Education', (p.education || []).filter(e => e.school).map(e => '<div><p class="font-semibold text-subhead">' + esc(e.school) + '</p><p class="text-footnote text-label-2">' +
        esc([e.course, [e.start, e.end].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')) + '</p></div>').join('')) +
      part('Skills', (p.skills || []).length ? '<p class="text-subhead">' + esc(p.skills.join(', ')) + '</p>' : '') +
      '<p class="text-footnote text-label-2">Made from ' + (id === 'me' ? 'your' : esc(p.first) + '\'s') + ' profile on Bootcamp Connect.</p>' +
      '<div class="cv-actions flex flex-wrap gap-2"><button type="button" class="btn btn-primary btn-sm" data-on-click="printCv()"><svg class="icon w-4 h-4"><use href="#i-doc"/></svg>Print or save as PDF</button></div>' +
    '</div>', 'cv-' + id, { wide: true });
  $('sheet-close').focus();
}
// Only a CV prints this way: the print styles apply while the body has .printing-cv
function printCv() {
  document.body.classList.add('printing-cv');
  window.addEventListener('afterprint', () => document.body.classList.remove('printing-cv'), { once: true });
  window.print();
}
