// Bootcamp Connect prototype: profile setup (specs/02-profile.md)
// Plain script (shared globals); load order is set in prototype.html.

// ---------- Profile setup (specs/02-profile.md) ----------
const SKILL_SUGGESTIONS = {
  'Software Developer': ['React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Next.js', 'AWS', 'REST APIs', 'Git', 'UI/UX'],
  'Business Developer': ['Market research', 'Financial modeling', 'Sales', 'Pitch decks', 'Growth marketing', 'Product management', 'Customer discovery', 'Fundraising', 'Partnerships', 'Copywriting'],
};
const SETTINGS = ['Remote', 'Hybrid', 'In person'];
const GOALS = ['Co-founder', 'Paid work', 'Passion project', 'Hiring teammates'];
const HOURS = ['Under 10', '10–20', '20–40', '40+'];
const IDEA_STATUS = ['I have an idea', 'I want to join an idea', 'Open to both'];
const INDUSTRIES = ['AI', 'Fintech', 'Health', 'Edtech', 'Climate', 'Consumer', 'B2B SaaS', 'Marketplaces', 'Other'];
const MAX_SKILLS = 10;

let skills = [];
let photoData = null;
let entrySeq = 0;

const $ = id => document.getElementById(id);
const esc = v => escapeHtml(String(v ?? ''));

function initials(first, last) {
  return (((first || '')[0] || '') + ((last || '')[0] || '')).toUpperCase() || '?';
}

function setAvatar(el, photo, fallback) {
  el.style.backgroundImage = photo ? 'url("' + photo + '")' : '';
  el.textContent = photo ? '' : fallback;
}

function renderChips(containerId, name, type, options) {
  $(containerId).innerHTML = options.map((o, i) =>
    '<label class="cursor-pointer"><input type="' + type + '" id="' + name + '-' + i + '" name="' + name + '" value="' + esc(o) + '" class="peer sr-only"><span class="chip">' + esc(o) + '</span></label>'
  ).join('');
}
function getChecked(name) {
  return [...document.querySelectorAll('input[name="' + name + '"]:checked')].map(i => i.value);
}
function setChecked(name, values) {
  document.querySelectorAll('input[name="' + name + '"]').forEach(i => { i.checked = values.includes(i.value); });
}

// Repeatable entries: work experience and projects
function expHtml(e = {}) {
  const id = 'exp' + (++entrySeq);
  return '<div class="entry space-y-3" data-exp>' +
    '<div class="flex items-center justify-between"><p class="text-footnote font-semibold text-label-2">Experience</p>' +
    '<button type="button" onclick="removeEntry(this)" class="text-footnote font-medium text-label-2 hover:text-redText">Remove</button></div>' +
    '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
      '<div><label for="' + id + '-title" class="pf-label">Title</label><input id="' + id + '-title" data-field="title" type="text" class="pf-input" placeholder="e.g. Frontend Developer Intern" value="' + esc(e.title) + '"></div>' +
      '<div><label for="' + id + '-company" class="pf-label">Company</label><input id="' + id + '-company" data-field="company" type="text" class="pf-input" placeholder="e.g. Shopify" value="' + esc(e.company) + '"></div>' +
      '<div><label for="' + id + '-start" class="pf-label">Start</label><input id="' + id + '-start" data-field="start" type="month" class="pf-input" value="' + esc(e.start) + '"></div>' +
      '<div><label for="' + id + '-end" class="pf-label">End</label><input id="' + id + '-end" data-field="end" type="month" class="pf-input" value="' + esc(e.end) + '"' + (e.current ? ' disabled' : '') + '></div>' +
    '</div>' +
    '<label class="flex items-center gap-2 text-footnote text-label-2 cursor-pointer"><input id="' + id + '-current" data-field="current" type="checkbox" class="w-4 h-4 accent-appleBlue" onchange="toggleCurrent(this)"' + (e.current ? ' checked' : '') + '> I currently work here</label>' +
    '<div><label for="' + id + '-desc" class="pf-label">What you did</label><textarea id="' + id + '-desc" data-field="desc" rows="3" class="pf-input resize-y" placeholder="What did you build or own, and what changed because of it?">' + esc(e.desc) + '</textarea></div>' +
    '</div>';
}

