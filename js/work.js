// Bootcamp Connect prototype: work to show (specs/11-profile-work-to-show.md, D039)
// Plain script (shared globals); load order is set in index.html.
//
// Each piece of work is a short case study: guided questions worded for the member's track, facts
// that show the level, skills used, tools it was built with, and teammates who confirm it.
// Claude helps write it on the published page; elsewhere it's a plain form.

const MAX_WORK = 6;
const WORK_ON_PROFILE = 3;
const WORK_FACTS = {
  role: { label: 'Your role', options: ['Led', 'Contributed', 'Supported'] },
  team: { label: 'Team size', options: ['Just me', '2 to 3', '4 to 6', '7 or more'] },
  length: { label: 'How long', options: ['Under a month', '1 to 3 months', '3 to 6 months', 'Over 6 months'] },
  reached: { label: 'How far it got', options: ['Idea', 'Prototype', 'Live', 'Earning money'] },
};
const WORK_QUESTIONS = [
  { key: 'problem', label: 'What was the problem?', dev: 'Who had it, and why it mattered.', biz: 'The opportunity or customer problem.' },
  { key: 'role', label: 'What was your role?', dev: 'What you were responsible for.', biz: 'What you were responsible for.' },
  { key: 'did', label: 'What did you do?', dev: 'What you designed and built, and the main choices you made.', biz: 'The research, plans, sales or numbers you worked on.' },
  { key: 'result', label: 'What happened?', dev: 'Is it live? Users, speed, feedback.', biz: 'Results, with numbers where you have them.' },
  { key: 'change', label: 'What would you do differently? (optional)', dev: 'What you learned.', biz: 'What you learned.' },
];
const QUESTION_MAX = 300;
const SUMMARY_MAX = 160;

let workSeq = 0;
const workExtras = {};       // per piece: skills, builtWith, teammates, screenshot (lists the form can't hold)
const workSuggestions = {};  // per piece: what Claude suggested, until the member uses or dismisses it

const isDevTrack = () => !$('pf-track') || $('pf-track').value !== 'Business Developer';

// "Led · team of 4 to 6 · 1 to 3 months · Live"
function factsLine(f) {
  if (!f) return '';
  return [f.role, f.team && (f.team === 'Just me' ? 'just me' : 'team of ' + f.team), f.length && f.length.toLowerCase(), f.reached]
    .filter(Boolean).join(' · ').replace(/^./, c => c.toUpperCase());
}

// ---------- Editor ----------
function loadWork(list) {
  Object.keys(workExtras).forEach(k => delete workExtras[k]);
  Object.keys(workSuggestions).forEach(k => delete workSuggestions[k]);
  $('work-list').innerHTML = '';
  list.forEach(w => appendWork(w, false));
  updateWorkCount();
  updateCounters();
  showAiButtons();
}

function addWork(w) {
  if (document.querySelectorAll('[data-work]').length >= MAX_WORK) { showToast('You can add up to ' + MAX_WORK + ' pieces of work. Remove one to add another.'); return; }
  const uid = appendWork({ ...emptyWork(), ...(w || {}) }, true);
  updateWorkCount();
  updateCounters();
  showAiButtons();
  updatePreview();
  if (!w) $(uid + '-title').focus();
  return uid;
}

function appendWork(w, open) {
  const uid = 'w' + (++workSeq);
  // A lasting id, so a teammate's confirmation finds the right piece even if titles repeat or change
  const id = w.id || 'wk-' + Date.now().toString(36) + '-' + workSeq;
  workExtras[uid] = { id, skills: [...(w.skills || [])], builtWith: [...(w.builtWith || [])], teammates: (w.teammates || []).map(t => ({ ...t })), screenshot: w.screenshot || null };
  $('work-list').insertAdjacentHTML('beforeend', workPieceHtml(uid, w, open));
  renderWorkParts(uid);
  return uid;
}

