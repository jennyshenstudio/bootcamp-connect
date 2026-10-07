// Bootcamp Connect prototype: project loop (specs/07-project-loop.md).
// Plain script (shared globals); load order is set in prototype.html.
// Apply → team forms → project chat → mark complete → ratings and endorsements → verified experience.

// ----- Post and project state -----
const nowYM = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const postRank = p => p.ts || p.rank;
function allPosts() { return demo.posts.concat(DEMO_POSTS).sort((a, b) => postRank(b) - postRank(a)); }
function postById(id) { return (demo && demo.posts.find(p => p.id === id)) || DEMO_POSTS.find(p => p.id === id); }
const projectState = post => demo.projects[post.id] || {};
const projectStatus = post => projectState(post).status || post.status;
const projectTeam = post => projectState(post).team || post.team;
const projectApplicantList = post => (projectState(post).applicants || []).filter(a => a.status !== 'declined' && !projectTeam(post).includes(a.id));
const projectApplicants = post => (post.applicants || 0) + (demo.applications[post.id] ? 1 : 0) + (projectState(post).applicants || []).length;
const isMine = post => post.author === 'me';
const onTeam = post => projectTeam(post).includes('me');
function setProject(post, patch) { demo.projects[post.id] = { ...projectState(post), ...patch }; saveDemo(); }

function memberName(id, full) {
  if (id === 'me') { const a = currentAccount() || {}; return full ? ((a.first || '') + ' ' + (a.last || '')).trim() || 'You' : a.first || 'You'; }
  const p = person(id);
  return full ? fullName(p) : p.first;
}
function memberAvatar(id, cls) { return id === 'me' ? myAvatar(cls) : personAvatar(person(id), cls); }
function shortTitle(post) { return post.title.length > 42 ? post.title.slice(0, 40).trim() + '…' : post.title; }
function payLabel(pay) { return pay.type === 'Paid' ? 'Paid · $' + Number(pay.amount || 0).toLocaleString('en') : PAY_TYPES[pay.type].short; }

function refreshProjectViews() {
  renderFeed();
  renderFeedSidebar();
  renderMatchmaker();
  renderVerified();
}

// ----- Project chats -----
function systemMsg(text) { return { from: 'system', day: 'Today', time: fmtTime(new Date()), ts: Date.now(), text }; }

function ensureProjectChat(post, intro) {
  const existing = post.chatId || projectState(post).chatId;
  if (existing && allChats().some(c => c.id === existing)) return existing;
  const ownerColors = post.author === 'me' ? ['#0A84FF', '#BF5AF2'] : person(post.author).colors;
  const chat = {
    id: 'p-' + post.id, type: 'group', name: shortTitle(post), colors: ownerColors,
    members: projectTeam(post).filter(id => id !== 'me'), project: post.id, unread: 1, rank: Date.now(),
    messages: intro,
  };
  demo.projectChats.push(chat);
  demo.unread[chat.id] = 1;
  setProject(post, { chatId: chat.id });
  return chat.id;
}
function postToProjectChat(post, msg) {
  const id = post.chatId || projectState(post).chatId;
  if (!id) return;
  (demo.sent[id] = demo.sent[id] || []).push(msg);
  saveDemo();
}

// ----- Applying to someone else's project -----
function openApply(postId) {
  const post = postById(postId);
  const fit = projectFit(post, memberView('me'));
  const owner = person(post.author);
  openSheet(
    '<form class="relative p-5 sm:p-7 space-y-4" onsubmit="submitApplication(event, \'' + post.id + '\')">' + sheetClose() +
      '<div class="pr-10"><p class="text-footnote text-label-2">Apply to ' + esc(owner.first) + '\'s project</p><h2 id="sheet-title" class="text-title3 font-bold">' + esc(post.title) + '</h2></div>' +
      fitBox(fit) +
      '<div><label for="apply-note" class="pf-label">Note to ' + esc(owner.first) + ' (optional)</label>' +
      '<textarea id="apply-note" rows="4" maxlength="500" class="pf-input resize-y" placeholder="Why you\'re a good fit, what you want to learn, and when you can start."></textarea></div>' +
      '<div class="flex justify-end gap-2"><button type="button" class="btn btn-gray btn-sm" onclick="closeSheet()">Cancel</button><button type="submit" class="btn btn-primary btn-sm">Send application</button></div>' +
    '</form>', '');
  $('apply-note').focus();
}

