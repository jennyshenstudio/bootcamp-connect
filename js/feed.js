// Bootcamp Connect prototype: typed feed, composer, and Matchmaker project view (specs/05-feed.md).
// Plain script (shared globals); load order is set in index.html.

let feedFilter = 'foryou';
let mmView = 'projects';
const openComments = new Set();
let cp = null;   // composer draft

const FEED_FILTERS = [
  ['foryou', 'For you'], ['all', 'All'], ['work', 'Projects'], ['resource', 'Resources'],
  ['personal', 'Personal'], ['support', 'Support'], ['community', 'Community'],
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
    const fit = projectFit(post, me);
    return fit.blocked ? null : fit.score + recency;
  }
  if (post.type === 'resource') return 25 + 15 * overlap(post.tags || [], me.skills.concat(me.learn)).length + recency;
  if (post.type === 'support') return 20 + (postSolved(post) ? 0 : 10) + recency;
  if (post.type === 'personal') return 20 + (post.feedback ? 10 : 0) + recency;
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
  $('feed-hint').textContent = feedFilter === 'foryou' ? 'Ranked by your skills, the skills you want to learn, your goals, and your weekly hours.' : '';
  list.innerHTML = posts.length ? posts.map(p => renderPost(p)).join('')
    : '<div class="card p-8 text-center space-y-2"><p class="font-semibold text-body">Nothing here yet</p><p class="text-subhead text-label-2">Be the first to post in ' + esc((FEED_FILTERS.find(f => f[0] === feedFilter) || [])[1] || 'this section') + '.</p>' +
      '<button type="button" class="btn btn-primary btn-sm" data-on-click="openComposer(\'' + (POST_TYPES[feedFilter] ? feedFilter : 'community') + '\')">Create a post</button></div>';
  hydrateAttachments(list);
  $('composer-avatar').outerHTML = myAvatar('w-10 h-10 text-subhead" id="composer-avatar');
}

function setFeedFilter(f) { feedFilter = f; renderFeed(); }

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

function skillChip(s, me) {
  const has = overlap([s], me.skills).length, learn = overlap([s], me.learn).length;
  const cls = has ? 'bg-appleBlue/10 text-blueText' : learn ? 'bg-applePurple/10 text-purpleText' : 'bg-fill text-label-2';
  const title = has ? 'You have this skill' : learn ? 'You want to learn this' : '';
  return '<span class="text-caption font-medium px-2 py-0.5 rounded-md ' + cls + '"' + (title ? ' title="' + title + '"' : '') + '>' + esc(s) + '</span>';
}