function workPieceHtml(uid, w, open) {
  const f = w.facts || {};
  const text = (key, label, max, rows, hint) =>
    '<div><div class="flex items-baseline justify-between gap-2"><label for="' + uid + '-' + key + '" class="pf-label">' + label + '</label><span class="pf-hint tabular-nums" data-count-for="' + uid + '-' + key + '">0/' + max + '</span></div>' +
    (hint ? '<p id="' + uid + '-' + key + '-hint" class="pf-hint mb-1.5" data-hint="' + key + '">' + esc(hint) + '</p>' : '') +
    '<textarea id="' + uid + '-' + key + '" data-wf="' + key + '" rows="' + rows + '" maxlength="' + max + '" class="pf-input resize-y"' + (hint ? ' aria-describedby="' + uid + '-' + key + '-hint"' : '') + ' data-on-input="updateCounters()">' + esc(w[key]) + '</textarea></div>';
  const facts = Object.entries(WORK_FACTS).map(([key, { label, options }]) =>
    '<fieldset><legend class="pf-label">' + label + '</legend><div class="flex flex-wrap gap-2">' + options.map((o, i) =>
      '<label class="cursor-pointer"><input type="radio" id="' + uid + '-' + key + '-' + i + '" name="' + uid + '-' + key + '" value="' + esc(o) + '" class="peer sr-only"' + (f[key] === o ? ' checked' : '') + ' data-on-change="updateWorkHeader(this)"><span class="chip">' + esc(o) + '</span></label>').join('') +
    '</div></fieldset>').join('');
  return '<details class="entry space-y-4 group/work" data-work="' + uid + '"' + (open ? ' open' : '') + '>' +
    '<summary class="list-none cursor-pointer flex items-center justify-between gap-3 min-h-[44px]">' +
      '<span class="min-w-0"><span class="block font-semibold text-body" data-work-title>' + esc(w.title || 'New piece of work') + '</span>' +
      '<span class="block pf-hint" data-work-facts>' + esc(factsLine(f)) + '</span></span>' +
      '<svg class="icon w-4 h-4 shrink-0 transition group-open/work:rotate-90" aria-hidden="true"><use href="#i-chevron"/></svg>' +
    '</summary>' +
    '<div class="space-y-4 pt-1">' +
      '<div data-ai-only class="hidden entry !bg-applePurple/10 !p-3 space-y-2">' +
        '<p class="text-footnote text-label-2">Claude can ask you about this work and draft it, or suggest skills from your code or a document. You check everything before it\'s saved.</p>' +
        '<div class="flex flex-wrap gap-2">' +
          '<button type="button" class="btn btn-secondary btn-sm" data-on-click="openWorkInterview(\'' + uid + '\')"><svg class="icon w-4 h-4"><use href="#i-spark"/></svg>Write it with Claude</button>' +
          '<button type="button" class="btn btn-gray btn-sm" data-on-click="suggestFromCode(\'' + uid + '\')">Suggest from code link</button>' +
          '<label for="' + uid + '-doc" class="btn btn-gray btn-sm cursor-pointer">Suggest from a document</label>' +
          '<input id="' + uid + '-doc" type="file" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" class="sr-only" data-on-change="suggestFromDoc(this, \'' + uid + '\')">' +
        '</div>' +
        '<div data-paste class="hidden space-y-2"></div>' +
        '<p data-ai-status class="pf-hint" aria-live="polite"></p>' +
      '</div>' +
      '<div data-suggestions></div>' +
      '<div><label for="' + uid + '-title" class="pf-label">Title *</label><input id="' + uid + '-title" data-wf="title" type="text" maxlength="80" class="pf-input" placeholder="e.g. SplitHouse, a bills app for shared houses" value="' + esc(w.title) + '" data-on-input="updateWorkHeader(this)"><p id="' + uid + '-title-error" class="pf-error hidden">Add a title for this piece of work.</p></div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
        '<div><label for="' + uid + '-link" class="pf-label">Link to the live site, app or document</label><input id="' + uid + '-link" data-wf="link" type="url" inputmode="url" class="pf-input" placeholder="e.g. splithouse.app" value="' + esc(w.link) + '"><p id="' + uid + '-link-error" class="pf-error hidden">Enter a valid link, like splithouse.app.</p></div>' +
        '<div><label for="' + uid + '-code" class="pf-label">Code link (optional)</label><input id="' + uid + '-code" data-wf="code" type="url" inputmode="url" class="pf-input" placeholder="e.g. github.com/you/project" value="' + esc(w.code) + '"><p id="' + uid + '-code-error" class="pf-error hidden">Enter a valid link, like github.com/you/project.</p></div>' +
      '</div>' +
      '<div data-shot></div>' +
      WORK_QUESTIONS.map(q => text(q.key, q.label, QUESTION_MAX, q.key === 'change' ? 2 : 3, isDevTrack() ? q.dev : q.biz)).join('') +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">' + facts + '</div>' +
      text('summary', 'Summary for your profile (optional)', SUMMARY_MAX, 2, 'Two lines shown on your profile. If you leave it blank, your answer to "What happened?" is used.') +
      '<div><p class="pf-label">Skills used</p><p class="pf-hint mb-1.5">Pick from your skills, or add one. Skills used in your work show as proven.</p><div data-wskills class="flex flex-wrap gap-2"></div>' +
        '<div class="flex gap-2 mt-2"><label for="' + uid + '-newskill" class="sr-only">Add a skill used</label><input id="' + uid + '-newskill" type="text" maxlength="30" class="pf-input" placeholder="Add a skill and press Enter" data-on-keydown="onWorkSkillKey(event, \'' + uid + '\')"></div></div>' +
      '<div><label for="' + uid + '-built" class="pf-label">Built with</label><p id="' + uid + '-built-hint" class="pf-hint mb-1.5">Tools and technologies, including AI tools such as Claude Code or Cursor.</p>' +
        '<div class="pf-input flex flex-wrap items-center gap-1.5"><div data-built class="contents"></div><input id="' + uid + '-built" type="text" maxlength="30" aria-describedby="' + uid + '-built-hint" class="flex-1 min-w-[10rem] bg-transparent text-body focus:outline-none" placeholder="Type a tool and press Enter" data-on-keydown="onBuiltKey(event, \'' + uid + '\')"></div></div>' +
      '<div><label for="' + uid + '-mate" class="pf-label">Teammates</label><p id="' + uid + '-mate-hint" class="pf-hint mb-1.5">Tag members who worked on it. They\'re asked to confirm, then it shows on their profile too.</p>' +
        '<div data-mates class="flex flex-wrap gap-2 mb-2"></div>' +
        '<div class="flex gap-2"><select id="' + uid + '-mate" class="pf-input" aria-describedby="' + uid + '-mate-hint"></select><button type="button" class="btn btn-gray btn-sm shrink-0" data-on-click="addTeammate(\'' + uid + '\')">Tag</button></div></div>' +
      '<div class="flex flex-wrap items-center justify-between gap-2 pt-1">' +
        '<div class="flex gap-1">' +
          '<button type="button" class="btn btn-plain btn-sm" data-on-click="moveWork(this, -1)">Move up</button>' +
          '<button type="button" class="btn btn-plain btn-sm" data-on-click="moveWork(this, 1)">Move down</button>' +
        '</div>' +
        '<button type="button" class="text-footnote font-medium text-label-2 hover:text-redText min-h-[44px]" data-on-click="removeWork(this)">Remove this piece</button>' +
      '</div>' +
    '</div>' +
  '</details>';
}

function renderWorkParts(uid) {
  renderWorkSkills(uid); renderBuiltWith(uid); renderTeammates(uid); renderScreenshot(uid); renderSuggestions(uid);
}
const pieceEl = uid => document.querySelector('[data-work="' + uid + '"]');
const pieceOf = el => el.closest('[data-work]').dataset.work;

function updateWorkCount() {
  const n = document.querySelectorAll('[data-work]').length;
  $('work-count').textContent = n + '/' + MAX_WORK;
  $('work-add').disabled = n >= MAX_WORK;
}
function updateWorkHeader(el) {
  const uid = pieceOf(el), piece = readPiece(uid);
  pieceEl(uid).querySelector('[data-work-title]').textContent = piece.title || 'New piece of work';
  pieceEl(uid).querySelector('[data-work-facts]').textContent = factsLine(piece.facts);
  updatePreview();
}
// Questions are worded for the member's track
function renderWorkQuestions() {
  const dev = isDevTrack();
  document.querySelectorAll('[data-work] [data-hint]').forEach(h => {
    const q = WORK_QUESTIONS.find(x => x.key === h.dataset.hint);
    if (q) h.textContent = dev ? q.dev : q.biz;
  });
}
function removeWork(btn) {
  const el = btn.closest('[data-work]');
  delete workExtras[el.dataset.work];
  delete workSuggestions[el.dataset.work];
  el.remove();
  updateWorkCount();
  updatePreview();
  $('work-add').focus();
}
function moveWork(btn, dir) {
  const el = btn.closest('[data-work]');
  const other = dir < 0 ? el.previousElementSibling : el.nextElementSibling;
  if (!other) return;
  if (dir < 0) other.before(el); else other.after(el);
  btn.focus();
  updatePreview();
}