function submitApplication(e, postId) {
  e.preventDefault();
  const post = postById(postId);
  const owner = person(post.author);
  demo.applications[postId] = { status: 'applied', note: $('apply-note').value.trim(), at: Date.now() };
  saveDemo();
  closeSheet();
  refreshProjectViews();
  showToast('Application sent to ' + owner.first);
  // Demo: the owner accepts after a moment
  setTimeout(() => {
    if (!demo.applications[postId] || demo.applications[postId].status !== 'applied') return;
    demo.applications[postId].status = 'accepted';
    const role = projectFit(post, memberView('me')).role;
    setProject(post, { team: projectTeam(post).concat('me'), status: 'in-progress', started: projectState(post).started || nowYM() });
    ensureProjectChat(post, [
      systemMsg(memberName('me') + ' joined the team' + (role ? ' as ' + shortTrack(role.track) : '') + '. Deliverable: ' + post.deliverable),
      { from: post.author, day: 'Today', time: fmtTime(new Date()), ts: Date.now() + 1, text: 'Welcome aboard, ' + memberName('me') + '! Kickoff call tomorrow at 6pm? I\'ll share the brief here.' },
    ]);
    refreshProjectViews();
    renderChatList();
    updateBadge();
    showToast(owner.first + ' accepted you onto "' + shortTitle(post) + '". Say hi in the project chat.');
  }, 2500);
}

// ----- Owning a project -----
const APPLY_NOTES = [
  (p, s, l) => 'Hi! I\'d love to help. I\'ve worked with ' + s + ' and this would be a great chance to practise ' + l + '.',
  (p, s, l) => 'This sounds great. I can commit the hours and I\'m strong in ' + s + '. Keen to learn ' + l + ' along the way.',
  (p, s, l) => 'Count me in! ' + s + ' is my strongest skill, and I want more portfolio work in this area.',
];

// Demo: the best-fitting sample members apply to your new project over a few seconds
function scheduleApplicants(post) {
  const ranked = DEMO_PEOPLE
    .map(p => ({ p, fit: projectFit(post, memberView(p.id)) }))
    .filter(x => !x.fit.blocked)
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, 3);
  ranked.forEach(({ p, fit }, i) => setTimeout(() => {
    if (!demo || !postById(post.id)) return;
    const st = projectState(post);
    const skill = fit.has[0] || p.skills[0];
    const learn = fit.learn[0] || (p.learn[0] || 'something new');
    setProject(post, { applicants: (st.applicants || []).concat({ id: p.id, status: 'applied', at: Date.now(), note: APPLY_NOTES[i % 3](p, skill, learn) }) });
    refreshProjectViews();
    if (!$('sheet').classList.contains('hidden') && $('sheet').dataset.person === 'manage:' + post.id) openManage(post.id, { keepFocus: true });
    showToast(p.first + ' applied to "' + shortTitle(post) + '"');
  }, 2500 * (i + 1)));
}

function respondToApplicant(postId, id, accept) {
  const post = postById(postId);
  const st = projectState(post);
  const applicants = (st.applicants || []).map(a => a.id === id ? { ...a, status: accept ? 'accepted' : 'declined' } : a);
  setProject(post, { applicants, team: accept ? projectTeam(post).concat(id) : projectTeam(post) });
  if (accept) postToProjectChat(post, systemMsg(memberName(id) + ' joined the team.'));
  if (accept && projectState(post).chatId) {
    const chat = allChats().find(c => c.id === projectState(post).chatId);
    if (chat && !chat.members.includes(id)) { chat.members.push(id); saveDemo(); }
  }
  refreshProjectViews();
  openManage(postId, { keepFocus: true });
  showToast(accept ? memberName(id) + ' is on the team' : 'Application declined');
}

function inviteMember(postId, id) {
  const post = postById(postId);
  setProject(post, { invited: (projectState(post).invited || []).concat(id) });
  openManage(postId, { keepFocus: true });
  showToast('Invite sent to ' + memberName(id));
  setTimeout(() => {
    const st = projectState(post);
    if (projectTeam(post).includes(id)) return;
    setProject(post, { invited: (st.invited || []).filter(x => x !== id), team: projectTeam(post).concat(id) });
    postToProjectChat(post, systemMsg(memberName(id) + ' accepted the invite and joined the team.'));
    refreshProjectViews();
    if (!$('sheet').classList.contains('hidden') && $('sheet').dataset.person === 'manage:' + postId) openManage(postId, { keepFocus: true });
    showToast(memberName(id) + ' accepted your invite');
  }, 1800);
}