function workBlock(post, compact) {
  const me = memberView('me');
  const status = projectStatus(post);
  const team = projectTeam(post);
  const app = demo.applications[post.id];
  const mine = isMine(post), member = onTeam(post);
  const statusCls = status === 'open' ? 'bg-appleBlue/10 text-blueText' : status === 'in-progress' ? 'bg-appleOrange/15 text-orangeText' : 'bg-appleGreen/15 text-greenText';
  const payCls = post.pay.type === 'Paid' ? 'bg-appleGreen/15 text-greenText' : post.pay.type === 'Equity' ? 'bg-applePurple/15 text-purpleText' : 'bg-fill text-label';
  const fact = (txt, cls) => '<span class="text-footnote font-semibold px-2.5 py-0.5 rounded-full ' + (cls || 'bg-fill text-label-2') + '">' + esc(txt) + '</span>';
  let html = '<div class="flex flex-wrap gap-1.5">' + fact(payLabel(post.pay), payCls) + fact(post.hours + ' hrs/wk') + fact(post.weeks + (post.weeks === 1 ? ' week' : ' weeks')) + fact(post.setting) + fact(post.industry) + fact(statusLabel(status), statusCls) + '</div>';
  html += '<div class="space-y-1.5">' + post.roles.map(r =>
    '<div class="flex flex-wrap items-center gap-1.5"><span class="text-footnote font-semibold mr-0.5">' + esc(shortTrack(r.track)) + ' ×' + r.count + '</span>' + r.skills.map(s => skillChip(s, me)).join('') + '</div>').join('') + '</div>';
  if (!compact) html += '<p class="text-footnote"><span class="font-semibold">Deliverable:</span> <span class="text-label-2">' + esc(post.deliverable) + '</span></p>';
  const pending = mine ? projectApplicantList(post).filter(a => a.status === 'applied').length : 0;
  html += '<div class="flex items-center gap-2 text-footnote text-label-2"><span class="flex -space-x-2">' + team.slice(0, 5).map(id => '<span class="ring-2 ring-[var(--surface)] rounded-full">' + memberAvatar(id, 'w-6 h-6 text-[9px]') + '</span>').join('') + '</span>' +
    '<span>Team of ' + team.length + ' · ' + projectApplicants(post) + ' applicant' + (projectApplicants(post) === 1 ? '' : 's') + '</span></div>';

  if (!mine && !member && status === 'open' && !app) {
    const fit = projectFit(post, me);
    html += fit.blocked
      ? '<p class="text-footnote text-orangeText font-medium">Not a fit right now: ' + esc(fit.blockers[0]) + '</p>'
      : '<p class="text-footnote"><span class="text-greenText font-semibold">' + fit.score + '% fit</span> <span class="text-label-2">· ' + esc(fit.reasons.slice(0, compact ? 1 : 2).join(' · ')) + '</span></p>';
  }
  let actions = '';
  if (mine) {
    actions = '<button type="button" class="btn btn-primary btn-sm" data-on-click="openManage(\'' + post.id + '\')">Manage' + (pending ? ' <span class="nav-badge !bg-white !text-blueText">' + pending + '</span>' : '') + '</button>';
  } else if (member && status === 'in-progress') {
    actions = '<button type="button" class="btn btn-gray btn-sm" data-on-click="goToChat(\'' + (post.chatId || projectState(post).chatId) + '\')"><svg class="icon w-4 h-4"><use href="#i-chat"/></svg>Project chat</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-on-click="openComplete(\'' + post.id + '\')">Mark complete</button>';
  } else if (member && status === 'completed') {
    actions = '<span class="inline-flex items-center gap-1 text-footnote font-semibold text-greenText"><svg class="icon w-4 h-4"><use href="#i-check"/></svg>Completed · on your profile</span>';
  } else if (app && app.status === 'applied') {
    actions = '<button type="button" class="btn btn-gray btn-sm" disabled aria-disabled="true">Applied · waiting for ' + esc(memberName(post.author)) + '</button>';
  } else if (status === 'open') {
    const blocked = projectFit(post, me).blocked;
    actions = '<button type="button" class="btn ' + (blocked ? 'btn-gray' : 'btn-primary') + ' btn-sm" data-on-click="openApply(\'' + post.id + '\')">Apply</button>';
  }
  return html + (actions ? '<div class="flex flex-wrap gap-2">' + actions + '</div>' : '');
}