function readPiece(uid) {
  const el = pieceEl(uid), x = workExtras[uid];
  const val = f => { const i = el.querySelector('[data-wf="' + f + '"]'); return i ? i.value.trim() : ''; };
  const facts = {};
  Object.keys(WORK_FACTS).forEach(k => { const r = el.querySelector('input[name="' + uid + '-' + k + '"]:checked'); if (r) facts[k] = r.value; });
  return {
    id: x.id, title: val('title'), link: val('link'), code: val('code'), problem: val('problem'), role: val('role'), did: val('did'),
    result: val('result'), change: val('change'), summary: val('summary'), facts,
    skills: [...x.skills], builtWith: [...x.builtWith], teammates: x.teammates.map(t => ({ ...t })), screenshot: x.screenshot,
  };
}
// Anything at all in a piece counts, so nothing is dropped without a warning
const hasContent = w => !!(w.title || w.link || w.code || w.problem || w.role || w.did || w.result || w.change || w.summary || w.screenshot ||
  Object.keys(w.facts).length || w.skills.length || w.builtWith.length || w.teammates.length);
function readWork() {
  return [...document.querySelectorAll('[data-work]')].map(el => readPiece(el.dataset.work)).filter(hasContent);
}
// A piece with anything in it needs a title
function validateWork() {
  const invalid = [];
  document.querySelectorAll('[data-work]').forEach(el => {
    const uid = el.dataset.work, w = readPiece(uid);
    const err = $(uid + '-title-error');
    const missing = !w.title && hasContent(w);
    err.classList.toggle('hidden', !missing);
    $(uid + '-title').classList.toggle('invalid', !!missing);
    if (missing) { el.open = true; invalid.push($(uid + '-title')); }
  });
  return invalid;
}

// Skills used: picked from the member's skills, or added to them
function renderWorkSkills(uid) {
  const el = pieceEl(uid), x = workExtras[uid];
  const all = [...new Set(skills.concat(x.skills))];
  el.querySelector('[data-wskills]').innerHTML = all.length ? all.map((s, i) =>
    '<label class="cursor-pointer"><input type="checkbox" id="' + uid + '-sk-' + i + '" class="peer sr-only" data-skill="' + esc(s) + '"' + (x.skills.includes(s) ? ' checked' : '') + ' data-on-change="toggleWorkSkill(this)"><span class="chip">' + esc(s) + '</span></label>').join('')
    : '<p class="pf-hint">Add skills to your profile, or type one below.</p>';
}
function renderAllWorkSkills() { Object.keys(workExtras).forEach(uid => { if (pieceEl(uid)) renderWorkSkills(uid); }); }
function toggleWorkSkill(box) {
  const x = workExtras[pieceOf(box)], s = box.dataset.skill;
  x.skills = box.checked ? [...new Set(x.skills.concat(s))] : x.skills.filter(k => k !== s);
  updatePreview();
}
function addWorkSkill(uid, raw) {
  const name = (raw || '').trim().replace(/,$/, '').slice(0, 30);
  if (!name) return;
  const x = workExtras[uid];
  if (!x.skills.some(s => s.toLowerCase() === name.toLowerCase())) x.skills.push(name);
  if (!skills.some(s => s.toLowerCase() === name.toLowerCase())) {
    if (skills.length >= MAX_SKILLS) showToast('Added to this piece. Your profile already has ' + MAX_SKILLS + ' skills, so it isn\'t in your main list.');
    else { skills.push(name); renderSkills(); return; }
  }
  renderWorkSkills(uid);
}
function onWorkSkillKey(e, uid) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  addWorkSkill(uid, e.target.value);
  e.target.value = '';
}

// Built with: free tags, including AI tools
function renderBuiltWith(uid) {
  pieceEl(uid).querySelector('[data-built]').innerHTML = workExtras[uid].builtWith.map((s, i) =>
    '<span class="inline-flex items-center gap-1 bg-fill text-label text-footnote font-medium pl-2.5 pr-1 py-0.5 rounded-full">' + esc(s) +
    '<button type="button" data-on-click="removeBuiltWith(\'' + uid + '\', ' + i + ')" aria-label="Remove ' + esc(s) + '" class="w-5 h-5 rounded-full hover:bg-fill leading-none">×</button></span>').join('');
}
function onBuiltKey(e, uid) {
  const input = e.target, x = workExtras[uid];
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const name = input.value.trim().replace(/,$/, '').slice(0, 30);
    if (name && !x.builtWith.some(s => s.toLowerCase() === name.toLowerCase())) x.builtWith.push(name);
    input.value = '';
    renderBuiltWith(uid);
  } else if (e.key === 'Backspace' && !input.value && x.builtWith.length) { x.builtWith.pop(); renderBuiltWith(uid); }
}
function removeBuiltWith(uid, i) { workExtras[uid].builtWith.splice(i, 1); renderBuiltWith(uid); $(uid + '-built').focus(); }

