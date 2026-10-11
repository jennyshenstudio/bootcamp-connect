// Bootcamp Connect prototype: typed feed and composer (specs/05-feed.md, 12-opportunities.md, 13-updates.md).
// Plain script (shared globals); load order is set in index.html.

let feedFilter = 'foryou';
const openComments = new Set();
let cp = null;   // composer draft

const FEED_FILTERS = [
  ['foryou', 'For you'], ['all', 'All'], ['work', 'Opportunities'], ['update', 'Updates'],
  ['support', 'Support'], ['resource', 'Resources'],
];

function relTime(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function postState(id) {
  return demo.postState[id] = demo.postState[id] || { liked: false, saved: false, comments: [] };
}
const postComments = post => (post.comments || []).concat(postState(post.id).comments);
const postSolved = post => postState(post.id).solved ?? post.solved;

// ----- Ranking for "For you" -----
function forYouScore(post, me) {
  const recency = post.ts ? 45 : post.rank;
  if (post.type === 'work') {
    const status = projectStatus(post);
    if (isMine(post)) return 60 + recency;
    if (onTeam(post)) return status === 'completed' ? null : 30 + recency;
    if (status !== 'open') return null;
    // Open opportunities for your pathway come before everything else (spec 12)
    const fit = projectFit(post, me);
    return fit.blocked ? null : 100 + fit.score + recency;
  }
  if (post.type === 'resource') return 25 + 15 * overlap(post.tags || [], me.skills.concat(me.learn)).length + recency;
  if (post.type === 'support') return 20 + (postSolved(post) ? 0 : 10) + recency;
  return 25 + recency;
}

// ----- Rendering -----
function renderFeed() {
  const list = $('feed-list');
  if (!list || !demo) return;
  const me = memberView('me');
  let posts = allPosts();
  if (feedFilter === 'foryou') {
    posts = posts.map(p => ({ p, s: forYouScore(p, me) })).filter(x => x.s !== null).sort((a, b) => b.s - a.s).map(x => x.p);
  } else if (feedFilter !== 'all') {
    posts = posts.filter(p => p.type === feedFilter);
  }
  $('feed-filters').innerHTML = FEED_FILTERS.map(([k, label]) =>
    '<button type="button" class="chip whitespace-nowrap' + (feedFilter === k ? ' chip-active' : '') + '" data-on-click="setFeedFilter(\'' + k + '\')" aria-pressed="' + (feedFilter === k) + '">' + label + '</button>').join('');
  $('feed-hint').textContent = feedFilter === 'foryou' ? 'Opportunities for your pathway first, then posts from your cohort.' : '';
  list.innerHTML = posts.length ? posts.map(p => renderPost(p)).join('')
    : '<div class="card p-8 text-center space-y-2"><p class="font-semibold text-body">Nothing here yet</p><p class="text-subhead text-label-2">Be the first to post in ' + esc((FEED_FILTERS.find(f => f[0] === feedFilter) || [])[1] || 'this section') + '.</p>' +
      '<button type="button" class="btn btn-primary btn-sm" data-on-click="openComposer(\'' + (POST_TYPES[feedFilter] ? feedFilter : 'update') + '\')">Create a post</button></div>';
  hydrateAttachments(list);
  $('composer-avatar').outerHTML = myAvatar('w-10 h-10 text-subhead" id="composer-avatar');
}

function setFeedFilter(f) { feedFilter = f; renderFeed(); }

// Personal project and community posts saved before spec 13 load as updates, keeping their title and text
function upgradeToUpdate(p) {
  if (p.type === 'personal') { p.type = 'update'; p.label = 'Project'; delete p.feedback; }
  else if (p.type === 'community') p.type = 'update';
}

function refreshPost(id) {
  document.querySelectorAll('[data-post="' + id + '"]').forEach(el => {
    const compact = el.dataset.compact === '1';
    el.outerHTML = renderPost(postById(id), { compact });
  });
  document.querySelectorAll('[data-post="' + id + '"]').forEach(el => hydrateAttachments(el));
}

function authorBlock(post) {
  const a = post.author;
  const open = a === 'me' ? 'switchTab(\'profile\')' : 'openPerson(\'' + a + '\')';
  const t = POST_TYPES[post.type];
  return '<div class="flex items-start justify-between gap-3">' +
    '<div class="flex items-center gap-3 min-w-0">' +
      '<button type="button" class="tap rounded-full shrink-0" data-on-click="' + open + '" aria-label="View ' + esc(memberName(a, true)) + '\'s profile">' + memberAvatar(a, 'w-10 h-10 text-subhead') + '</button>' +
      '<div class="min-w-0"><button type="button" class="font-semibold text-subhead hover:underline text-left" data-on-click="' + open + '">' + esc(memberName(a, true)) + '</button>' +
      '<p class="text-footnote text-label-2">' + esc(shortTrack(memberTrack(a)) || 'Member') + ' · ' + esc(post.ts ? relTime(post.ts) : post.time) + '</p></div>' +
    '</div>' +
    '<span class="shrink-0 inline-flex items-center gap-1 text-footnote font-semibold px-2.5 py-1 rounded-full ' + t.cls + '"><svg class="icon w-3.5 h-3.5"><use href="#' + t.icon + '"/></svg>' + t.label + '</span>' +
  '</div>';
}

function workBlock(post) {
  const status = projectStatus(post);
  const team = projectTeam(post);
  const fact = (txt, cls) => '<span class="text-footnote font-semibold px-2.5 py-0.5 rounded-full ' + (cls || 'bg-fill text-label-2') + '">' + esc(txt) + '</span>';
  const facts = [pathwayChip(post), fact(payLabel(post.pay), post.pay.type === 'Paid' ? 'bg-appleGreen/15 text-greenText' : ''), fact(post.commitment), fact(workplaceLabel(post))];
  if (opportunityDates(post)) facts.push(fact(opportunityDates(post)));
  if (status !== 'open') facts.push(fact(statusLabel(status), status === 'in-progress' ? 'bg-appleOrange/15 text-orangeText' : 'bg-appleGreen/15 text-greenText'));
  let html = '<div class="flex flex-wrap gap-1.5">' + facts.join('') + '</div>';
  html += '<p class="text-subhead text-label-2 whitespace-pre-line line-clamp-3">' + esc(post.body) + '</p>';
  html += '<div class="flex items-center gap-2 text-footnote text-label-2"><span class="flex -space-x-2">' + team.slice(0, 5).map(id => '<span class="ring-2 ring-[var(--surface)] rounded-full">' + memberAvatar(id, 'w-6 h-6 text-[9px]') + '</span>').join('') + '</span>' +
    '<span>Team of ' + team.length + ' · ' + projectApplicants(post) + ' applicant' + (projectApplicants(post) === 1 ? '' : 's') + '</span></div>';
  if (!isMine(post) && !onTeam(post) && status === 'open' && !demo.applications[post.id]) {
    const fit = projectFit(post, memberView('me'));
    if (fit.blocked) html += '<p class="text-footnote text-orangeText font-medium">Not a fit right now: ' + esc(fit.blockers[0]) + '</p>';
  }
  return html + '<div class="flex flex-wrap gap-2">' + opportunityActions(post) +
    '<button type="button" class="btn btn-gray btn-sm" data-on-click="openOpportunity(\'' + post.id + '\')">See details</button></div>';
}

function renderPost(post, { compact = false } = {}) {
  const ps = postState(post.id);
  const comments = postComments(post);
  let body = '';
  if (post.title) body += '<h3 class="font-semibold text-body">' + esc(post.title) + '</h3>';
  if (post.body && post.type !== 'work') body += '<p class="text-subhead text-label-2 whitespace-pre-line' + (compact ? ' line-clamp-2' : '') + '">' + esc(post.body) + '</p>';
  if (post.type === 'work') body += workBlock(post);
  if (post.type === 'resource' && (post.tags || []).length) body += '<div class="flex flex-wrap gap-1">' + post.tags.map(t => '<span class="bg-fill text-label-2 text-caption px-2 py-0.5 rounded-md">#' + esc(t) + '</span>').join('') + '</div>';
  if (post.type === 'update' && post.label) body = '<p><span class="text-footnote font-semibold px-2.5 py-0.5 rounded-full bg-fill text-label-2">' + esc(post.label) + '</span></p>' + body;
  if (post.type === 'support') {
    const solved = postSolved(post);
    body += '<div class="flex flex-wrap items-center gap-2"><span class="text-footnote font-semibold px-2.5 py-0.5 rounded-full ' + (solved ? 'bg-appleGreen/15 text-greenText' : 'bg-appleOrange/15 text-orangeText') + '">' + (solved ? 'Solved' : 'Open question') + '</span>' +
      '<span class="text-footnote text-label-2">' + comments.length + ' answer' + (comments.length === 1 ? '' : 's') + '</span>' +
      (isMine(post) && !solved ? '<button type="button" class="btn btn-plain btn-sm !min-h-[32px]" data-on-click="markSolved(\'' + post.id + '\')">Mark solved</button>' : '') + '</div>';
  }
  if (!compact) body += renderAttachments(post);

  const likeCount = (post.likes || 0) + (ps.liked ? 1 : 0);
  const footer = compact ? '' :
    '<div class="pt-2 border-t border-hairline flex items-center gap-1 -mx-2">' +
      '<button type="button" class="btn btn-plain btn-sm !min-h-[36px] ' + (ps.liked ? '!text-redText' : '!text-label-2') + '" data-on-click="toggleLike(\'' + post.id + '\')" aria-pressed="' + ps.liked + '" aria-label="Like">' +
        '<svg class="icon w-[18px] h-[18px]"' + (ps.liked ? ' style="fill:currentColor"' : '') + '><use href="#i-heart"/></svg><span class="tabular-nums">' + likeCount + '</span></button>' +
      '<button type="button" class="btn btn-plain btn-sm !min-h-[36px] !text-label-2" data-on-click="toggleComments(\'' + post.id + '\')" aria-expanded="' + openComments.has(post.id) + '">' +
        '<svg class="icon w-[18px] h-[18px]"><use href="#i-chat"/></svg><span class="tabular-nums">' + comments.length + '</span><span class="sr-only"> comments</span></button>' +
      (post.type === 'resource' ? '<button type="button" class="btn btn-plain btn-sm !min-h-[36px] ml-auto ' + (ps.saved ? '!text-blueText' : '!text-label-2') + '" data-on-click="toggleSave(\'' + post.id + '\')" aria-pressed="' + ps.saved + '">' +
        '<svg class="icon w-[18px] h-[18px]"' + (ps.saved ? ' style="fill:currentColor"' : '') + '><use href="#i-bookmark"/></svg>' + (ps.saved ? 'Saved' : 'Save') + ' <span class="tabular-nums">' + ((post.saves || 0) + (ps.saved ? 1 : 0)) + '</span></button>' : '') +
    '</div>' +
    (openComments.has(post.id) ? commentsBlock(post, comments) : '');

  // Opportunities get a coloured edge for their pathway (D040); the pathway is also named in words
  const edge = post.type !== 'work' ? '' : isBizTrack(post.lookingFor) ? ' border-l-[6px] border-l-applePurple' : ' border-l-[6px] border-l-appleBlue';
  return '<article id="post-' + post.id + '" data-post="' + post.id + '" data-compact="' + (compact ? 1 : 0) + '" class="card p-5 space-y-3 scroll-mt-24' + edge + '">' + authorBlock(post) + body + footer + '</article>';
}

function commentsBlock(post, comments) {
  return '<div class="space-y-3">' +
    comments.map(c => '<div class="flex items-start gap-2.5">' + memberAvatar(c.from, 'w-7 h-7 text-caption2') +
      '<div class="min-w-0 flex-1 entry !py-2 !px-3"><p class="text-footnote"><span class="font-semibold">' + esc(memberName(c.from, true)) + '</span> <span class="text-label-3">· ' + esc(c.ts ? relTime(c.ts) : c.time) + '</span></p>' +
      '<p class="text-subhead whitespace-pre-line">' + esc(c.text) + '</p></div></div>').join('') +
    '<form class="flex items-end gap-2" data-on-submit="addComment(event, \'' + post.id + '\')">' + myAvatar('w-7 h-7 text-caption2 mb-1.5') +
      '<label for="comment-' + post.id + '" class="sr-only">Add a comment</label>' +
      '<input id="comment-' + post.id + '" class="pf-input !min-h-[38px] !py-1.5 !text-subhead !rounded-full" placeholder="' + (post.type === 'support' ? 'Write an answer…' : 'Add a comment…') + '" maxlength="500">' +
      '<button type="submit" class="btn btn-primary !min-h-[38px] !w-[38px] !p-0 shrink-0" aria-label="Send"><svg class="icon w-4 h-4"><use href="#i-up"/></svg></button></form>' +
  '</div>';
}

function toggleLike(id) { const ps = postState(id); ps.liked = !ps.liked; saveDemo(); refreshPost(id); }
function toggleSave(id) { const ps = postState(id); ps.saved = !ps.saved; saveDemo(); refreshPost(id); showToast(ps.saved ? 'Saved' : 'Removed from saved'); }
function markSolved(id) { postState(id).solved = true; saveDemo(); refreshPost(id); showToast('Marked as solved'); }
function toggleComments(id) {
  openComments.has(id) ? openComments.delete(id) : openComments.add(id);
  refreshPost(id);
  if (openComments.has(id)) $('comment-' + id)?.focus();
}
function addComment(e, id) {
  e.preventDefault();
  const input = $('comment-' + id);
  const text = input.value.trim();
  if (!text) return;
  postState(id).comments.push({ from: 'me', text, ts: Date.now() });
  saveDemo();
  refreshPost(id);
  $('comment-' + id)?.focus();
}

function scrollToPost(id) {
  if (!$('post-' + id)) { feedFilter = 'all'; }
  switchTab('feed');
  renderFeed();
  const el = $('post-' + id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.add('ring-4', 'ring-appleBlue/40');
  setTimeout(() => el.classList.remove('ring-4', 'ring-appleBlue/40'), 1600);
}

// ----- Your activity (spec 14) -----
// A summary of where you stand. Each section only shows when it has something in it.
function activityData() {
  const me = memberView('me');
  const work = allPosts().filter(p => p.type === 'work');
  const fresh = work.filter(p => !isMine(p) && !onTeam(p) && !demo.applications[p.id] && projectStatus(p) === 'open')
    .map(p => ({ p, fit: projectFit(p, me) })).filter(x => !x.fit.blocked).sort((a, b) => b.fit.score - a.fit.score).slice(0, 3).map(x => x.p);
  const applied = p => demo.applications[p.id] && demo.applications[p.id].status === 'applied';
  const current = work.filter(p => projectStatus(p) !== 'completed' && (isMine(p) || onTeam(p) || applied(p)));
  const toReview = current.filter(isMine).reduce((n, p) => n + projectApplicantList(p).filter(a => a.status === 'applied').length, 0);
  const invites = (demo.invites || []).filter(i => person(i.from) && !demo.connected[i.from]);
  const unread = allChats().filter(c => demo.unread[c.id]).sort((a, b) => chatSortKey(b) - chatSortKey(a));
  const profile = profileOf(currentAccount());
  const todo = strengthChecks(profile).filter(c => !c[1]).slice(0, 2).map(([label, , , section]) => ({ label, action: "openProfileSection('" + section + "')" }));
  const today = new Date().toLocaleDateString('en-CA');   // YYYY-MM-DD in local time
  work.filter(p => onTeam(p) && projectStatus(p) === 'in-progress' && p.end && p.end < today)
    .forEach(p => todo.push({ label: 'Mark ' + shortTitle(p) + ' complete', action: "openComplete('" + p.id + "')" }));
  const needs = todo.length;
  if (!Object.keys(demo.applications).length) todo.push({ label: 'Apply to your first opportunity', action: 'showOpportunities()' });
  return { fresh, current, toReview, invites, unread, todo: todo.slice(0, 3), todoNeeds: Math.min(needs, 3), drafts: demo.drafts, newMember: !profile.headline };
}

function activityRow(action, main, sub) {
  return '<li><button type="button" class="w-full text-left rounded-xl px-2 py-2 hover:bg-fill" data-on-click="' + action + '">' +
    '<span class="block font-semibold text-subhead line-clamp-2">' + esc(main) + '</span>' + (sub ? '<span class="block text-footnote text-label-2">' + esc(sub) + '</span>' : '') + '</button></li>';
}
const activityCard = (title, body) => '<section class="card p-4 space-y-1"><h3 class="font-semibold text-body px-1">' + title + '</h3>' + body + '</section>';

function currentRow(p) {
  if (!isMine(p) && !onTeam(p)) return activityRow("openOpportunity('" + p.id + "')", p.title, 'Applied · Waiting to hear from ' + memberName(p.author));
  const chatId = p.chatId || projectState(p).chatId;
  if (isMine(p) && projectStatus(p) === 'open') {
    const n = projectApplicantList(p).filter(a => a.status === 'applied').length;
    return activityRow("openManage('" + p.id + "')", p.title, 'Your post · ' + n + ' applicant' + (n === 1 ? '' : 's') + ' to review');
  }
  return activityRow(chatId ? "goToChat('" + chatId + "')" : "openManage('" + p.id + "')", p.title, 'In progress' + (p.end ? ' · Ends ' + fmtDay(p.end) : ''));
}

// "just now", "5 minutes ago", "3 hours ago" or a date, to read naturally after "Saved"
function savedAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + (m === 1 ? ' minute' : ' minutes') + ' ago';
  if (m < 1440) { const h = Math.floor(m / 60); return h + (h === 1 ? ' hour' : ' hours') + ' ago'; }
  return 'on ' + new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function draftRow(d) {
  const text = ((d.values || {})['cp-body'] || (d.values || {})['cp-title'] || '').trim();
  const words = text.length > 60 ? text.slice(0, 57).trim() + '…' : text || 'Attachments only';
  return '<li class="px-2 py-2 space-y-1"><p class="text-subhead"><span class="font-semibold">' + esc(POST_TYPES[d.type].label) + '</span> · ' + esc(words) + '</p>' +
    '<div class="flex items-center gap-1 text-footnote text-label-2"><span class="mr-auto">Saved ' + esc(savedAgo(d.savedAt)) + '</span>' +
      '<button type="button" class="btn btn-plain btn-sm" data-on-click="continueDraft(\'' + d.id + '\')">Continue</button>' +
      '<button type="button" class="btn btn-plain btn-sm !text-redText" data-on-click="deleteDraft(\'' + d.id + '\')">Delete</button></div></li>';
}

function renderFeedSidebar() {
  const box = $('feed-sidebar');
  if (!box || !demo) return;
  const a = activityData();
  const acc = currentAccount() || {};
  const sections = [];
  if (a.fresh.length) sections.push(activityCard('New for you', '<ul>' + a.fresh.map(p => activityRow("openOpportunity('" + p.id + "')", p.title, memberName(p.author) + ' · ' + payLabel(p.pay) + ' · ' + p.commitment)).join('') + '</ul>' +
    '<button type="button" class="btn btn-plain btn-sm" data-on-click="showOpportunities()">See all opportunities</button>'));
  if (a.current.length) sections.push(activityCard('Current', '<ul>' + a.current.map(currentRow).join('') + '</ul>'));
  if (a.invites.length || a.unread.length) sections.push(activityCard('People to get back to', '<ul>' +
    (a.invites.length ? activityRow("switchTab('matching')", a.invites.length + ' invitation' + (a.invites.length === 1 ? '' : 's') + ' to connect', 'Open Connect') : '') +
    a.unread.slice(0, 2).map(c => activityRow("goToChat('" + c.id + "')", chatTitle(c), demo.unread[c.id] + ' new')).join('') +
    (a.unread.length > 2 ? activityRow("switchTab('chat')", (a.unread.length - 2) + ' more conversation' + (a.unread.length === 3 ? '' : 's') + ' with new messages', 'Open Messages') : '') + '</ul>'));
  const todo = a.todo.length ? activityCard('To do', '<ul>' + a.todo.map(t => activityRow(t.action, t.label)).join('') + '</ul>') : '';
  if (todo) a.newMember ? sections.unshift(todo) : sections.push(todo);
  if (a.drafts.length) sections.push(activityCard('Drafts', '<ul class="divide-y divide-[var(--hairline)]">' + a.drafts.map(draftRow).join('') + '</ul>'));
  box.innerHTML = '<div class="card p-4 flex items-center gap-3">' + myAvatar('w-10 h-10 text-subhead') +
      '<div class="min-w-0"><h2 class="font-semibold text-body">Your activity</h2><p class="text-footnote text-label-2 truncate">' + esc(memberName('me', true) + (acc.track ? ' · ' + acc.track : '')) + '</p></div></div>' +
    sections.join('');
  const needs = a.toReview + a.invites.length + a.unread.length + a.todoNeeds;
  $('activity-count').textContent = needs ? needs + (needs === 1 ? ' thing needs' : ' things need') + ' you' : 'All caught up';
  placeActivity();
}

// A short summary sticks under the header. A tall one scrolls with the page until its last section
// is in view, then stays there (as X and Facebook do), so everything can be reached without its own scrollbar.
function placeActivity() {
  const box = $('feed-sidebar');
  if (!box) return;
  const header = 80, gap = 16;
  const top = Math.min(header, innerHeight - box.offsetHeight - gap);
  box.style.setProperty('--activity-top', top + 'px');
}
addEventListener('resize', placeActivity);

// Phones: the summary sits behind a bar above the Feed
function toggleActivity() {
  const open = $('feed-sidebar').classList.toggle('hidden') === false;
  $('activity-toggle').setAttribute('aria-expanded', open);
}

// Connect is People only; opportunities live in the Feed (D040)
function renderMatchmaker() { if (demo) renderPeople(); }
function showOpportunities() { switchTab('feed'); setFeedFilter('work'); }

// ----- Composer -----
// Each post type's wording. No title means the type has none; bodyMax defaults to 2,000 characters.
const COMPOSER_COPY = {
  work: { title: 'Title', titlePh: 'e.g. Booking page for 3 Bristol restaurants', body: 'About the project', bodyPh: 'What it is and why it matters.' },
  resource: { title: 'Title', titlePh: 'e.g. Unit economics template', body: 'Why it\'s useful', bodyPh: 'What it helped you with and who should read it.' },
  update: { body: "What's your news?", bodyPh: 'For example: a new role, finishing the bootcamp, a project going live, your first paying customer.', bodyMax: 1000 },
  support: { title: 'Your question', titlePh: 'e.g. How should I price a pilot?', body: 'Details', bodyPh: 'Context that helps people answer.' },
};

function openComposer(type) {
  const me = memberView('me');
  // An opportunity starts looking for the other pathway from yours
  cp = { type: POST_TYPES[type] ? type : 'update', attachments: [], posted: false, lookingFor: isBizTrack(me.track) ? 'Software Developer' : 'Business Developer' };
  sheetOnClose = discardComposer;
  openSheet(
    '<form id="composer" class="relative p-5 sm:p-7 space-y-4" data-on-submit="submitPost(event)" novalidate>' + sheetClose() +
      '<h2 id="sheet-title" class="text-title3 font-bold pr-10">Create a post</h2>' +
      '<fieldset><legend class="pf-label">Post type</legend><div class="flex flex-wrap gap-2">' +
        Object.entries(POST_TYPES).map(([k, t]) => '<label class="cursor-pointer"><input type="radio" class="peer sr-only" name="cp-type" value="' + k + '"' + (k === cp.type ? ' checked' : '') + ' data-on-change="setComposerType(this.value)">' +
          '<span class="chip gap-1.5"><svg class="icon w-4 h-4"><use href="#' + t.icon + '"/></svg>' + t.label + '</span></label>').join('') + '</div></fieldset>' +
      '<div id="cp-before-title" class="space-y-4"></div>' +
      '<div id="cp-title-wrap"><label for="cp-title" id="cp-title-label" class="pf-label"></label><input id="cp-title" class="pf-input" maxlength="120"><p id="cp-title-error" class="pf-error hidden"></p></div>' +
      '<div id="cp-after-title" class="space-y-4"></div>' +
      '<div><label for="cp-body" id="cp-body-label" class="pf-label"></label><textarea id="cp-body" rows="4" maxlength="2000" class="pf-input resize-y"></textarea><p id="cp-body-hint" class="pf-hint hidden"></p><p id="cp-body-error" class="pf-error hidden"></p></div>' +
      '<div id="cp-type-fields" class="space-y-4"></div>' +
      '<section class="space-y-2" aria-label="Attachments">' +
        '<p class="pf-label !mb-0">Attachments <span class="pf-hint font-normal">· up to ' + MAX_ATTACHMENTS + '</span></p>' +
        '<div class="flex flex-wrap gap-2">' +
          '<label for="cp-media" class="btn btn-gray btn-sm cursor-pointer"><svg class="icon w-4 h-4"><use href="#i-photo"/></svg>Photo or video</label>' +
          '<input id="cp-media" type="file" accept="image/*,video/*" multiple class="sr-only" data-on-change="addComposerFilesFromInput(this)">' +
          '<label for="cp-doc" class="btn btn-gray btn-sm cursor-pointer"><svg class="icon w-4 h-4"><use href="#i-doc"/></svg>Document</label>' +
          '<input id="cp-doc" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.key,.xls,.xlsx,.csv,.numbers,.pages,.txt,.md" multiple class="sr-only" data-on-change="addComposerFilesFromInput(this)">' +
          '<button type="button" class="btn btn-gray btn-sm" data-on-click="toggleLinkForm()"><svg class="icon w-4 h-4"><use href="#i-link"/></svg>Link</button>' +
        '</div>' +
        '<div id="cp-link-form" class="hidden entry !p-3 space-y-2"><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' +
          '<div><label for="cp-link-url" class="sr-only">Link URL</label><input id="cp-link-url" type="url" inputmode="url" class="pf-input !min-h-[38px] !py-1.5 !text-subhead" placeholder="https://…"></div>' +
          '<div><label for="cp-link-title" class="sr-only">Link title (optional)</label><input id="cp-link-title" class="pf-input !min-h-[38px] !py-1.5 !text-subhead" placeholder="Title (optional)"></div></div>' +
          '<div class="flex justify-end"><button type="button" class="btn btn-secondary btn-sm" data-on-click="addComposerLink()">Add link</button></div></div>' +
        '<ul id="cp-atts" class="space-y-2"></ul>' +
        '<p id="cp-att-error" class="pf-error hidden" role="alert"></p>' +
        '<p class="pf-hint">You can also drag files onto this form. In the prototype, files are stored only in this browser.</p>' +
      '</section>' +
      '<div class="flex flex-wrap justify-end gap-2 pt-1"><button type="button" class="btn btn-gray btn-sm" data-on-click="closeSheet()">Cancel</button><button type="button" id="cp-draft" class="btn btn-gray btn-sm" data-on-click="saveDraft()">Save draft</button><button id="cp-submit" type="submit" class="btn btn-primary btn-sm">Post</button></div>' +
    '</form>', 'composer', { wide: true });
  const form = $('composer');
  form.addEventListener('input', e => {
    if (!e.target.id) return;
    e.target.classList.remove('invalid');
    $(e.target.id + '-error')?.classList.add('hidden');
    if (e.target.id === 'cp-start') $('cp-end-error')?.classList.add('hidden');
  });
  form.addEventListener('dragover', e => { e.preventDefault(); form.classList.add('ring-4', 'ring-appleBlue/30'); });
  form.addEventListener('dragleave', e => { if (e.target === form) form.classList.remove('ring-4', 'ring-appleBlue/30'); });
  form.addEventListener('drop', e => { e.preventDefault(); form.classList.remove('ring-4', 'ring-appleBlue/30'); addComposerFiles(e.dataTransfer.files); });
  setComposerType(cp.type);
  $('cp-title').focus();
}

// Buttons for a one-of-several choice, built from native radio inputs
function choiceGroup(name, legend, options, checked, onChange) {
  return '<fieldset><legend class="pf-label">' + legend + '</legend><div class="flex flex-wrap gap-2">' +
    options.map(o => '<label class="cursor-pointer"><input type="radio" class="peer sr-only" name="' + name + '" value="' + o + '"' + (o === checked ? ' checked' : '') + (onChange ? ' data-on-change="' + onChange + '"' : '') + '><span class="chip">' + o + '</span></label>').join('') +
    '</div></fieldset>';
}
const choiceOf = name => document.querySelector('input[name="' + name + '"]:checked').value;
const linesOf = id => $(id).value.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).slice(0, 10);

function setComposerType(type) {
  cp.type = type;
  const copy = COMPOSER_COPY[type];
  // Updates have no title: the first line does that job (spec 13)
  $('cp-title-wrap').classList.toggle('hidden', !copy.title);
  $('cp-title-label').textContent = copy.title || ''; $('cp-title').placeholder = copy.titlePh || '';
  $('cp-body-label').textContent = copy.body; $('cp-body').placeholder = copy.bodyPh;
  // Only a type with its own limit shows (and announces) it
  const max = copy.bodyMax || 2000;
  $('cp-body').maxLength = max;
  $('cp-body-hint').textContent = copy.bodyMax ? 'Up to ' + max.toLocaleString('en-GB') + ' characters.' : '';
  $('cp-body-hint').classList.toggle('hidden', !copy.bodyMax);
  copy.bodyMax ? $('cp-body').setAttribute('aria-describedby', 'cp-body-hint') : $('cp-body').removeAttribute('aria-describedby');
  ['cp-title', 'cp-body'].forEach(id => { $(id).classList.remove('invalid'); $(id + '-error').classList.add('hidden'); });
  const before = $('cp-before-title'), after = $('cp-after-title'), f = $('cp-type-fields');
  before.innerHTML = after.innerHTML = f.innerHTML = '';
  if (type === 'work') {
    // Order follows spec 12: looking for, title, pay, commitment, workplace, dates, about, then the lists
    before.innerHTML = choiceGroup('cp-looking', 'Looking for', ['Software Developer', 'Business Developer'], cp.lookingFor, 'setLookingFor(this.value)');
    after.innerHTML =
      '<div>' + choiceGroup('cp-pay', 'Pay', ['Paid', 'Unpaid'], 'Paid', 'onPayTypeChange(this)') +
        '<div id="cp-amount-wrap" class="mt-2 sm:w-1/2"><label for="cp-amount" class="pf-label">Fixed fee for the whole project</label>' +
          '<div class="flex items-center gap-2"><span class="text-body font-semibold" aria-hidden="true">£</span><input id="cp-amount" type="number" min="1" step="1" inputmode="numeric" placeholder="e.g. 750" class="pf-input" aria-describedby="cp-amount-error"></div>' +
          '<p id="cp-amount-error" class="pf-error hidden"></p></div></div>' +
      choiceGroup('cp-commitment', 'Commitment', COMMITMENTS, 'Part-time') +
      '<div>' + choiceGroup('cp-workplace', 'Workplace', WORKPLACES, 'Remote', 'onWorkplaceChange(this)') +
        '<div id="cp-town-wrap" class="hidden mt-2 sm:w-1/2"><label for="cp-town" class="pf-label">Town or city</label><input id="cp-town" class="pf-input" maxlength="60" placeholder="e.g. Bristol"><p id="cp-town-error" class="pf-error hidden"></p></div></div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
        '<div><label for="cp-start" class="pf-label">Start date</label><input id="cp-start" type="date" class="pf-input"><p id="cp-start-error" class="pf-error hidden"></p></div>' +
        '<div><label for="cp-end" class="pf-label">End date</label><input id="cp-end" type="date" class="pf-input"><p id="cp-end-error" class="pf-error hidden"></p></div></div>';
    const list = (id, label, hint) => '<div><label for="' + id + '" class="pf-label">' + label + '</label><textarea id="' + id + '" rows="3" maxlength="1000" class="pf-input resize-y" aria-describedby="' + id + '-hint"></textarea>' +
      '<p id="' + id + '-hint" class="pf-hint">' + hint + '</p><p id="' + id + '-error" class="pf-error hidden"></p></div>';
    f.innerHTML = list('cp-duties', 'Responsibilities', 'One per line.') + list('cp-requirements', 'Minimum requirements', 'One per line.') + list('cp-nice', 'Nice to have (optional)', 'One per line.');
  } else if (type === 'resource') {
    f.innerHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label for="cp-kind" class="pf-label">Kind</label><select id="cp-kind" class="pf-input">' + ['Link', 'Doc', 'Video', 'Screenshot', 'Other'].map(k => '<option>' + k + '</option>').join('') + '</select></div>' +
      '<div><label for="cp-tags" class="pf-label">Tags</label><input id="cp-tags" class="pf-input" placeholder="e.g. Pitch decks, SQL"></div></div>';
  } else if (type === 'update') {
    before.innerHTML = choiceGroup('cp-label', "What's it about?", UPDATE_LABELS, 'Career');
  }
}

function attError(msg) { const el = $('cp-att-error'); el.textContent = msg; el.classList.toggle('hidden', !msg); }

// File inputs: add the chosen files, then clear the input so the same file can be chosen again
function addComposerFilesFromInput(input) { addComposerFiles(input.files); input.value = ''; }

// Remember the pathway, so switching post type and back doesn't reset it
function setLookingFor(track) { cp.lookingFor = track; }

// The fixed fee only applies to paid opportunities, and the town only to in-person or hybrid ones
function onPayTypeChange(input) { $('cp-amount-wrap').classList.toggle('hidden', input.value !== 'Paid'); }
function onWorkplaceChange(input) { $('cp-town-wrap').classList.toggle('hidden', input.value === 'Remote'); }

// Open Profile and scroll to one of its sections once the tab has rendered
function openProfileSection(section) { switchTab('profile'); setTimeout(() => goToSection(section), 50); }

async function addComposerFiles(files) {
  attError('');
  const list = [...files];
  const errors = [];
  for (const file of list) {
    if (cp.attachments.length >= MAX_ATTACHMENTS) { errors.push('You can attach up to ' + MAX_ATTACHMENTS + ' items per post.'); break; }
    const placeholder = { id: 'pending-' + Math.random(), kind: 'pending', name: file.name };
    cp.attachments.push(placeholder);
    renderComposerAtts();
    try {
      const att = await processAttachment(file);
      // The form may have closed while the file was being added; don't keep a file nothing uses
      if (!cp || !cp.attachments.includes(placeholder)) { if (att.kind !== 'link') idbDelete(att.id); return; }
      cp.attachments[cp.attachments.indexOf(placeholder)] = att;
    } catch (e) {
      if (!cp || !cp.attachments.includes(placeholder)) return;
      cp.attachments.splice(cp.attachments.indexOf(placeholder), 1);
      errors.push(e.message);
    }
    renderComposerAtts();
  }
  attError(errors.join(' '));
}

function toggleLinkForm() { $('cp-link-form').classList.toggle('hidden'); if (!$('cp-link-form').classList.contains('hidden')) $('cp-link-url').focus(); }
function addComposerLink() {
  attError('');
  if (cp.attachments.length >= MAX_ATTACHMENTS) return attError('You can attach up to ' + MAX_ATTACHMENTS + ' items per post.');
  const url = normalizeUrl($('cp-link-url').value);
  if (!url) return attError('Enter a valid link, like https://example.com/article.');
  cp.attachments.push({ id: 'l-' + Date.now().toString(36), kind: 'link', url, title: $('cp-link-title').value.trim() });
  $('cp-link-url').value = ''; $('cp-link-title').value = '';
  $('cp-link-form').classList.add('hidden');
  renderComposerAtts();
}
const draftOf = id => demo.drafts.find(d => d.id === id);
function removeComposerAtt(id) {
  const att = cp.attachments.find(a => a.id === id);
  const inDraft = cp.draftId && (draftOf(cp.draftId) || { attachments: [] }).attachments.some(a => a.id === id);
  if (att && att.kind !== 'link' && !inDraft) idbDelete(id);
  cp.attachments = cp.attachments.filter(a => a.id !== id);
  renderComposerAtts();
}

function renderComposerAtts() {
  const ul = $('cp-atts');
  if (!ul) return;
  ul.innerHTML = cp.attachments.map(a => {
    let thumb, label, sub;
    if (a.kind === 'pending') { thumb = '<span class="w-4 h-4 rounded-full border-2 border-appleBlue border-t-transparent animate-spin"></span>'; label = a.name; sub = 'Adding…'; }
    else if (a.kind === 'image') { thumb = '<img data-thumb="' + a.id + '" class="w-full h-full object-cover" alt="">'; label = a.name; sub = 'Photo · ' + fmtSize(a.size); }
    else if (a.kind === 'video') { thumb = '<svg class="w-5 h-5 text-white" viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>'; label = a.name; sub = 'Video · ' + fmtSize(a.size); }
    else if (a.kind === 'doc') { thumb = '<span class="text-white text-caption2 font-bold">' + esc(docInfo(a).label.slice(0, 4).toUpperCase()) + '</span>'; label = a.name; sub = docInfo(a).label + ' · ' + fmtSize(a.size); }
    else { thumb = '<svg class="icon w-5 h-5 text-blueText"><use href="#i-link"/></svg>'; label = a.title || domainOf(a.url); sub = domainOf(a.url); }
    const bg = a.kind === 'video' ? 'background:#1C1C1E' : a.kind === 'doc' ? 'background:' + docInfo(a).color : '';
    return '<li class="entry !p-2 flex items-center gap-3"><span class="w-12 h-12 rounded-lg overflow-hidden bg-fill flex items-center justify-center shrink-0" style="' + bg + '">' + thumb + '</span>' +
      '<span class="min-w-0 flex-1"><span class="block text-subhead font-semibold truncate">' + esc(label) + '</span><span class="block text-footnote text-label-2 truncate">' + esc(sub) + (a.sessionOnly ? ' · this session only' : '') + '</span></span>' +
      (a.kind === 'pending' ? '' : '<button type="button" class="btn btn-plain !min-h-0 !w-9 !h-9 !p-0 !text-label-2" data-on-click="removeComposerAtt(\'' + a.id + '\')" aria-label="Remove ' + esc(label) + '"><svg class="icon w-4 h-4"><use href="#i-close"/></svg></button>') + '</li>';
  }).join('');
  ul.querySelectorAll('[data-thumb]').forEach(async img => {
    const att = cp.attachments.find(a => a.id === img.dataset.thumb);
    const url = att && await attachmentURL(att);
    if (url) img.src = url;
  });
}

// ----- Drafts (spec 14) -----
// A draft keeps every field of the form by id, the chosen buttons by name, and the attachments
// Fields the current post type uses (an update's hidden title box can still hold text)
const usedField = el => el.id !== 'cp-title' || !!COMPOSER_COPY[cp.type].title;
function composerSnapshot() {
  const values = {}, radios = {};
  $('composer').querySelectorAll('input[id^="cp-"]:not([type=radio]):not([type=file]):not([type=checkbox]):not([id^="cp-link"]), textarea[id^="cp-"], select[id^="cp-"]')
    .forEach(el => { if (el.value && usedField(el)) values[el.id] = el.value; });
  $('composer').querySelectorAll('input[type=radio]:checked').forEach(el => { if (el.name !== 'cp-type') radios[el.name] = el.value; });
  return { values, radios };
}
// Files still being added, or kept only for this session (no IndexedDB), can't be part of a draft
const composerAtts = () => cp.attachments.filter(a => a.kind !== 'pending' && !a.sessionOnly);
// Something written or attached (choices and the resource "Kind" list alone don't count)
const composerHasContent = () => composerAtts().length > 0 ||
  [...$('composer').querySelectorAll('input[id^="cp-"]:not([type=radio]):not([type=file]):not([id^="cp-link"]), textarea[id^="cp-"]')].some(el => usedField(el) && el.value.trim());

// Files a saved draft used that it no longer does
function dropRemovedFiles(before, after) {
  (before || []).filter(a => a.kind !== 'link' && !after.some(x => x.id === a.id)).forEach(a => idbDelete(a.id));
}
function storeDraft() {
  const previous = demo.drafts;
  const old = draftOf(cp.draftId);
  const draft = { id: cp.draftId || 'd-' + Date.now().toString(36), type: cp.type, ...composerSnapshot(), attachments: composerAtts(), savedAt: Date.now() };
  demo.drafts = [draft].concat(previous.filter(d => d.id !== draft.id));
  if (!saveDemo()) { demo.drafts = previous; return false; }
  if (old) dropRemovedFiles(old.attachments, draft.attachments);
  cp.draftId = draft.id;
  return true;
}
const DRAFT_SAVED = "Saved as a draft. It's under Your activity.";
const DRAFT_FULL = "Couldn't save the draft. This browser's storage is full.";
function saveDraft() {
  if (!composerHasContent()) return attError('Write something before saving a draft.');
  if (!storeDraft()) return attError(DRAFT_FULL);
  cp.kept = true;
  closeSheet();
  renderFeedSidebar();
  showToast(DRAFT_SAVED);
}

// Closing the form keeps anything written as a draft, so nothing is lost (spec 14)
function discardComposer() {
  if (cp && !cp.posted && !cp.kept && $('composer')) {
    if (composerHasContent()) {
      if (storeDraft()) { renderFeedSidebar(); showToast(DRAFT_SAVED); }
      else { showToast(DRAFT_FULL); if (!cp.draftId) cp.attachments.filter(a => a.kind !== 'link' && a.kind !== 'pending').forEach(a => idbDelete(a.id)); }
    } else if (cp.draftId) {
      // Everything was cleared out of a draft: remove it and its files
      dropRemovedFiles((draftOf(cp.draftId) || {}).attachments, []);
      demo.drafts = demo.drafts.filter(d => d.id !== cp.draftId); saveDemo(); renderFeedSidebar();
    }
  }
  cp = null;
}

function continueDraft(id) {
  const d = demo.drafts.find(x => x.id === id);
  if (!d) return;
  openComposer(d.type);
  cp.draftId = d.id;
  cp.attachments = d.attachments.slice();
  // Choices first, since some of them show or hide fields (fee, town)
  Object.entries(d.radios || {}).forEach(([name, value]) => {
    const input = document.querySelector('#composer input[name="' + name + '"][value="' + value + '"]');
    if (input && !input.checked) { input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  Object.entries(d.values || {}).forEach(([fid, value]) => { if ($(fid)) $(fid).value = value; });
  renderComposerAtts();
}

function deleteDraft(id) {
  const d = demo.drafts.find(x => x.id === id);
  if (!d) return;
  d.attachments.filter(a => a.kind !== 'link').forEach(a => idbDelete(a.id));
  demo.drafts = demo.drafts.filter(x => x.id !== id);
  saveDemo();
  renderFeedSidebar();
  showToast('Draft deleted');
}

function cpError(id, msg) {
  const el = $(id + '-error');
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  $(id)?.classList.add('invalid');
}

function submitPost(e) {
  e.preventDefault();
  if (cp.attachments.some(a => a.kind === 'pending')) return attError('Wait for your files to finish adding.');
  ['cp-title', 'cp-body', 'cp-amount', 'cp-town', 'cp-start', 'cp-end', 'cp-duties', 'cp-requirements'].forEach(id => { $(id)?.classList.remove('invalid'); $(id + '-error')?.classList.add('hidden'); });
  const type = cp.type;
  const copy = COMPOSER_COPY[type];
  // A hidden title box can still hold text typed for another post type, so ignore it
  const title = copy.title ? $('cp-title').value.trim() : '';
  const body = $('cp-body').value.trim();
  const max = copy.bodyMax || 2000;
  const bad = [];
  if (copy.title && !title) { cpError('cp-title', type === 'support' ? 'Write your question.' : 'Add a title.'); bad.push('cp-title'); }
  if ((type === 'update' || type === 'work') && !body) { cpError('cp-body', type === 'work' ? 'Say what the project is about.' : 'Write your news.'); bad.push('cp-body'); }
  // maxlength doesn't shorten text that was already there when switching type, so check here too
  if (body.length > max) { cpError('cp-body', 'This is ' + body.length.toLocaleString('en-GB') + ' characters. Cut it to ' + max.toLocaleString('en-GB') + ' or fewer.'); bad.push('cp-body'); }
  const post = { id: 'u-' + Date.now().toString(36), type, author: 'me', ts: Date.now(), title, body, attachments: cp.attachments, likes: 0, comments: [] };
  if (type === 'work') {
    const pay = choiceOf('cp-pay'), workplace = choiceOf('cp-workplace');
    const amount = Number($('cp-amount').value);
    const town = $('cp-town').value.trim();
    const start = $('cp-start').value, end = $('cp-end').value;
    const responsibilities = linesOf('cp-duties'), requirements = linesOf('cp-requirements');
    if (pay === 'Paid' && !(amount > 0)) { cpError('cp-amount', 'Enter the fixed fee in pounds, or choose Unpaid.'); bad.push('cp-amount'); }
    if (workplace !== 'Remote' && !town) { cpError('cp-town', 'Enter the town or city, or choose Remote.'); bad.push('cp-town'); }
    if (!start) { cpError('cp-start', 'Enter the start date.'); bad.push('cp-start'); }
    if (!end) { cpError('cp-end', 'Enter the end date.'); bad.push('cp-end'); }
    else if (start && end < start) { cpError('cp-end', 'The end date must be the same as or after the start date.'); bad.push('cp-end'); }
    if (!responsibilities.length) { cpError('cp-duties', 'Add at least one responsibility.'); bad.push('cp-duties'); }
    if (!requirements.length) { cpError('cp-requirements', 'Add at least one minimum requirement.'); bad.push('cp-requirements'); }
    Object.assign(post, {
      lookingFor: choiceOf('cp-looking'), pay: pay === 'Paid' ? { type: pay, amount } : { type: pay },
      commitment: choiceOf('cp-commitment'), workplace, town: workplace === 'Remote' ? '' : town, start, end,
      responsibilities, requirements, niceToHave: linesOf('cp-nice'), status: 'open', team: ['me'], applicants: 0,
    });
  } else if (type === 'resource') {
    Object.assign(post, { kind: $('cp-kind').value, tags: $('cp-tags').value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6), saves: 0 });
  } else if (type === 'update') {
    post.label = choiceOf('cp-label');
  } else if (type === 'support') {
    post.solved = false;
  }
  if (bad.length) { $(bad[0]).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

  demo.posts.unshift(post);
  const drafts = demo.drafts, draft = draftOf(cp.draftId);
  demo.drafts = drafts.filter(d => d.id !== cp.draftId);   // posting a draft replaces it
  cp.posted = true;
  if (!saveDemo()) { demo.posts.shift(); demo.drafts = drafts; cp.posted = false; return attError("Couldn't save. This browser's storage is full."); }
  if (draft) dropRemovedFiles(draft.attachments, post.attachments);
  closeSheet();
  if (feedFilter !== 'foryou' && feedFilter !== 'all' && feedFilter !== type) feedFilter = 'all';
  switchTab('feed');
  renderFeed();
  renderFeedSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (type === 'work') { showToast('Opportunity posted. Members on the ' + post.lookingFor + ' pathway are being told.'); scheduleApplicants(post); }
  else showToast('Posted');
}

// Re-render everything that depends on per-account demo state
function refreshAll() {
  renderFeed();
  renderFeedSidebar();
  renderMatchmaker();
  renderChatList();
  updateBadge();
  renderVerified();
  renderSkills();
}