function startProject(postId) {
  const post = postById(postId);
  setProject(post, { status: 'in-progress', started: nowYM() });
  const chatId = ensureProjectChat(post, [
    systemMsg('Project started by ' + memberName('me') + '. Team: ' + projectTeam(post).map(id => memberName(id)).join(', ') + '.'),
    systemMsg('Deliverable: ' + post.deliverable),
  ]);
  closeSheet();
  refreshProjectViews();
  goToChat(chatId);
  showToast('Project started. Your team chat is ready.');
}

function fitBox(fit) {
  if (fit.blocked) return '<div class="entry !bg-appleOrange/10 space-y-1"><p class="font-semibold text-subhead text-orangeText">Not a fit right now</p>' +
    fit.blockers.map(b => '<p class="text-footnote text-label-2">' + esc(b) + '</p>').join('') + '</div>';
  return '<div class="entry !bg-appleGreen/10 space-y-1.5"><p class="font-semibold text-subhead"><span class="text-greenText tabular-nums">' + fit.score + '% fit</span> for you</p>' +
    '<ul class="space-y-1">' + fit.reasons.slice(0, 4).map(r => '<li class="flex items-start gap-2 text-footnote text-label-2"><svg class="icon w-4 h-4 text-greenText mt-px"><use href="#i-check"/></svg>' + esc(r) + '</li>').join('') + '</ul></div>';
}

function openManage(postId, { keepFocus = false } = {}) {
  const post = postById(postId);
  const status = projectStatus(post);
  const team = projectTeam(post);
  const applicants = projectApplicantList(post);
  const invited = projectState(post).invited || [];
  const suggestions = suggestTeam(post).filter(s => !invited.includes(s.person.id));
  const personRow = (id, right, sub) => '<li class="flex items-center gap-3 py-2">' +
    '<button type="button" class="tap rounded-full" onclick="openPerson(\'' + id + '\')" aria-label="View ' + esc(memberName(id, true)) + '">' + memberAvatar(id, 'w-10 h-10 text-subhead') + '</button>' +
    '<div class="min-w-0 flex-1"><p class="font-semibold text-subhead">' + esc(memberName(id, true)) + (id === 'me' ? ' <span class="text-label-2 font-normal">(you)</span>' : '') + '</p>' + (sub || '') + '</div>' + (right || '') + '</li>';
  const fitLine = id => { const f = projectFit(post, memberView(id)); return '<p class="text-footnote text-label-2"><span class="text-greenText font-semibold">' + f.score + '% fit</span> · ' + esc(f.reasons[0] || shortTrack(memberTrack(id))) + '</p>'; };

  const html = '<div class="relative p-5 sm:p-7 space-y-5">' + sheetClose() +
    '<div class="pr-10"><p class="text-footnote text-label-2">Manage project · ' + esc(statusLabel(status)) + '</p><h2 id="sheet-title" class="text-title3 font-bold">' + esc(post.title) + '</h2></div>' +
    '<section class="space-y-1"><h3 class="font-semibold text-body">Team (' + team.length + ')</h3><ul class="divide-y divide-[var(--hairline)]">' +
      team.map(id => personRow(id, '', '<p class="text-footnote text-label-2">' + (id === post.author ? 'Project lead' : shortTrack(memberTrack(id))) + '</p>')).join('') + '</ul></section>' +
    (status !== 'completed' ? '<section class="space-y-1"><h3 class="font-semibold text-body">Applicants' + (applicants.length ? ' (' + applicants.length + ')' : '') + '</h3>' +
      (applicants.length ? '<ul class="divide-y divide-[var(--hairline)]">' + applicants.map(a => personRow(a.id,
        '<div class="flex gap-1.5 shrink-0"><button type="button" class="btn btn-gray btn-sm" onclick="respondToApplicant(\'' + post.id + '\', \'' + a.id + '\', false)">Decline</button><button type="button" class="btn btn-primary btn-sm" onclick="respondToApplicant(\'' + post.id + '\', \'' + a.id + '\', true)">Accept</button></div>',
        fitLine(a.id) + (a.note ? '<p class="text-footnote text-label mt-1">"' + esc(a.note) + '"</p>' : ''))).join('') + '</ul>'
        : '<p class="text-footnote text-label-2">No applicants yet. Matching members are notified about new projects.</p>') + '</section>' : '') +
    (status !== 'completed' && (suggestions.length || invited.length) ? '<section class="space-y-1"><h3 class="font-semibold text-body">Suggested team</h3><p class="text-footnote text-label-2">Picked to cover every open role with the strongest fit for each.</p><ul class="divide-y divide-[var(--hairline)]">' +
      suggestions.map(s => personRow(s.person.id, '<button type="button" class="btn btn-secondary btn-sm shrink-0" onclick="inviteMember(\'' + post.id + '\', \'' + s.person.id + '\')">Invite</button>',
        '<p class="text-footnote text-label-2">For the ' + esc(shortTrack(s.role.track)) + ' role · <span class="text-greenText font-semibold">' + s.fit.score + '% fit</span></p>')).join('') +
      invited.map(id => personRow(id, '<span class="text-footnote text-label-2 shrink-0">Invited</span>', '')).join('') + '</ul></section>' : '') +
    '<div class="flex flex-wrap justify-end gap-2 pt-1">' +
      (status === 'open' ? '<button type="button" class="btn btn-primary btn-sm"' + (team.length < 2 ? ' disabled aria-disabled="true" title="Add at least one teammate first"' : '') + ' onclick="startProject(\'' + post.id + '\')">Start project</button>' : '') +
      (status === 'in-progress' ? '<button type="button" class="btn btn-gray btn-sm" onclick="closeSheet(); goToChat(\'' + (post.chatId || projectState(post).chatId) + '\')">Open project chat</button><button type="button" class="btn btn-primary btn-sm" onclick="openComplete(\'' + post.id + '\')">Mark complete</button>' : '') +
    '</div></div>';
  openSheet(html, 'manage:' + post.id);
  if (!keepFocus) $('sheet-close').focus();
}