// Teammates: tagged members confirm the work (demo: after a moment, once the profile is saved)
function renderTeammates(uid) {
  const el = pieceEl(uid), x = workExtras[uid];
  el.querySelector('[data-mates]').innerHTML = x.teammates.map(t => {
    const p = person(t.id);
    if (!p) return '';
    return '<span class="inline-flex items-center gap-2 entry !py-1 !pl-1 !pr-1.5 !rounded-full">' + personAvatar(p, 'w-7 h-7 text-caption') +
      '<span class="text-footnote"><span class="font-semibold">' + esc(fullName(p)) + '</span> · ' + (t.confirmed ? '<span class="text-greenText font-semibold">Confirmed</span>' : 'Waiting to confirm') + '</span>' +
      '<button type="button" data-on-click="removeTeammate(\'' + uid + '\', \'' + t.id + '\')" aria-label="Remove ' + esc(fullName(p)) + '" class="w-6 h-6 rounded-full hover:bg-fill leading-none">×</button></span>';
  }).join('');
  const tagged = x.teammates.map(t => t.id);
  const option = p => '<option value="' + p.id + '">' + esc(fullName(p)) + ' · ' + esc(p.track === 'Business Developer' ? 'Business Dev' : 'Software Dev') + '</option>';
  const free = DEMO_PEOPLE.filter(p => !tagged.includes(p.id)).sort((a, b) => fullName(a).localeCompare(fullName(b)));
  const mine = free.filter(p => demo && demo.connected[p.id]);
  $(uid + '-mate').innerHTML = '<option value="">Choose a member</option>' +
    (mine.length ? '<optgroup label="Your connections">' + mine.map(option).join('') + '</optgroup>' : '') +
    '<optgroup label="Other members">' + free.filter(p => !mine.includes(p)).map(option).join('') + '</optgroup>';
}
function addTeammate(uid) {
  const id = $(uid + '-mate').value;
  if (!id) { showToast('Choose a member to tag.'); $(uid + '-mate').focus(); return; }
  workExtras[uid].teammates.push({ id, confirmed: false });
  renderTeammates(uid);
  $(uid + '-mate').focus();
}
function removeTeammate(uid, id) {
  workExtras[uid].teammates = workExtras[uid].teammates.filter(t => t.id !== id);
  renderTeammates(uid);
  $(uid + '-mate').focus();
}
function scheduleTeammateConfirmations(work) {
  (work || []).forEach(w => w.teammates.filter(t => !t.confirmed).forEach(t => setTimeout(() => confirmTeammate(w.id, t.id), 1500)));
}
function confirmTeammate(pieceId, id) {
  const account = currentAccount();
  if (!account) return;
  const work = profileOf(account).work;
  const piece = work.find(w => w.id === pieceId);
  const mate = piece && piece.teammates.find(t => t.id === id && !t.confirmed);
  if (!mate) return;
  mate.confirmed = true;
  updateProfile(account, { work });
  // Keep the open form in step with what was saved
  Object.keys(workExtras).forEach(uid => {
    if (!pieceEl(uid) || workExtras[uid].id !== pieceId) return;
    workExtras[uid].teammates.forEach(t => { if (t.id === id) t.confirmed = true; });
    renderTeammates(uid);
  });
  showToast(person(id).first + ' confirmed your work on ' + piece.title);
}

// Screenshot: resized in the browser so it fits in browser storage
function renderScreenshot(uid) {
  const shot = workExtras[uid].screenshot;
  pieceEl(uid).querySelector('[data-shot]').innerHTML =
    '<p class="pf-label">Screenshot (optional)</p>' +
    (shot ? '<img src="' + shot + '" alt="Screenshot you added" class="rounded-xl max-h-48 w-auto border border-hairline mb-2">' : '') +
    '<div class="flex flex-wrap gap-2"><label for="' + uid + '-shot" class="btn btn-gray btn-sm cursor-pointer">' + (shot ? 'Change screenshot' : 'Add a screenshot') + '</label>' +
    '<input id="' + uid + '-shot" type="file" accept="image/*" class="sr-only" data-on-change="handleScreenshot(this, \'' + uid + '\')">' +
    (shot ? '<button type="button" class="btn btn-plain btn-sm" data-on-click="removeScreenshot(\'' + uid + '\')">Remove screenshot</button>' : '') + '</div>' +
    '<p id="' + uid + '-shot-error" class="pf-error hidden"></p>';
}
function handleScreenshot(input, uid) {
  const file = input.files[0];
  input.value = '';
  if (!file) return;
  const fail = msg => { $(uid + '-shot-error').textContent = msg; $(uid + '-shot-error').classList.remove('hidden'); };
  if (!file.type.startsWith('image/')) return fail('Choose an image file, such as a PNG or JPG.');
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    // At most 960 by 960 pixels, so several screenshots still fit in browser storage
    const scale = Math.min(1, 960 / img.width, 960 / img.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    workExtras[uid].screenshot = canvas.toDataURL('image/jpeg', 0.8);
    URL.revokeObjectURL(url);
    renderScreenshot(uid);
    updatePreview();
  };
  img.onerror = () => { URL.revokeObjectURL(url); fail('That file couldn\'t be opened as an image. Try a different one.'); };
  img.src = url;
}
function removeScreenshot(uid) { workExtras[uid].screenshot = null; renderScreenshot(uid); updatePreview(); }

// ---------- Claude helper (D016: published page only; a plain form elsewhere) ----------
function showAiButtons() {
  getSample().then(s => document.querySelectorAll('[data-ai-only]').forEach(el => el.classList.toggle('hidden', !s)));
}
const aiStatus = (uid, msg) => { const el = pieceEl(uid).querySelector('[data-ai-status]'); if (el) el.textContent = msg; };
const SKILL_LIST = () => [...new Set(skills.concat(SKILL_SUGGESTIONS['Software Developer'], SKILL_SUGGESTIONS['Business Developer']))];
const FACT_RULES = () => Object.entries(WORK_FACTS).map(([k, v]) => k + ': one of ' + v.options.map(o => '"' + o + '"').join(', ')).join('; ');

function workPromptContext(uid) {
  const w = readPiece(uid);
  return 'Bootcamp Connect is a UK networking app for people on a coding bootcamp, on the Software Developer and Business Developer tracks. ' +
    'This member is on the ' + $('pf-track').value + ' track. They are writing up one piece of work as a short case study.\n' +
    'What they have written so far: ' + JSON.stringify({ title: w.title, problem: w.problem, role: w.role, did: w.did, result: w.result, change: w.change, facts: w.facts }) + '\n' +
    'Rules: British English, plain words, first person. Each answer at most ' + QUESTION_MAX + ' characters; summary at most ' + SUMMARY_MAX + '. ' +
    'Never invent facts, numbers or results the member didn\'t give you; use "" when you don\'t know. Facts must use exactly these options: ' + FACT_RULES() + '. ' +
    'Pick skills from this list where possible: ' + SKILL_LIST().join(', ') + '.\n';
}
const DRAFT_SHAPE = '{"title": string, "problem": string, "role": string, "did": string, "result": string, "change": string, "summary": string, "facts": {"role": string, "team": string, "length": string, "reached": string}, "skills": [string], "builtWith": [string]}';