function projHtml(p = {}) {
  const id = 'proj' + (++entrySeq);
  return '<div class="entry space-y-3" data-proj>' +
    '<div class="flex items-center justify-between"><p class="text-footnote font-semibold text-label-2">Project</p>' +
    '<button type="button" onclick="removeEntry(this)" class="text-footnote font-medium text-label-2 hover:text-redText">Remove</button></div>' +
    '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
      '<div><label for="' + id + '-title" class="pf-label">Title</label><input id="' + id + '-title" data-field="title" type="text" class="pf-input" placeholder="e.g. AI budgeting app" value="' + esc(p.title) + '"></div>' +
      '<div><label for="' + id + '-role" class="pf-label">Your role</label><input id="' + id + '-role" data-field="role" type="text" class="pf-input" placeholder="e.g. Built the backend" value="' + esc(p.role) + '"></div>' +
    '</div>' +
    '<div><label for="' + id + '-link" class="pf-label">Link</label><input id="' + id + '-link" data-field="link" type="url" inputmode="url" class="pf-input" placeholder="github.com/you/project or a demo link" value="' + esc(p.link) + '"></div>' +
    '<div><div class="flex items-baseline justify-between"><label for="' + id + '-desc" class="pf-label">Description</label><span class="pf-hint tabular-nums" data-count-for="' + id + '-desc">0/200</span></div>' +
    '<textarea id="' + id + '-desc" data-field="desc" rows="2" maxlength="200" class="pf-input resize-y" placeholder="One or two sentences on the problem and the result.">' + esc(p.desc) + '</textarea></div>' +
    '</div>';
}

function addExperience(e) { $('exp-list').insertAdjacentHTML('beforeend', expHtml(e)); updatePreview(); }
function addProject(p) { $('proj-list').insertAdjacentHTML('beforeend', projHtml(p)); updateCounters(); updatePreview(); }
function removeEntry(btn) { btn.closest('.entry').remove(); updatePreview(); }

function toggleCurrent(box) {
  const end = box.closest('.entry').querySelector('[data-field="end"]');
  end.disabled = box.checked;
  if (box.checked) end.value = '';
}

function readEntries(selector) {
  return [...document.querySelectorAll(selector)].map(entry => {
    const data = {};
    entry.querySelectorAll('[data-field]').forEach(f => { data[f.dataset.field] = f.type === 'checkbox' ? f.checked : f.value.trim(); });
    return data;
  }).filter(d => Object.entries(d).some(([k, v]) => k !== 'current' && v));
}

// Skills
function addSkill(raw) {
  const name = (raw || '').trim().replace(/,$/, '').slice(0, 30);
  if (!name || skills.some(s => s.toLowerCase() === name.toLowerCase())) return;
  if (skills.length >= MAX_SKILLS) { showToast('You can add up to ' + MAX_SKILLS + ' skills. Remove one to add another.'); return; }
  skills.push(name);
  renderSkills();
}
function removeSkill(i) { skills.splice(i, 1); renderSkills(); }

function onSkillKey(e) {
  const input = e.target;
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addSkill(input.value);
    input.value = '';
  } else if (e.key === 'Backspace' && !input.value && skills.length) {
    removeSkill(skills.length - 1);
  }
}

function renderSkills() {
  $('skill-tags').innerHTML = skills.map((s, i) =>
    '<span class="inline-flex items-center gap-1 bg-appleBlue/10 text-blueText border border-appleBlue/25 text-footnote font-medium pl-2.5 pr-1 py-0.5 rounded-full">' + esc(s) +
    '<button type="button" onclick="event.stopPropagation(); removeSkill(' + i + ')" aria-label="Remove ' + esc(s) + '" class="w-5 h-5 rounded-full hover:bg-appleBlue/20 leading-none">×</button></span>'
  ).join('');
  $('skill-count').textContent = skills.length + '/' + MAX_SKILLS;
  const lower = skills.map(s => s.toLowerCase());
  const suggestions = SKILL_SUGGESTIONS[$('pf-track').value].filter(s => !lower.includes(s.toLowerCase()));
  $('skill-suggestions').innerHTML = suggestions.length
    ? suggestions.map(s => '<button type="button" class="chip" data-skill="' + esc(s) + '" onclick="addSkill(this.dataset.skill)">＋ ' + esc(s) + '</button>').join('')
    : '<p class="pf-hint">You\'ve added all the suggestions.</p>';
  updatePreview();
}