function statusLabel(s) { return s === 'in-progress' ? 'In progress' : s === 'completed' ? 'Completed' : 'Open'; }

// ----- Completing a project -----
function openComplete(postId) {
  const post = postById(postId);
  const mates = projectTeam(post).filter(id => id !== 'me');
  const rows = mates.map(id => {
    const p = person(id);
    const skills = p.skills.slice(0, 6);
    return '<li class="entry space-y-2.5">' +
      '<div class="flex items-center gap-3">' + personAvatar(p, 'w-10 h-10 text-subhead') + '<div><p class="font-semibold text-subhead">' + esc(fullName(p)) + '</p><p class="text-footnote text-label-2">' + esc(shortTrack(p.track)) + '</p></div></div>' +
      '<fieldset><legend class="pf-label">Rating</legend><div class="flex gap-1" role="radiogroup">' +
        [1, 2, 3, 4, 5].map(n => '<label class="cursor-pointer"><input type="radio" class="sr-only peer" name="rate-' + id + '" value="' + n + '"' + (n === 5 ? ' checked' : '') + '>' +
          '<span class="star text-title2 leading-none px-0.5" aria-label="' + n + ' star' + (n > 1 ? 's' : '') + '">★</span></label>').join('') + '</div></fieldset>' +
      '<fieldset><legend class="pf-label">Endorse up to 3 skills</legend><div class="flex flex-wrap gap-1.5">' +
        skills.map((s, i) => '<label class="cursor-pointer"><input type="checkbox" class="peer sr-only" name="endorse-' + id + '" value="' + esc(s) + '"' + (i === 0 ? ' checked' : '') + ' onchange="limitEndorse(this)"><span class="chip !min-h-[28px] !text-footnote">' + esc(s) + '</span></label>').join('') +
      '</div></fieldset></li>';
  }).join('');
  openSheet(
    '<form class="relative p-5 sm:p-7 space-y-4" onsubmit="completeProject(event, \'' + post.id + '\')">' + sheetClose() +
      '<div class="pr-10"><p class="text-footnote text-label-2">Mark complete</p><h2 id="sheet-title" class="text-title3 font-bold">' + esc(post.title) + '</h2>' +
      '<p class="text-footnote text-label-2 mt-1">Deliverable: ' + esc(post.deliverable) + '</p></div>' +
      '<p class="text-subhead">Rate your teammates and endorse what they did well. Everyone on the team gets this project as <strong>verified experience</strong> on their profile.</p>' +
      '<ul class="space-y-3">' + rows + '</ul>' +
      '<div><label for="complete-note" class="pf-label">What did you deliver? (optional)</label><textarea id="complete-note" rows="3" maxlength="400" class="pf-input resize-y" placeholder="e.g. Shipped the booking page; 3 restaurants live, no-shows down 40%."></textarea></div>' +
      '<div class="flex justify-end gap-2"><button type="button" class="btn btn-gray btn-sm" onclick="closeSheet()">Cancel</button><button type="submit" class="btn btn-primary btn-sm">Complete project</button></div>' +
    '</form>', '');
  $('sheet-close').focus();
}

function limitEndorse(box) {
  const group = document.querySelectorAll('input[name="' + box.name + '"]:checked');
  if (group.length > 3) { box.checked = false; showToast('Endorse up to 3 skills per teammate'); }
}