// Write it with Claude: an interview, one question at a time, ending in a draft
let aiChat = null;
function openWorkInterview(uid) {
  aiChat = { uid, turns: [], busy: false };
  openSheet(sheetClose() +
    '<div class="p-6 sm:p-7 space-y-4">' +
      '<div class="pr-10"><h2 id="sheet-title" class="text-title3 font-bold">Write it with Claude</h2>' +
      '<p class="text-subhead text-label-2">Claude asks a few questions about this work, then drafts it. You check the draft before anything is saved.</p></div>' +
      '<div id="ai-log" class="space-y-3 max-h-[45dvh] overflow-y-auto" aria-live="polite"></div>' +
      '<form id="ai-form" class="space-y-2" data-on-submit="aiAnswer(event)">' +
        '<label for="ai-input" class="pf-label">Your answer</label>' +
        '<textarea id="ai-input" rows="3" maxlength="600" class="pf-input resize-y"></textarea>' +
        '<div class="flex flex-wrap justify-end gap-2">' +
          '<button type="button" class="btn btn-gray btn-sm" data-on-click="aiFinish()">Draft it now</button>' +
          '<button type="submit" class="btn btn-primary btn-sm">Send</button>' +
        '</div>' +
      '</form>' +
    '</div>', 'ai-' + uid);
  aiNext(false);
}
function aiLog(who, text) {
  $('ai-log').insertAdjacentHTML('beforeend', '<div class="' + (who === 'claude' ? 'entry !p-3' : 'pl-8') + '"><p class="text-footnote font-semibold text-label-2">' + (who === 'claude' ? 'Claude' : 'You') + '</p><p class="text-subhead">' + esc(text) + '</p></div>');
  $('ai-log').scrollTop = $('ai-log').scrollHeight;
}
async function aiNext(finish) {
  const chat = aiChat;
  if (!chat || chat.busy) return;
  chat.busy = true;
  $('ai-input').disabled = true;
  const thinking = 'ai-thinking';
  $('ai-log').insertAdjacentHTML('beforeend', '<p id="' + thinking + '" class="pf-hint">Claude is thinking…</p>');
  const prompt = workPromptContext(aiChat.uid) +
    'Interview so far: ' + JSON.stringify(aiChat.turns) + '\n' +
    (finish || aiChat.turns.length >= 6
      ? 'Now write the draft. Reply with only JSON: {"draft": ' + DRAFT_SHAPE + '}'
      : 'Ask ONE short, friendly question to fill the most important gap (problem, role, what they did, what happened with numbers, or the facts). ' +
        'If you already have enough for a good case study, write the draft instead. Reply with only JSON: {"question": string} or {"draft": ' + DRAFT_SHAPE + '}');
  let res = null;
  try { const sample = await getSample(); res = sample ? await sample.json(prompt) : null; } catch { res = null; }
  // The member may have closed this interview, or started another, while Claude was thinking
  if (aiChat !== chat || !$('ai-input')) return;
  chat.busy = false;
  const t = $(thinking); if (t) t.remove();
  $('ai-input').disabled = false;
  if (res && res.draft) {
    const uid = chat.uid;
    aiChat = null;
    closeSheet();
    if (!pieceEl(uid)) return;
    suggest(uid, res.draft);
    pieceEl(uid).open = true;
    const heading = pieceEl(uid).querySelector('[data-suggestions] h4');
    if (heading) { heading.focus(); showToast('Claude drafted this piece. Check each suggestion, then save.'); }
    else { $(uid + '-title').focus(); showToast('Claude didn\'t have enough to draft this piece. Answer a few more questions, or fill in the form yourself.'); }
    return;
  }
  if (res && res.question) {
    chat.turns.push({ question: res.question, answer: '' });
    aiLog('claude', res.question);
    $('ai-input').focus();
    return;
  }
  aiLog('claude', 'Sorry, I couldn\'t answer just now. Try again, or fill in the form yourself.');
}
function aiAnswer(e) {
  e.preventDefault();
  const text = $('ai-input').value.trim();
  if (!text || !aiChat) return;
  const last = aiChat.turns[aiChat.turns.length - 1];
  if (last && !last.answer) last.answer = text; else aiChat.turns.push({ question: '', answer: text });
  aiLog('me', text);
  $('ai-input').value = '';
  aiNext(false);
}
function aiFinish() { aiNext(true); }

// Suggest from a code link: read the public repository's README and package.json
async function suggestFromCode(uid) {
  const code = $(uid + '-code').value.trim();
  const m = code.match(/github\.com\/([\w.-]+)\/([\w.-]+)/i);
  if (!m) { aiStatus(uid, 'Add a GitHub code link first, like github.com/you/project.'); $(uid + '-code').focus(); return; }
  aiStatus(uid, 'Reading the repository…');
  const repo = m[1] + '/' + m[2].replace(/\.git$/, '');
  const read = async file => {
    try {
      const r = await fetch('https://raw.githubusercontent.com/' + repo + '/HEAD/' + file, { signal: AbortSignal.timeout(6000) });
      return r.ok ? (await r.text()).slice(0, 12000) : '';
    } catch { return ''; }
  };
  const [readme, pkg] = await Promise.all([read('README.md'), read('package.json')]);
  if (!readme && !pkg) return showPasteBox(uid);
  aiFromText(uid, 'README:\n' + readme + '\n\npackage.json:\n' + pkg, 'code');
}
// If the page can't read GitHub (or the repository is private), the member pastes the text instead
function showPasteBox(uid) {
  const box = pieceEl(uid).querySelector('[data-paste]');
  box.classList.remove('hidden');
  box.innerHTML = '<label for="' + uid + '-paste" class="pf-label">Paste the README or list of dependencies</label>' +
    '<p id="' + uid + '-paste-hint" class="pf-hint">The repository couldn\'t be read from here. It may be private.</p>' +
    '<textarea id="' + uid + '-paste" rows="4" maxlength="12000" aria-describedby="' + uid + '-paste-hint" class="pf-input resize-y"></textarea>' +
    '<button type="button" class="btn btn-secondary btn-sm" data-on-click="suggestFromPaste(\'' + uid + '\')">Suggest from this text</button>';
  aiStatus(uid, '');
  $(uid + '-paste').focus();
}
function suggestFromPaste(uid) {
  const text = $(uid + '-paste').value.trim();
  if (!text) { aiStatus(uid, 'Paste some text first.'); $(uid + '-paste').focus(); return; }
  pieceEl(uid).querySelector('[data-paste]').classList.add('hidden');
  aiFromText(uid, text, 'code');
}
// Suggest from a document, such as a pitch deck or report (uses the CV importer's file reader)
async function suggestFromDoc(input, uid) {
  const file = input.files[0];
  input.value = '';
  if (!file) return;
  if (file.size > MAX_IMPORT_BYTES) { aiStatus(uid, 'That file is over 10 MB. Choose a smaller PDF or Word file.'); return; }
  aiStatus(uid, 'Reading ' + file.name + '…');
  let text = '';
  try { text = (await extractText(file)).trim(); } catch (e) { aiStatus(uid, e.message || 'That file couldn\'t be read. Try a PDF or .docx file.'); return; }
  if (text.length < 40) { aiStatus(uid, 'No text was found in that file. Try a PDF exported from Word or Google Docs.'); return; }
  aiFromText(uid, text.slice(0, 20000), 'doc');
}
async function aiFromText(uid, text, kind) {
  aiStatus(uid, 'Claude is reading it…');
  const prompt = workPromptContext(uid) +
    (kind === 'code' ? 'Here is the project\'s README and dependency file.' : 'Here is a document from this piece of work, such as a pitch deck or report.') + '\n"""\n' + text + '\n"""\n' +
    'Suggest the skills used, the tools it was built with, and a draft answer to "What did you do?"' + (kind === 'doc' ? ', "What was the problem?" and "What happened?"' : '') + '. ' +
    'Reply with only JSON: {"skills": [string], "builtWith": [string], "did": string' + (kind === 'doc' ? ', "problem": string, "result": string' : '') + '}';
  let res = null;
  try { const sample = await getSample(); res = sample ? await sample.json(prompt) : null; } catch { res = null; }
  if (!res) { aiStatus(uid, 'Claude couldn\'t read it just now. Try again, or fill in the form yourself.'); return; }
  suggest(uid, res);
  aiStatus(uid, 'Claude added suggestions below. Check each one before saving.');
}