// Photo: center-crop and resize to 256px so it fits in browser storage
function handlePhoto(input) {
  const file = input.files[0];
  input.value = '';
  const err = $('pf-photo-error');
  err.classList.add('hidden');
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    err.textContent = 'Choose an image file, such as a JPG or PNG.';
    err.classList.remove('hidden');
    return;
  }
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const size = 256;
    const side = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
    photoData = canvas.toDataURL('image/jpeg', 0.85);
    URL.revokeObjectURL(url);
    updatePhotoUI();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    err.textContent = "That file couldn't be opened as an image. Try a different photo.";
    err.classList.remove('hidden');
  };
  img.src = url;
}
function removePhoto() { photoData = null; updatePhotoUI(); }
function updatePhotoUI() {
  setAvatar($('pf-photo-preview'), photoData, initials($('pf-first').value, $('pf-last').value));
  $('pf-photo-remove').classList.toggle('hidden', !photoData);
  updatePreview();
}

function onTrackChange() {
  const isDev = $('pf-track').value === 'Software Developer';
  $('pf-code-label').textContent = isDev ? 'GitHub' : 'Portfolio';
  $('pf-code').placeholder = isDev ? 'github.com/your-name' : 'Link to your portfolio, Notion, or case studies';
  renderSkills();
}

function updateCounters() {
  $('pf-headline-count').textContent = $('pf-headline').value.length + '/80';
  $('pf-about-count').textContent = $('pf-about').value.length + '/500';
  document.querySelectorAll('[data-count-for]').forEach(c => {
    const field = $(c.dataset.countFor);
    if (field) c.textContent = field.value.length + '/200';
  });
}

function collectProfile() {
  return {
    first: $('pf-first').value.trim(),
    last: $('pf-last').value.trim(),
    track: $('pf-track').value,
    headline: $('pf-headline').value.trim(),
    location: $('pf-location').value.trim(),
    setting: getChecked('pf-setting')[0] || '',
    about: $('pf-about').value.trim(),
    linkedin: $('pf-linkedin').value.trim(),
    code: $('pf-code').value.trim(),
    website: $('pf-website').value.trim(),
    experience: readEntries('[data-exp]'),
    skills: [...skills],
    projects: readEntries('[data-proj]'),
    goals: getChecked('pf-goals'),
    hours: getChecked('pf-hours')[0] || '',
    idea: getChecked('pf-idea')[0] || '',
    industries: getChecked('pf-industries'),
    available: $('pf-available').value,
    photo: photoData,
  };
}

function loadProfileForm(account) {
  const p = account.profile || {};
  $('pf-first').value = account.first || '';
  $('pf-last').value = account.last || '';
  $('pf-track').value = account.track || 'Software Developer';
  $('pf-headline').value = p.headline || '';
  $('pf-location').value = p.location || '';
  $('pf-about').value = p.about || '';
  $('pf-linkedin').value = p.linkedin || '';
  $('pf-code').value = p.code || '';
  $('pf-website').value = p.website || '';
  $('pf-available').value = p.available || '';
  setChecked('pf-setting', p.setting ? [p.setting] : []);
  setChecked('pf-goals', (p.goals || []).map(g => g === 'Paid gig' ? 'Paid work' : g));
  setChecked('pf-hours', p.hours ? [p.hours] : []);
  setChecked('pf-idea', p.idea ? [p.idea] : []);
  setChecked('pf-industries', p.industries || []);
  $('exp-list').innerHTML = (p.experience && p.experience.length ? p.experience : [{}]).map(expHtml).join('');
  $('proj-list').innerHTML = (p.projects && p.projects.length ? p.projects : [{}]).map(projHtml).join('');
  skills = [...(p.skills || [])];
  photoData = p.photo || null;
  document.querySelectorAll('#profile-form .pf-error').forEach(e => e.classList.add('hidden'));
  document.querySelectorAll('#profile-form .invalid').forEach(e => e.classList.remove('invalid'));
  $('pf-photo-error').classList.add('hidden');
  cancelImport();
  onTrackChange();
  updateCounters();
  updatePhotoUI();
}