function renderPost(post, { compact = false } = {}) {
  const ps = postState(post.id);
  const comments = postComments(post);
  let body = '';
  if (post.title) body += '<h3 class="font-semibold text-body">' + esc(post.title) + '</h3>';
  if (post.body) body += '<p class="text-subhead text-label-2 whitespace-pre-line' + (compact ? ' line-clamp-2' : '') + '">' + esc(post.body) + '</p>';
  if (post.type === 'work') body += workBlock(post, compact);
  if (post.type === 'resource' && (post.tags || []).length) body += '<div class="flex flex-wrap gap-1">' + post.tags.map(t => '<span class="bg-fill text-label-2 text-caption px-2 py-0.5 rounded-md">#' + esc(t) + '</span>').join('') + '</div>';
  if (post.type === 'personal' && post.feedback) body += '<p><span class="text-footnote font-semibold px-2.5 py-0.5 rounded-full bg-applePurple/10 text-purpleText">Feedback wanted</span></p>';
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

  return '<article id="post-' + post.id + '" data-post="' + post.id + '" data-compact="' + (compact ? 1 : 0) + '" class="card p-5 space-y-3 scroll-mt-24">' + authorBlock(post) + body + footer + '</article>';
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

// ----- Sidebar -----
function renderFeedSidebar() {
  const box = $('feed-sidebar');
  if (!box || !demo) return;
  const me = memberView('me');
  const posts = allPosts().filter(p => p.type === 'work');
  const picks = posts.filter(p => !isMine(p) && !onTeam(p) && !demo.applications[p.id] && projectStatus(p) === 'open')
    .map(p => ({ p, fit: projectFit(p, me) })).filter(x => !x.fit.blocked).sort((a, b) => b.fit.score - a.fit.score).slice(0, 3);
  const mineRows = posts.filter(p => isMine(p) || onTeam(p) || demo.applications[p.id]).map(p => {
    const st = projectStatus(p);
    const app = demo.applications[p.id];
    const label = isMine(p) ? (st === 'open' ? 'Your post · ' + projectApplicantList(p).filter(a => a.status === 'applied').length + ' to review' : statusLabel(st)) :
      app && app.status === 'applied' ? 'Applied · waiting' : statusLabel(st);
    return '<li><button type="button" class="w-full text-left rounded-xl px-2 py-2 hover:bg-fill" data-on-click="' + (isMine(p) ? 'openManage(\'' + p.id + '\')' : 'scrollToPost(\'' + p.id + '\')') + '">' +
      '<span class="block font-semibold text-subhead truncate">' + esc(p.title) + '</span><span class="block text-footnote text-label-2">' + esc(label) + '</span></button></li>';
  });
  box.innerHTML =
    '<div class="card p-4 space-y-2"><div class="flex items-baseline justify-between px-1"><h3 class="font-semibold text-body">Projects for you</h3><button type="button" class="text-footnote font-semibold text-blueText hover:underline" data-on-click="showProjectMatches()">See all</button></div>' +
      (picks.length ? '<ul>' + picks.map(({ p, fit }) => '<li><button type="button" class="w-full text-left rounded-xl px-2 py-2 hover:bg-fill" data-on-click="scrollToPost(\'' + p.id + '\')">' +
        '<span class="flex items-start justify-between gap-2"><span class="font-semibold text-subhead line-clamp-2">' + esc(p.title) + '</span><span class="shrink-0 text-footnote font-semibold text-greenText tabular-nums">' + fit.score + '%</span></span>' +
        '<span class="block text-footnote text-label-2">' + esc(memberName(p.author)) + ' · ' + esc(payLabel(p.pay)) + ' · ' + esc(p.hours) + ' hrs/wk</span></button></li>').join('') + '</ul>'
        : '<p class="text-footnote text-label-2 px-1">No open projects match your profile right now. Add skills you want to learn to see stretch projects.</p>') + '</div>' +
    '<div class="card p-4 space-y-2"><h3 class="font-semibold text-body px-1">Your projects</h3>' +
      (mineRows.length ? '<ul>' + mineRows.join('') + '</ul>' : '<p class="text-footnote text-label-2 px-1">Post a project or apply to one to see it here.</p>') + '</div>' +
    '<div class="card p-4 flex items-center justify-between gap-3"><div><p class="font-semibold text-body">Verified experience</p><p class="text-footnote text-label-2">' + demo.verified.length + ' completed project' + (demo.verified.length === 1 ? '' : 's') + '</p></div>' +
      '<button type="button" class="btn btn-gray btn-sm" data-on-click="openVerifiedExperience()">View</button></div>';
}

// ----- Matchmaker: Projects / People -----
function setMatchmakerView(v) { mmView = v; renderMatchmaker(); }
function showProjectMatches() { switchTab('matching'); setMatchmakerView('projects'); }

function renderMatchmaker() {
  if (!demo || !$('mm-view')) return;
  document.querySelectorAll('#mm-view [data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === mmView));
  $('people-view').classList.toggle('hidden', mmView !== 'people');
  $('projects-view').classList.toggle('hidden', mmView !== 'projects');
  if (mmView === 'people') return renderPeople();
  const me = memberView('me');
  const open = allPosts().filter(p => p.type === 'work' && !isMine(p) && !onTeam(p) && projectStatus(p) === 'open').map(p => ({ p, fit: projectFit(p, me) }));
  const fits = open.filter(x => !x.fit.blocked).sort((a, b) => b.fit.score - a.fit.score);
  const blocked = open.filter(x => x.fit.blocked);
  $('projects-view').innerHTML =
    (fits.length ? '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">' + fits.map(x => renderPost(x.p, { compact: true })).join('') + '</div>'
      : '<div class="card p-6 text-subhead text-label-2">No open projects fit your profile right now. Try adding skills you want to learn or widening the pay types you\'re open to.</div>') +
    (blocked.length ? '<details class="group"><summary class="cursor-pointer list-none flex items-center gap-1 font-semibold text-subhead text-label-2 min-h-[44px]"><svg class="icon w-4 h-4 transition group-open:rotate-90"><use href="#i-chevron"/></svg>Not a fit right now (' + blocked.length + ')</summary>' +
      '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">' + blocked.map(x => renderPost(x.p, { compact: true })).join('') + '</div></details>' : '');
}

// ----- Composer -----
const COMPOSER_COPY = {
  work: { title: 'Project title', titlePh: 'e.g. Booking page for 3 pilot restaurants', body: 'What is the project?', bodyPh: 'The problem, who it\'s for, and what\'s already done.' },
  resource: { title: 'Title', titlePh: 'e.g. Unit economics template', body: 'Why it\'s useful', bodyPh: 'What it helped you with and who should read it.' },
  personal: { title: 'Project name', titlePh: 'e.g. StudySprint v2', body: 'What did you build?', bodyPh: 'What it does, what you learned, and what feedback you want.' },
  support: { title: 'Your question', titlePh: 'e.g. How should I price a pilot?', body: 'Details', bodyPh: 'Context that helps people answer.' },
  community: { title: 'Title (optional)', titlePh: 'e.g. Demo Day practice run', body: 'Message', bodyPh: 'Share an update or announcement with the community.' },
};

function openComposer(type) {
  const me = memberView('me');
  cp = { type: POST_TYPES[type] ? type : 'community', attachments: [], posted: false, roles: [{ track: me.track || 'Software Developer', count: 1, skills: '' }] };
  sheetOnClose = discardComposer;
  openSheet(
    '<form id="composer" class="relative p-5 sm:p-7 space-y-4" data-on-submit="submitPost(event)" novalidate>' + sheetClose() +
      '<h2 id="sheet-title" class="text-title3 font-bold pr-10">Create a post</h2>' +
      '<fieldset><legend class="pf-label">Post type</legend><div class="flex flex-wrap gap-2">' +
        Object.entries(POST_TYPES).map(([k, t]) => '<label class="cursor-pointer"><input type="radio" class="peer sr-only" name="cp-type" value="' + k + '"' + (k === cp.type ? ' checked' : '') + ' data-on-change="setComposerType(this.value)">' +
          '<span class="chip gap-1.5"><svg class="icon w-4 h-4"><use href="#' + t.icon + '"/></svg>' + t.label + '</span></label>').join('') + '</div></fieldset>' +
      '<div><label for="cp-title" id="cp-title-label" class="pf-label"></label><input id="cp-title" class="pf-input" maxlength="120"><p id="cp-title-error" class="pf-error hidden"></p></div>' +
      '<div><label for="cp-body" id="cp-body-label" class="pf-label"></label><textarea id="cp-body" rows="4" maxlength="2000" class="pf-input resize-y"></textarea><p id="cp-body-error" class="pf-error hidden"></p></div>' +
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
      '<div class="flex justify-end gap-2 pt-1"><button type="button" class="btn btn-gray btn-sm" data-on-click="closeSheet()">Cancel</button><button id="cp-submit" type="submit" class="btn btn-primary btn-sm">Post</button></div>' +
    '</form>', 'composer', { wide: true });
  const form = $('composer');
  form.addEventListener('input', e => {
    if (!e.target.id) return;
    e.target.classList.remove('invalid');
    $(e.target.id + '-error')?.classList.add('hidden');
    if (e.target.id.startsWith('cp-role-skills')) $('cp-roles-error')?.classList.add('hidden');
  });
  form.addEventListener('dragover', e => { e.preventDefault(); form.classList.add('ring-4', 'ring-appleBlue/30'); });
  form.addEventListener('dragleave', e => { if (e.target === form) form.classList.remove('ring-4', 'ring-appleBlue/30'); });
  form.addEventListener('drop', e => { e.preventDefault(); form.classList.remove('ring-4', 'ring-appleBlue/30'); addComposerFiles(e.dataTransfer.files); });
  setComposerType(cp.type);
  $('cp-title').focus();
}

function setComposerType(type) {
  syncRoles();
  cp.type = type;
  const copy = COMPOSER_COPY[type];
  $('cp-title-label').textContent = copy.title; $('cp-title').placeholder = copy.titlePh;
  $('cp-body-label').textContent = copy.body; $('cp-body').placeholder = copy.bodyPh;
  ['cp-title', 'cp-body'].forEach(id => { $(id).classList.remove('invalid'); $(id + '-error').classList.add('hidden'); });
  const f = $('cp-type-fields');
  if (type === 'work') {
    f.innerHTML =
      '<div><p class="pf-label">Roles needed</p><div id="cp-roles" class="space-y-2"></div>' +
        '<button type="button" class="btn btn-plain btn-sm -ml-2 mt-1" data-on-click="addRole()"><svg class="icon w-4 h-4"><use href="#i-plus"/></svg>Add role</button><p id="cp-roles-error" class="pf-error hidden"></p></div>' +
      '<fieldset><legend class="pf-label">Hours per week</legend><div class="flex flex-wrap gap-2">' + HOURS.map((h, i) => '<label class="cursor-pointer"><input type="radio" class="peer sr-only" name="cp-hours" value="' + h + '"' + (i === 1 ? ' checked' : '') + '><span class="chip">' + h + '</span></label>').join('') + '</div></fieldset>' +
      '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">' +
        '<div><label for="cp-weeks" class="pf-label">Duration (weeks)</label><input id="cp-weeks" type="number" min="1" max="26" value="4" class="pf-input"></div>' +
        '<div><label for="cp-setting" class="pf-label">Work setting</label><select id="cp-setting" class="pf-input">' + SETTINGS.map(s => '<option>' + s + '</option>').join('') + '</select></div>' +
        '<div class="col-span-2 sm:col-span-1"><label for="cp-industry" class="pf-label">Industry</label><select id="cp-industry" class="pf-input">' + INDUSTRIES.map(s => '<option>' + s + '</option>').join('') + '</select></div>' +
      '</div>' +
      '<fieldset><legend class="pf-label">Pay</legend><div class="flex flex-wrap gap-2">' + Object.entries(PAY_TYPES).map(([k, t], i) => '<label class="cursor-pointer"><input type="radio" class="peer sr-only" name="cp-pay" value="' + k + '"' + (i === 0 ? ' checked' : '') + ' data-on-change="onPayTypeChange(this)"><span class="chip">' + t.label + '</span></label>').join('') + '</div>' +
        '<div id="cp-amount-wrap" class="mt-2 sm:w-2/3"><label for="cp-amount" class="pf-label">Fixed fee</label><div class="flex gap-2">' +
          '<label for="cp-currency" class="sr-only">Currency</label><select id="cp-currency" class="pf-input !w-auto shrink-0">' + CURRENCIES.map(([c, l]) => '<option value="' + c + '"' + (c === 'GBP' ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>' +
          '<input id="cp-amount" type="number" min="1" step="1" placeholder="e.g. 750" class="pf-input"></div><p id="cp-amount-error" class="pf-error hidden"></p></div></fieldset>' +
      '<div><label for="cp-deliverable" class="pf-label">Deliverable</label><input id="cp-deliverable" class="pf-input" maxlength="200" placeholder="What exists when the project is done?"><p id="cp-deliverable-error" class="pf-error hidden"></p></div>';
    renderRoles();
  } else if (type === 'resource') {
    f.innerHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label for="cp-kind" class="pf-label">Kind</label><select id="cp-kind" class="pf-input">' + ['Link', 'Doc', 'Video', 'Screenshot', 'Other'].map(k => '<option>' + k + '</option>').join('') + '</select></div>' +
      '<div><label for="cp-tags" class="pf-label">Tags</label><input id="cp-tags" class="pf-input" placeholder="e.g. Pitch decks, SQL"></div></div>';
  } else if (type === 'personal') {
    f.innerHTML = '<label class="flex items-center gap-2.5 text-subhead cursor-pointer"><input id="cp-feedback" type="checkbox" class="w-[18px] h-[18px]" checked> I\'d like feedback on this</label>';
  } else {
    f.innerHTML = '';
  }
}

function syncRoles() {
  if (!cp || !$('cp-roles')) return;
  cp.roles = [...$('cp-roles').querySelectorAll('[data-role]')].map(row => ({
    track: row.querySelector('select[data-f="track"]').value,
    count: Number(row.querySelector('select[data-f="count"]').value),
    skills: row.querySelector('input[data-f="skills"]').value,
  }));
}
function renderRoles() {
  $('cp-roles').innerHTML = cp.roles.map((r, i) =>
    '<div data-role class="entry !p-3 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_2fr_auto] gap-2 items-end">' +
      '<div><label for="cp-role-track-' + i + '" class="pf-hint">Track</label><select id="cp-role-track-' + i + '" data-f="track" class="pf-input !min-h-[38px] !py-1.5 !text-subhead">' +
        ['Software Developer', 'Business Developer'].map(t => '<option value="' + t + '"' + (t === r.track ? ' selected' : '') + '>' + shortTrack(t) + '</option>').join('') + '</select></div>' +
      '<div><label for="cp-role-count-' + i + '" class="pf-hint">People</label><select id="cp-role-count-' + i + '" data-f="count" class="pf-input !min-h-[38px] !py-1.5 !text-subhead">' + [1, 2, 3].map(n => '<option' + (n === r.count ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div>' +
      '<div class="col-span-2 sm:col-span-1"><label for="cp-role-skills-' + i + '" class="pf-hint">Skills (comma-separated)</label><input id="cp-role-skills-' + i + '" data-f="skills" class="pf-input !min-h-[38px] !py-1.5 !text-subhead" value="' + esc(r.skills) + '" placeholder="' + esc(SKILL_SUGGESTIONS[r.track].slice(0, 3).join(', ')) + '"></div>' +
      (cp.roles.length > 1 ? '<button type="button" class="btn btn-plain btn-sm !text-redText col-span-2 sm:col-span-1 justify-self-end" data-on-click="removeRole(' + i + ')">Remove</button>' : '<span class="hidden sm:block"></span>') +
    '</div>').join('');
}
function addRole() { syncRoles(); if (cp.roles.length >= 4) return; cp.roles.push({ track: cp.roles[0].track === 'Software Developer' ? 'Business Developer' : 'Software Developer', count: 1, skills: '' }); renderRoles(); }
function removeRole(i) { syncRoles(); cp.roles.splice(i, 1); renderRoles(); }

function attError(msg) { const el = $('cp-att-error'); el.textContent = msg; el.classList.toggle('hidden', !msg); }

// File inputs: add the chosen files, then clear the input so the same file can be chosen again
function addComposerFilesFromInput(input) { addComposerFiles(input.files); input.value = ''; }

// The fixed fee field only applies to paid projects
function onPayTypeChange(input) { $('cp-amount-wrap').classList.toggle('hidden', input.value !== 'Paid'); }

// Open Profile and scroll to Verified experience once the tab has rendered
function openVerifiedExperience() { switchTab('profile'); setTimeout(() => goToSection('verified'), 50); }

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
      cp.attachments[cp.attachments.indexOf(placeholder)] = att;
    } catch (e) {
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
function removeComposerAtt(id) {
  const att = cp.attachments.find(a => a.id === id);
  if (att && att.kind !== 'link') idbDelete(id);
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

function discardComposer() {
  if (cp && !cp.posted) cp.attachments.filter(a => a.kind !== 'link' && a.kind !== 'pending').forEach(a => idbDelete(a.id));
  cp = null;
}

function cpError(id, msg) {
  const el = $(id + '-error');
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  $(id)?.classList.add('invalid');
}

function submitPost(e) {
  e.preventDefault();
  if (cp.attachments.some(a => a.kind === 'pending')) return attError('Wait for your files to finish adding.');
  syncRoles();
  ['cp-title', 'cp-body', 'cp-deliverable', 'cp-amount'].forEach(id => { $(id)?.classList.remove('invalid'); $(id + '-error')?.classList.add('hidden'); });
  $('cp-roles-error')?.classList.add('hidden');
  const type = cp.type;
  const title = $('cp-title').value.trim();
  const body = $('cp-body').value.trim();
  const bad = [];
  if (type !== 'community' && !title) { cpError('cp-title', type === 'support' ? 'Write your question.' : 'Add a title.'); bad.push('cp-title'); }
  if ((type === 'community' || type === 'work') && !body) { cpError('cp-body', type === 'work' ? 'Describe the project.' : 'Write a message.'); bad.push('cp-body'); }
  const post = { id: 'u-' + Date.now().toString(36), type, author: 'me', ts: Date.now(), title, body, attachments: cp.attachments, likes: 0, comments: [] };
  if (type === 'work') {
    const roles = cp.roles.map(r => ({ track: r.track, count: r.count, skills: r.skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8) })).filter(r => r.skills.length);
    if (!roles.length) { $('cp-roles-error').textContent = 'Add at least one role with the skills it needs.'; $('cp-roles-error').classList.remove('hidden'); bad.push('cp-roles'); }
    const pay = document.querySelector('input[name="cp-pay"]:checked').value;
    const amount = Number($('cp-amount').value);
    if (pay === 'Paid' && !(amount > 0)) { cpError('cp-amount', 'Enter the fixed fee.'); bad.push('cp-amount'); }
    const deliverable = $('cp-deliverable').value.trim();
    if (!deliverable) { cpError('cp-deliverable', 'Say what will exist when the project is done.'); bad.push('cp-deliverable'); }
    Object.assign(post, {
      roles, hours: document.querySelector('input[name="cp-hours"]:checked').value,
      weeks: Math.min(26, Math.max(1, Number($('cp-weeks').value) || 4)), setting: $('cp-setting').value, industry: $('cp-industry').value,
      pay: pay === 'Paid' ? { type: pay, amount, currency: $('cp-currency').value } : { type: pay }, deliverable, status: 'open', team: ['me'], applicants: 0,
    });
  } else if (type === 'resource') {
    Object.assign(post, { kind: $('cp-kind').value, tags: $('cp-tags').value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6), saves: 0 });
  } else if (type === 'personal') {
    post.feedback = $('cp-feedback').checked;
  } else if (type === 'support') {
    post.solved = false;
  }
  if (bad.length) { (bad[0] === 'cp-roles' ? $('cp-roles') : $(bad[0])).scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

  demo.posts.unshift(post);
  cp.posted = true;
  if (!saveDemo()) { demo.posts.shift(); cp.posted = false; return attError("Couldn't save. This browser's storage is full."); }
  closeSheet();
  if (feedFilter !== 'foryou' && feedFilter !== 'all' && feedFilter !== type) feedFilter = 'all';
  switchTab('feed');
  renderFeed();
  renderFeedSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (type === 'work') { showToast('Project posted. Matching members are being notified.'); scheduleApplicants(post); }
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