// Suggestions stay marked "Suggested" until the member uses or dismisses each one
function suggest(uid, d) {
  const s = workSuggestions[uid] = workSuggestions[uid] || { fields: {}, facts: null, skills: [], builtWith: [] };
  const x = workExtras[uid];
  ['title', 'problem', 'role', 'did', 'result', 'change', 'summary'].forEach(k => {
    const v = typeof d[k] === 'string' ? d[k].trim().slice(0, k === 'summary' ? SUMMARY_MAX : k === 'title' ? 80 : QUESTION_MAX) : '';
    if (v) s.fields[k] = v;
  });
  if (d.facts && typeof d.facts === 'object') {
    const f = {};
    Object.keys(WORK_FACTS).forEach(k => { if (WORK_FACTS[k].options.includes(d.facts[k])) f[k] = d.facts[k]; });
    if (Object.keys(f).length) s.facts = f;
  }
  const list = v => (Array.isArray(v) ? v : []).filter(i => typeof i === 'string' && i.trim()).map(i => i.trim().slice(0, 30));
  s.skills = [...new Set(s.skills.concat(list(d.skills)))].filter(k => !x.skills.some(h => h.toLowerCase() === k.toLowerCase())).slice(0, 8);
  s.builtWith = [...new Set(s.builtWith.concat(list(d.builtWith)))].filter(k => !x.builtWith.some(h => h.toLowerCase() === k.toLowerCase())).slice(0, 8);
  renderSuggestions(uid);
}
const FIELD_LABELS = { title: 'Title', problem: 'What was the problem?', role: 'What was your role?', did: 'What did you do?', result: 'What happened?', change: 'What would you do differently?', summary: 'Summary' };
function renderSuggestions(uid) {
  const s = workSuggestions[uid];
  const box = pieceEl(uid).querySelector('[data-suggestions]');
  const any = s && (Object.keys(s.fields).length || s.facts || s.skills.length || s.builtWith.length);
  if (!any) { box.innerHTML = ''; return; }
  const row = (label, value, use, dismiss) => '<div class="space-y-1"><p class="pf-label !mb-0">' + esc(label) + ' <span class="text-purpleText">Suggested</span></p><p class="text-subhead">' + esc(value) + '</p>' +
    '<div class="flex gap-2"><button type="button" class="btn btn-secondary btn-sm" data-on-click="' + use + '">Use</button><button type="button" class="btn btn-gray btn-sm" data-on-click="' + dismiss + '">Dismiss</button></div></div>';
  const chip = (kind, v, i) => '<span class="inline-flex items-center gap-1 bg-applePurple/10 text-purpleText border border-applePurple/25 text-footnote font-medium pl-2.5 pr-1 py-0.5 rounded-full">' + esc(v) + ' <span class="sr-only">(suggested)</span>' +
    '<button type="button" class="min-h-[28px] px-1.5 rounded-full hover:bg-applePurple/20 font-semibold" data-on-click="acceptSuggestedItem(\'' + uid + '\', \'' + kind + '\', ' + i + ')" aria-label="Accept ' + esc(v) + '">Accept</button>' +
    '<button type="button" class="w-6 h-6 rounded-full hover:bg-applePurple/20 leading-none" data-on-click="dismissSuggestedItem(\'' + uid + '\', \'' + kind + '\', ' + i + ')" aria-label="Remove suggestion ' + esc(v) + '">×</button></span>';
  box.innerHTML = '<div class="entry !bg-applePurple/10 space-y-3">' +
    '<div class="flex flex-wrap items-center justify-between gap-2"><h4 class="font-semibold text-body" tabindex="-1">Suggested by Claude</h4>' +
    '<button type="button" class="btn btn-secondary btn-sm" data-on-click="useAllSuggestions(\'' + uid + '\')">Use all</button></div>' +
    '<p class="pf-hint">Check each suggestion. Nothing is added to your profile until you use it and save.</p>' +
    Object.entries(s.fields).map(([k, v]) => row(FIELD_LABELS[k], v, 'useSuggestedField(\'' + uid + '\', \'' + k + '\')', 'dismissSuggestedField(\'' + uid + '\', \'' + k + '\')')).join('') +
    (s.facts ? row('Facts', factsLine(s.facts), 'useSuggestedFacts(\'' + uid + '\')', 'dismissSuggestedFacts(\'' + uid + '\')') : '') +
    (s.skills.length ? '<div class="space-y-1"><p class="pf-label !mb-0">Skills used</p><div class="flex flex-wrap gap-1.5">' + s.skills.map((v, i) => chip('skills', v, i)).join('') + '</div></div>' : '') +
    (s.builtWith.length ? '<div class="space-y-1"><p class="pf-label !mb-0">Built with</p><div class="flex flex-wrap gap-1.5">' + s.builtWith.map((v, i) => chip('builtWith', v, i)).join('') + '</div></div>' : '') +
  '</div>';
}
function useSuggestedField(uid, k) {
  const field = pieceEl(uid).querySelector('[data-wf="' + k + '"]');
  field.value = workSuggestions[uid].fields[k];
  delete workSuggestions[uid].fields[k];
  if (k === 'title') updateWorkHeader(field);
  afterSuggestion(uid);
}
function dismissSuggestedField(uid, k) { delete workSuggestions[uid].fields[k]; afterSuggestion(uid); }
function useSuggestedFacts(uid) {
  Object.entries(workSuggestions[uid].facts).forEach(([k, v]) => {
    const r = pieceEl(uid).querySelector('input[name="' + uid + '-' + k + '"][value="' + v + '"]');
    if (r) r.checked = true;
  });
  workSuggestions[uid].facts = null;
  updateWorkHeader(pieceEl(uid).querySelector('[data-wf="title"]'));
  afterSuggestion(uid);
}
function dismissSuggestedFacts(uid) { workSuggestions[uid].facts = null; afterSuggestion(uid); }
function acceptSuggestedItem(uid, kind, i) {
  const v = workSuggestions[uid][kind].splice(i, 1)[0];
  if (kind === 'skills') addWorkSkill(uid, v);
  else { workExtras[uid].builtWith.push(v); renderBuiltWith(uid); }
  afterSuggestion(uid);
}
function dismissSuggestedItem(uid, kind, i) { workSuggestions[uid][kind].splice(i, 1); afterSuggestion(uid); }
function useAllSuggestions(uid) {
  const s = workSuggestions[uid];
  Object.keys(s.fields).forEach(k => { pieceEl(uid).querySelector('[data-wf="' + k + '"]').value = s.fields[k]; });
  s.fields = {};
  if (s.facts) useSuggestedFacts(uid);
  s.skills.splice(0).forEach(v => addWorkSkill(uid, v));
  workExtras[uid].builtWith.push(...s.builtWith.splice(0));
  renderBuiltWith(uid);
  updateWorkHeader(pieceEl(uid).querySelector('[data-wf="title"]'));
  afterSuggestion(uid);
  $(uid + '-title').focus();
}
function afterSuggestion(uid) {
  renderSuggestions(uid);
  updateCounters();
  updatePreview();
  const box = pieceEl(uid).querySelector('[data-suggestions] h4');
  if (box) box.focus(); else $(uid + '-title').focus();
}