function completeProject(e, postId) {
  e.preventDefault();
  const post = postById(postId);
  const me = memberView('me');
  const mates = projectTeam(post).filter(id => id !== 'me');
  const given = mates.map(id => ({
    id,
    rating: Number((document.querySelector('input[name="rate-' + id + '"]:checked') || {}).value || 5),
    skills: [...document.querySelectorAll('input[name="endorse-' + id + '"]:checked')].map(b => b.value),
  }));
  // Demo: teammates rate you and endorse skills you used on this project
  const role = projectFit(post, me).role;
  const relevant = overlap(me.skills, (role ? role.skills : post.roles.flatMap(r => r.skills)));
  const pool = relevant.length ? relevant : me.skills.slice(0, 3);
  const received = {};
  mates.forEach((id, i) => {
    const picks = pool.length ? [...new Set([pool[i % pool.length], pool[(i + 1) % pool.length]])] : [];
    picks.forEach(s => { received[s] = (received[s] || 0) + 1; });
  });
  const ratings = mates.map((id, i) => i % 3 === 2 ? 4.6 : 5);
  Object.entries(received).forEach(([s, n]) => { demo.endorsements[s] = (demo.endorsements[s] || 0) + n; });
  const rating = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10 : null;
  demo.verified.unshift({
    postId, title: post.title, owner: post.author,
    role: post.author === 'me' ? 'Project lead' : role ? shortTrack(role.track) : 'Team member',
    with: mates, start: projectState(post).started || post.started || nowYM(), end: nowYM(),
    rating, endorsed: Object.keys(received), note: $('complete-note').value.trim(), given,
  });
  setProject(post, { status: 'completed', completed: nowYM() });
  postToProjectChat(post, systemMsg('Project marked complete 🎉 Verified experience added for everyone on the team.'));
  saveDemo();
  closeSheet();
  refreshProjectViews();
  renderSkills();
  renderChatList();
  showToast('Project completed. Added to your verified experience.');
}

// ----- Verified experience on your profile -----
function verifiedEntryHtml(v, names) {
  const dates = [fmtMonth(v.start), fmtMonth(v.end)].filter(Boolean).join(' – ');
  return '<li class="entry !p-3.5 space-y-1.5">' +
    '<div class="flex items-start justify-between gap-3"><p class="font-semibold text-subhead">' + esc(v.title) + '</p>' +
      '<span class="shrink-0 inline-flex items-center gap-1 text-footnote font-semibold text-greenText"><svg class="icon w-4 h-4"><use href="#i-check"/></svg>Verified</span></div>' +
    '<p class="text-footnote text-label-2">' + esc(v.role) + (v.with.length ? ' · with ' + esc(v.with.map(names).join(', ')) : '') + (dates ? ' · ' + esc(dates) : '') + '</p>' +
    (v.rating ? '<p class="text-footnote"><span class="text-orangeText">★</span> ' + v.rating.toFixed(1) + ' from ' + v.with.length + ' teammate' + (v.with.length === 1 ? '' : 's') + '</p>' : '') +
    (v.note ? '<p class="text-footnote text-label-2">' + esc(v.note) + '</p>' : '') +
    (v.endorsed && v.endorsed.length ? '<div class="flex flex-wrap gap-1">' + v.endorsed.map(s => '<span class="bg-appleGreen/10 text-greenText text-caption font-semibold px-2 py-0.5 rounded-md">' + esc(s) + '</span>').join('') + '</div>' : '') +
  '</li>';
}

function renderVerified() {
  const box = $('verified-list');
  if (!box || !demo) return;
  const items = demo.verified;
  const endorsed = Object.entries(demo.endorsements).sort((a, b) => b[1] - a[1]);
  $('verified-count').textContent = items.length ? items.length + ' verified' : '';
  box.innerHTML = items.length
    ? (endorsed.length ? '<div><p class="pf-label">Endorsed skills</p><div class="flex flex-wrap gap-1.5">' + endorsed.map(([s, n]) => '<span class="chip !cursor-default !min-h-[28px] !text-footnote">' + esc(s) + ' <span class="text-greenText font-semibold ml-1">' + n + '</span></span>').join('') + '</div></div>' : '') +
      '<ul class="space-y-3">' + items.map(v => verifiedEntryHtml(v, id => memberName(id))).join('') + '</ul>'
    : '<div class="entry text-center space-y-2 !py-6"><p class="font-semibold text-subhead">No verified experience yet</p>' +
      '<p class="text-footnote text-label-2">Join a project from the Feed or Connect. When it\'s done, your teammates\' ratings and endorsements appear here.</p>' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="showProjectMatches()">Find a project</button></div>';
}