function updatePreview() {
  const d = collectProfile();
  setAvatar($('pv-photo'), d.photo, initials(d.first, d.last));
  $('pv-name').textContent = (d.first + ' ' + d.last).trim() || 'Your name';
  const headline = $('pv-headline');
  headline.textContent = d.headline || 'Your headline appears here';
  headline.classList.toggle('text-label-3', !d.headline);
  const track = $('pv-track');
  const isBiz = d.track === 'Business Developer';
  track.textContent = isBiz ? 'Business Dev' : 'Software Dev';
  track.className = 'px-2.5 py-0.5 rounded-full font-semibold ' + (isBiz ? 'bg-applePurple/15 text-purpleText' : 'bg-appleBlue/10 text-blueText');
  $('pv-location').textContent = [d.location, d.setting].filter(Boolean).join(' · ');
  $('pv-skills').innerHTML = d.skills.slice(0, 5).map(s => '<span class="bg-fill text-label text-caption px-2 py-0.5 rounded-md">' + esc(s) + '</span>').join('');
  $('pv-looking').textContent = d.goals.length
    ? 'Looking for: ' + d.goals.join(', ') + (d.hours ? ' · ' + d.hours + ' hrs/week' : '')
    : '';
  updateStrength(d);
}

function updateStrength(d) {
  const checks = [
    ['Add a profile photo', !!d.photo, 15, 'basics'],
    ['Write a headline', !!d.headline, 10, 'basics'],
    ['Write your About section', !!d.about, 15, 'basics'],
    ['Add a work experience', d.experience.some(e => e.title && e.company), 15, 'experience'],
    ['Add at least 3 skills', d.skills.length >= 3, 15, 'skills'],
    ['Add a project', d.projects.some(p => p.title), 15, 'projects'],
    ['Choose your goals and hours', d.goals.length > 0 && !!d.hours, 15, 'looking'],
  ];
  const pct = checks.reduce((sum, [, done, weight]) => sum + (done ? weight : 0), 0);
  $('strength-pct').textContent = pct + '%';
  const bar = $('strength-bar');
  bar.style.width = pct + '%';
  bar.className = 'h-full rounded-full transition-all duration-500 ' + (pct === 100 ? 'bg-appleGreen' : pct >= 50 ? 'bg-appleBlue' : 'bg-appleOrange');
  $('strength-list').innerHTML = checks.map(([label, done, , section]) => done
    ? '<li class="flex items-center gap-2 text-label-3"><span class="text-greenText font-bold">✓</span>' + label + '</li>'
    : '<li><button type="button" onclick="goToSection(\'' + section + '\')" class="flex items-center gap-2 text-label hover:text-blueText text-left"><span class="w-3 h-3 rounded-full border-2 border-label-3 shrink-0"></span>' + label + '</button></li>'
  ).join('');
}

function goToSection(section) {
  $('pf-section-' + section).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Accepts "github.com/me" and returns "https://github.com/me"; null if not a valid link
function normalizeUrl(value) {
  const v = value.trim();
  if (!v) return '';
  const withScheme = /^https?:\/\//i.test(v) ? v : 'https://' + v;
  try {
    const u = new URL(withScheme);
    return u.hostname.includes('.') ? u.href : null;
  } catch { return null; }
}

function saveProfile(e) {
  e.preventDefault();
  const invalid = [];

  [['pf-first'], ['pf-last'], ['pf-headline']].forEach(([id]) => {
    if (!$(id).value.trim()) { showError(id); $(id).classList.add('invalid'); invalid.push($(id)); }
  });

  document.querySelectorAll('#profile-form input[type="url"]').forEach(input => {
    const normalized = normalizeUrl(input.value);
    if (normalized === null) {
      input.classList.add('invalid');
      if ($(input.id + '-error')) showError(input.id);
      invalid.push(input);
    } else {
      input.value = normalized;
    }
  });

  if (invalid.length) {
    invalid[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Fix the highlighted fields to save your profile.');
    return;
  }

  const account = getAccounts()[load(SESSION_KEY, '')];
  if (!account) return;
  const { first, last, track, ...profile } = collectProfile();
  Object.assign(account, { first, last, track, profile });
  if (!saveAccount(account)) {
    showToast("Couldn't save. This browser's storage is full; try a smaller photo.");
    return;
  }
  renderUser(account);
  renderPeople();
  $('profile-banner').classList.add('hidden');
  showToast('Profile saved');
}