// ---------- Showing work on a profile ----------
// A member's own work, plus work others tagged them on and they confirmed
function workFor(p) {
  const own = (p.work || []).map((w, i) => ({ ...w, by: p.id, idx: i }));
  if (p.id === 'me') return own;
  const mine = currentAccount() ? profileOf(currentAccount()).work : [];
  const authors = DEMO_PEOPLE.filter(o => o.id !== p.id).map(o => ({ id: o.id, work: o.work || [] })).concat({ id: 'me', work: mine });
  const tagged = authors.flatMap(o => o.work.map((w, i) => ({ ...w, by: o.id, idx: i })).filter(w => (w.teammates || []).some(t => t.id === p.id && t.confirmed)));
  return own.concat(tagged);
}
const viewerIsDev = () => memberView('me').track !== 'Business Developer';
const workAuthor = id => id === 'me' ? { first: memberName('me'), last: (currentAccount() || {}).last || '' } : person(id);
const hrefOf = url => (url && normalizeUrl(url)) || '';

function workLinks(w) {
  const live = hrefOf(w.link) ? '<a href="' + esc(hrefOf(w.link)) + '" target="_blank" rel="noopener" class="text-footnote font-semibold text-blueText hover:underline">See it live<span class="sr-only"> (opens in new tab)</span></a>' : '';
  const code = hrefOf(w.code) ? '<a href="' + esc(hrefOf(w.code)) + '" target="_blank" rel="noopener" class="text-footnote font-semibold text-blueText hover:underline">Code<span class="sr-only"> (opens in new tab)</span></a>' : '';
  const built = w.builtWith && w.builtWith.length ? '<p class="text-footnote text-label-2"><span class="font-semibold text-label">Built with:</span> ' + esc(w.builtWith.join(', ')) + '</p>' : '';
  const tech = code || built;
  // Ordered for the viewer (D023): developers see the technical side straight away
  if (viewerIsDev()) return (live || code ? '<div class="flex flex-wrap gap-x-4 gap-y-1">' + live + code + '</div>' : '') + built;
  return (live ? '<div>' + live + '</div>' : '') +
    (tech ? '<details class="group/tech"><summary class="list-none cursor-pointer inline-flex items-center gap-1 text-footnote font-semibold text-label-2 min-h-[44px]"><svg class="icon w-3.5 h-3.5 transition group-open/tech:rotate-90" aria-hidden="true"><use href="#i-chevron"/></svg>Technical details</summary>' +
      '<div class="space-y-1 pb-1">' + (code ? '<div>' + code + '</div>' : '') + built + '</div></details>' : '');
}
function teammateLine(w, ownerId) {
  const confirmed = w.teammates.filter(t => t.confirmed && person(t.id)).map(t => fullName(person(t.id)));
  if (w.by !== ownerId) return '<p class="text-footnote text-label-2">Added by ' + esc(fullName(workAuthor(w.by))) + ', and confirmed</p>';
  return confirmed.length ? '<p class="text-footnote text-greenText font-semibold inline-flex items-center gap-1"><svg class="icon w-3.5 h-3.5"><use href="#i-check"/></svg>Confirmed by ' + esc(confirmed.join(' and ')) + '</p>' : '';
}
function workCardHtml(p, w, n) {
  return '<article class="entry !p-0 overflow-hidden" data-piece="' + n + '">' +
    (w.screenshot ? '<img src="' + w.screenshot + '" alt="Screenshot of ' + esc(w.title) + '" class="w-full max-h-48 object-cover object-top border-b border-hairline">' : '') +
    '<div class="p-4 space-y-1.5">' +
      '<h4 class="font-semibold text-body">' + esc(w.title) + '</h4>' +
      (factsLine(w.facts) ? '<p class="text-footnote text-label-2">' + esc(factsLine(w.facts)) + '</p>' : '') +
      '<p class="text-subhead line-clamp-2">' + esc(w.summary || w.result || w.did) + '</p>' +
      teammateLine(w, p.id) +
      workLinks(w) +
      '<button type="button" class="btn btn-gray btn-sm" data-on-click="openWork(\'' + p.id + '\', ' + n + ')" aria-label="Read more about ' + esc(w.title) + '">Read more</button>' +
    '</div>' +
  '</article>';
}
function workSectionHtml(p, all) {
  if (!all.length) return '';
  const list = all.map((w, n) => workCardHtml(p, w, n));
  return '<section class="space-y-2"><h3 class="font-semibold text-body">Work to show</h3>' +
    '<div class="space-y-3">' + list.slice(0, WORK_ON_PROFILE).join('') + '</div>' +
    (list.length > WORK_ON_PROFILE ? '<details class="group/more"><summary class="list-none cursor-pointer inline-flex items-center gap-1 text-subhead font-semibold text-blueText min-h-[44px]"><svg class="icon w-4 h-4 transition group-open/more:rotate-90" aria-hidden="true"><use href="#i-chevron"/></svg>Show all work (' + list.length + ')</summary>' +
      '<div class="space-y-3 pt-1">' + list.slice(WORK_ON_PROFILE).join('') + '</div></details>' : '') +
  '</section>';
}

// The full case study, in the sheet, with a way back to the profile
function openWork(personId, n) {
  const p = profileView(personId);
  const w = workFor(p)[n];
  if (!w) return;
  // Answers are written by the piece's author, so headings name them
  const author = w.by === p.id ? null : workAuthor(w.by);
  const who = author ? author.first : p.id === 'me' ? 'you' : 'they';
  const whose = author ? author.first + '\'s' : p.id === 'me' ? 'your' : 'their';
  const answer = (label, v) => v ? '<div class="space-y-0.5"><h4 class="text-footnote font-semibold text-label-2">' + label + '</h4><p class="text-subhead">' + esc(v) + '</p></div>' : '';
  openSheet(sheetClose() +
    '<div class="p-6 sm:p-7 space-y-4">' +
      '<button type="button" class="btn btn-plain btn-sm -ml-2" data-on-click="openPerson(\'' + personId + '\')"><svg class="icon w-4 h-4 rotate-180"><use href="#i-chevron"/></svg>Back to ' + (personId === 'me' ? 'your profile' : esc(p.first) + '\'s profile') + '</button>' +
      '<div class="pr-10"><h2 id="sheet-title" class="text-title2 font-bold">' + esc(w.title) + '</h2>' +
      (factsLine(w.facts) ? '<p class="text-subhead text-label-2">' + esc(factsLine(w.facts)) + '</p>' : '') + '</div>' +
      (w.screenshot ? '<img src="' + w.screenshot + '" alt="Screenshot of ' + esc(w.title) + '" class="w-full rounded-xl border border-hairline">' : '') +
      teammateLine(w, p.id) +
      answer('What was the problem?', w.problem) + answer('What was ' + whose + ' role?', w.role) +
      answer('What did ' + who + ' do?', w.did) + answer('What happened?', w.result) +
      answer('What would ' + who + ' do differently?', w.change) +
      (w.skills.length ? '<div class="space-y-1"><h4 class="text-footnote font-semibold text-label-2">Skills used</h4><div class="flex flex-wrap gap-1.5">' + w.skills.map(s => '<span class="chip !cursor-default !min-h-[28px] !text-footnote">' + esc(s) + '</span>').join('') + '</div></div>' : '') +
      workLinks(w) +
    '</div>', 'work-' + personId, { wide: true });
  $('sheet-close').focus();
}

// Skills: confirmed (by a teammate or a verified project), proven (used in shown work) or listed
function skillGroups(p, all) {
  const has = (s, list) => list.some(x => x.toLowerCase() === s.toLowerCase());
  const pieces = s => all.filter(w => has(s, w.skills || []));
  const confirmedBy = s => pieces(s).some(w => w.by !== p.id || w.teammates.some(t => t.confirmed)) || (p.verified || []).some(v => has(s, v.endorsed || []));
  const groups = { confirmed: [], proven: [], listed: [] };
  (p.skills || []).forEach(s => {
    if (confirmedBy(s)) groups.confirmed.push(s); else if (pieces(s).length) groups.proven.push(s); else groups.listed.push(s);
  });
  return { groups, pieces };
}
function skillsSectionHtml(p, all) {
  const { groups, pieces } = skillGroups(p, all);
  const chip = (s, kind) => {
    const n = pieces(s).length;
    const label = esc(s) + (p.endorsements && p.endorsements[s] ? ' <span class="text-greenText font-semibold">' + p.endorsements[s] + '</span>' : '');
    return n ? '<button type="button" class="chip !min-h-[32px] !text-footnote" data-skill="' + esc(s) + '" data-on-click="showSkillWork(\'' + p.id + '\', this.dataset.skill)" aria-label="' + esc(s) + ': ' + kind + ', used in ' + n + ' piece' + (n > 1 ? 's' : '') + ' of work. Show them">' + label + '</button>'
      : '<span class="chip !cursor-default !min-h-[32px] !text-footnote">' + label + '</span>';
  };
  const group = (title, hint, list, kind) => list.length ? '<div class="space-y-1.5"><p class="text-footnote font-semibold">' + title + ' <span class="font-normal text-label-2">· ' + hint + '</span></p><div class="flex flex-wrap gap-1.5">' + list.map(s => chip(s, kind)).join('') + '</div></div>' : '';
  return '<section class="space-y-3"><h3 class="font-semibold text-body">Skills</h3>' +
    group('Confirmed', 'by a teammate or a finished project', groups.confirmed, 'confirmed') +
    group('Proven', 'used in work to show', groups.proven, 'proven') +
    group('Listed', 'not shown in work yet', groups.listed, 'listed') +
    '<div id="skill-work" aria-live="polite"></div>' +
    ((p.learn || []).length ? '<div class="space-y-1.5"><p class="text-footnote font-semibold">Currently learning</p><div class="flex flex-wrap gap-1.5">' + p.learn.map(s => '<span class="px-2.5 py-1 rounded-full bg-applePurple/10 text-purpleText text-footnote font-semibold">' + esc(s) + '</span>').join('') + '</div></div>' : '') +
  '</section>';
}
function showSkillWork(personId, skill) {
  const p = profileView(personId), all = workFor(p);
  const list = all.map((w, n) => ({ w, n })).filter(({ w }) => (w.skills || []).some(s => s.toLowerCase() === skill.toLowerCase()));
  $('skill-work').innerHTML = '<div class="entry !p-3 space-y-1.5"><p class="text-footnote font-semibold">Work using ' + esc(skill) + '</p><ul class="space-y-1">' +
    list.map(({ w, n }) => '<li><button type="button" class="text-subhead text-blueText font-semibold hover:underline text-left min-h-[32px]" data-on-click="openWork(\'' + personId + '\', ' + n + ')">' + esc(w.title) + '</button>' +
      (factsLine(w.facts) ? ' <span class="text-footnote text-label-2">· ' + esc(factsLine(w.facts)) + '</span>' : '') + '</li>').join('') + '</ul></div>';
}
