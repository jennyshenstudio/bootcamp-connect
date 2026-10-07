// Bootcamp Connect prototype: CV / LinkedIn import (specs/03-profile-import.md)
// Plain script (shared globals); load order is set in prototype.html.

// ---------- Import from CV / LinkedIn PDF (specs/03-profile-import.md) ----------
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/';
const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
let importCtl = null;
let importResult = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}

// Text extraction runs entirely in the browser
async function extractPdfText(file) {
  await loadScript(CDN + 'pdf.js/3.11.174/pdf.min.js');
  // Loading the worker as a script lets pdf.js run on the main thread (cross-origin Workers are blocked)
  await loadScript(CDN + 'pdf.js/3.11.174/pdf.worker.min.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = CDN + 'pdf.js/3.11.174/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
    const content = await (await pdf.getPage(i)).getTextContent();
    let text = '', lastY = null;
    for (const item of content.items) {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2 && !text.endsWith('\n')) text += '\n';
      text += item.str + (item.hasEOL ? '\n' : '');
      lastY = y;
    }
    pages.push(text);
  }
  return pages.join('\n');
}

async function extractDocxText(file) {
  await loadScript(CDN + 'mammoth/1.6.0/mammoth.browser.min.js');
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
}

async function extractText(file) {
  const name = file.name.toLowerCase();
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return extractPdfText(file);
  if (name.endsWith('.docx')) return extractDocxText(file);
  if (name.endsWith('.doc')) throw new Error('Older .doc files aren\'t supported. Save it as .docx or PDF and try again.');
  if (file.type.startsWith('text/') || /\.(txt|md)$/.test(name)) return file.text();
  throw new Error('Upload a PDF, Word (.docx), or text file.');
}

let samplePromise = null;
function getSample() {
  if (!samplePromise) {
    samplePromise = window.claude && window.claude.use ? window.claude.use('sample').catch(() => null) : Promise.resolve(null);
  }
  return samplePromise;
}

function importPrompt(text) {
  return 'Extract profile details from this CV or LinkedIn profile export for a bootcamp networking app.\n' +
    'Reply with only a JSON object in exactly this shape (use "" or [] when something is not in the text; never invent facts):\n' +
    '{"first_name": string, "last_name": string,\n' +
    ' "headline": string (max 80 chars; if none is stated, write one from the most recent role, e.g. "Frontend Developer at Shopify"),\n' +
    ' "location": string (city, region),\n' +
    ' "about": string (max 500 chars, from the summary or profile section, first person),\n' +
    ' "linkedin": string (URL), "github": string (URL), "website": string (URL, other personal or portfolio site),\n' +
    ' "experience": [{"title": string, "company": string, "start": "YYYY-MM", "end": "YYYY-MM" or "", "current": boolean, "desc": string (max 400 chars)}] (most recent first, max 8),\n' +
    ' "skills": [string] (short skill names, most relevant first, max 15),\n' +
    ' "projects": [{"title": string, "link": string, "role": string, "desc": string (max 200 chars)}] (max 5)}\n' +
    'Dates: use "YYYY-01" when only a year is given. Mark current roles with "current": true and end "".\n\n' +
    'CV text:\n"""\n' + text.slice(0, 30000) + '\n"""';
}

// ----- Fallback: built-in reader for when Claude isn't available (e.g. opened as a local file) -----
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const MONTH_RE = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
const DATE_RANGE_RE = new RegExp('((?:' + MONTH_RE + '\\s+)?\\d{4}|\\d{1,2}/\\d{4})\\s*(?:-|–|—|to)\\s*((?:' + MONTH_RE + '\\s+)?\\d{4}|\\d{1,2}/\\d{4}|present|current|now|today)', 'i');
const HEADINGS = {
  about: /^(summary|about( me)?|profile|professional summary|personal statement)$/i,
  experience: /^(experience|work experience|professional experience|employment( history)?|work history|career history)$/i,
  skills: /^(skills|top skills|technical skills|core skills|key skills|skills & tools|tools)$/i,
  projects: /^(projects|personal projects|selected projects|portfolio)$/i,
  other: /^(education|certifications?|licenses( & certifications)?|languages|honors[- &]*awards|awards|interests|volunteer( experience)?|publications|references|contact|courses)$/i,
};

function toYearMonth(s) {
  if (!s) return '';
  const slash = s.match(/(\d{1,2})\/(\d{4})/);
  if (slash) return slash[2] + '-' + String(slash[1]).padStart(2, '0');
  const year = (s.match(/\d{4}/) || [])[0];
  if (!year) return '';
  const m = s.toLowerCase().match(/[a-z]+/);
  const month = m && MONTHS[m[0].slice(0, 4)] || m && MONTHS[m[0].slice(0, 3)] || 1;
  return year + '-' + String(month).padStart(2, '0');
}

function splitTitleCompany(line) {
  const m = line.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i) || line.match(/^(.+?)\s+[|–—-]\s+(.+)$/) || line.match(/^(.+?),\s+(.+)$/);
  return m ? { title: m[1].trim(), company: m[2].trim() } : null;
}

const BULLET_RE = /^[-*●▪•◦]\s*/;
const URL_TOKEN_RE = /(?:https?:\/\/\S+|(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+\/[^\s,;)]+)/i;
const LOCATION_RE = /^[A-Z][A-Za-z.'\- ]+,\s*[A-Z][A-Za-z.'\- ]+(?:,\s*[A-Z][A-Za-z.'\- ]+)?$/;
const isUrlOnly = l => /^\S+$/.test(l) && URL_TOKEN_RE.test(l);
const stripBullets = t => t.replace(/(^|\s)[●▪•◦]\s*/g, '$1').replace(BULLET_RE, '').replace(/\s+/g, ' ').trim();

function basicParse(text) {
  const lines = text.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  // PDFs wrap long links onto the next line after a hyphen or slash; rejoin them
  const flat = lines.join('\n').replace(/([-\/])\n(?=[A-Za-z0-9])/g, '$1').replace(/\n/g, ' ');
  const url = re => ((flat.match(re) || [])[0] || '').replace(/[).,;]+$/, '');
  const result = {
    headline: '', location: '', about: '',
    linkedin: url(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+/i),
    github: url(/(?:https?:\/\/)?github\.com\/[A-Za-z0-9_-]+/i),
    website: '', experience: [], skills: [], projects: [],
  };

  // Group lines under recognised section headings
  const sections = { top: [] };
  const preamble = [];   // everything before Summary / Experience (name, headline, contact, LinkedIn sidebar)
  let current = 'top', inBody = false;
  for (const line of lines) {
    const h = line.replace(/:$/, '');
    const key = Object.keys(HEADINGS).find(k => HEADINGS[k].test(h));
    if (key === 'about' || key === 'experience') inBody = true;
    if (!inBody && !key) preamble.push(line);
    if (key) { current = key; sections[key] = sections[key] || []; continue; }
    (sections[current] = sections[current] || []).push(line);
  }

  // Location, then the headline that sits just above it (CVs and LinkedIn PDFs both use name / headline / location)
  const contactish = l => /@|https?:|www\.|linkedin\.com|github\.com|\d{3}[\s.-]?\d{3}/i.test(l);
  const locIdx = preamble.findIndex(l => l.length <= 60 && l.split(' ').length <= 7 && LOCATION_RE.test(l) && !contactish(l));
  if (locIdx >= 0) result.location = preamble[locIdx];
  const headlineOk = l => l && l.length >= 8 && l.length <= 100 && !contactish(l) && !LOCATION_RE.test(l);
  const headlineLine = locIdx > 0 && headlineOk(preamble[locIdx - 1]) ? preamble[locIdx - 1]
    : (sections.top[0] && headlineOk(sections.top[1]) ? sections.top[1] : '');
  result.headline = headlineLine.slice(0, 80);

  // Name: two lines above the location (name / headline / location), else the first name-like line at the top
  const nameLike = l => l && l.length <= 40 && /^[A-Z][A-Za-z'’-]+(?: [A-Z][A-Za-z'’.-]*){1,3}$/.test(l) && !LOCATION_RE.test(l);
  const nameLine = locIdx >= 2 && nameLike(preamble[locIdx - 2]) ? preamble[locIdx - 2]
    : (sections.top.find(nameLike) || '');
  if (nameLine) {
    const parts = nameLine.split(' ');
    result.first_name = parts[0];
    result.last_name = parts.slice(1).join(' ');
  }

  // Personal website: a domain in the contact area that isn't LinkedIn, GitHub, or an email address
  const site = (preamble.join(' ').match(/(?<![@\w.])(?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*\.(?:com|dev|io|me|co|app|net|org|design|ai|xyz|site|tech|page)(?:\/[^\s·|,]*)?/gi) || [])
    .find(u => !/linkedin\.com|github\.com/i.test(u));
  if (site) result.website = site;

  result.about = (sections.about || []).join(' ').slice(0, 500);

  // Skills: comma-style lists can wrap across lines, so join them first; otherwise one skill per line
  const skillLines = [];
  for (const line of sections.skills || []) {
    if (line.split(' ').length > 6 && !/[,•|;·]/.test(line)) break;
    skillLines.push(line);
  }
  const listStyle = skillLines.some(l => /[,;|]/.test(l));
  const rawSkills = listStyle ? skillLines.join(' ').split(/[,•|;·]/) : skillLines.flatMap(l => l.split(/[•·]/));
  const skillSet = [];
  rawSkills.map(s => s.replace(/^[A-Za-z ]{2,25}:\s*/, '').replace(BULLET_RE, '').trim())
    .filter(s => s && s.length <= 30)
    .forEach(s => { if (!skillSet.some(x => x.toLowerCase() === s.toLowerCase())) skillSet.push(s); });
  result.skills = skillSet.slice(0, 15);

  // Experience: anchor on date-range lines, then read the title/company lines above each one
  const exp = sections.experience || [];
  const dateIdx = exp.map((l, i) => DATE_RANGE_RE.test(l) ? i : -1).filter(i => i >= 0);
  const companyOk = l => l && l.length <= 60 && !BULLET_RE.test(l) && !/\.$/.test(l);
  const heads = dateIdx.map((di, n) => {
    const m = exp[di].match(DATE_RANGE_RE);
    const rest = exp[di].replace(m[0], '').replace(/\(.*?\)/g, '').replace(/[|·,–—-]\s*$/, '').trim();
    const prevEnd = n > 0 ? dateIdx[n - 1] : -1;
    const prev1 = di - 1 > prevEnd ? exp[di - 1] : '';
    const prev2 = di - 2 > prevEnd ? exp[di - 2] : '';
    let title = '', company = '', start = di;
    const sameLine = rest && splitTitleCompany(rest);
    const split = !rest && prev1 && splitTitleCompany(prev1);
    if (sameLine) ({ title, company } = sameLine);
    else if (rest) { title = rest; company = prev1; start = prev1 ? di - 1 : di; }
    else if (split) { ({ title, company } = split); start = di - 1; }
    else {
      title = prev1; start = prev1 ? di - 1 : di;
      if (companyOk(prev2)) { company = prev2; start = di - 2; }   // LinkedIn PDF: company, then title, then dates
    }
    return { di, m, title, company, start };
  });
  heads.forEach((h, n) => {
    const descEnd = n + 1 < heads.length ? heads[n + 1].start : exp.length;
    const desc = stripBullets(exp.slice(h.di + 1, Math.max(h.di + 1, descEnd)).join(' '));
    const isCurrent = /present|current|now|today/i.test(h.m[2]);
    if (h.title || h.company) result.experience.push({
      title: h.title.slice(0, 80), company: h.company.slice(0, 80),
      start: toYearMonth(h.m[1]), end: isCurrent ? '' : toYearMonth(h.m[2]), current: isCurrent, desc: desc.slice(0, 400),
    });
  });
  result.experience = result.experience.slice(0, 8);

  // Projects: short title lines, followed by description lines; links go to the Link field
  let proj = null;
  for (const line of sections.projects || []) {
    const looksLikeTitle = !BULLET_RE.test(line) && line.length <= 60 && line.split(' ').length <= 6 && !/\.$/.test(line) && !isUrlOnly(line);
    if (looksLikeTitle && (!proj || proj.desc)) {
      proj = { title: line, link: '', role: '', desc: '' };
      result.projects.push(proj);
    } else if (proj) {
      let body = stripBullets(line);
      const link = body.match(URL_TOKEN_RE);
      if (link) {
        if (!proj.link) proj.link = link[0].replace(/[.,;]+$/, '');
        body = body.replace(link[0], '').replace(/\s+([.,;])/g, '$1').trim();
      }
      proj.desc = (proj.desc + ' ' + body).trim().slice(0, 200);
    }
  }
  result.projects = result.projects.slice(0, 5);

  const first = result.experience[0];
  if (!result.headline && first && first.title) result.headline = (first.title + (first.company ? ' at ' + first.company : '')).slice(0, 80);
  return result;
}

// Coerce whatever came back into the shape the form expects
function cleanImport(r) {
  const str = (v, max) => String(v ?? '').trim().slice(0, max);
  const ym = v => /^\d{4}-\d{2}$/.test(String(v || '')) ? String(v) : '';
  const arr = v => Array.isArray(v) ? v : [];
  return {
    first: str(r.first_name, 40), last: str(r.last_name, 60),
    headline: str(r.headline, 80), location: str(r.location, 80), about: str(r.about, 500),
    linkedin: str(r.linkedin, 200), code: str(r.github, 200), website: str(r.website, 200),
    experience: arr(r.experience).slice(0, 8).map(e => ({
      title: str(e.title, 80), company: str(e.company, 80), start: ym(e.start),
      end: e.current ? '' : ym(e.end), current: !!e.current, desc: str(e.desc, 400),
    })).filter(e => e.title || e.company),
    skills: [...new Set(arr(r.skills).map(s => str(s, 30)).filter(Boolean))].slice(0, 15),
    projects: arr(r.projects).slice(0, 5).map(p => ({
      title: str(p.title, 80), link: str(p.link, 200), role: str(p.role, 80), desc: str(p.desc, 200),
    })).filter(p => p.title),
  };
}

function showImportState(state) {
  $('import-idle').classList.toggle('hidden', state !== 'idle');
  $('import-busy').classList.toggle('hidden', state !== 'busy');
  $('import-review').classList.toggle('hidden', state !== 'review');
}

function importError(message) {
  showImportState('idle');
  $('import-error').textContent = message;
  $('import-error').classList.remove('hidden');
}

function resetImport() {
  importResult = null;
  $('import-error').classList.add('hidden');
  showImportState('idle');
}

function cancelImport() {
  if (importCtl) importCtl.abort();
  importCtl = null;
  resetImport();
}

async function handleImportFile(file) {
  if (!file) return;
  $('import-error').classList.add('hidden');
  if (file.size > MAX_IMPORT_BYTES) return importError('That file is over 10 MB. Upload a smaller PDF or Word file.');

  const ctl = importCtl = new AbortController();
  showImportState('busy');
  $('import-status').textContent = 'Reading ' + file.name + '…';

  let text;
  try {
    text = (await extractText(file)).trim();
  } catch (e) {
    if (ctl.signal.aborted) return;
    return importError(e.message.startsWith('Could not load') ? 'Couldn\'t load the file reader. Check your internet connection and try again.' : e.message || 'That file couldn\'t be read. Try a PDF or .docx file.');
  }
  if (ctl.signal.aborted) return;
  if (text.length < 40) return importError('No text was found in that file. If it\'s a scanned image, upload a PDF exported from Word, Google Docs, or LinkedIn instead.');

  let raw = null, method = 'basic';
  const sample = await getSample();
  if (ctl.signal.aborted) return;
  if (sample) {
    $('import-status').textContent = 'Claude is picking out your experience and skills…';
    try {
      raw = await sample.json(importPrompt(text), { signal: ctl.signal });
      method = 'claude';
    } catch (e) {
      if (e && e.code === 'cancelled') return;
      raw = null;
    }
  }
  if (ctl.signal.aborted) return;
  if (!raw) raw = basicParse(text);

  importResult = cleanImport(raw || {});
  importCtl = null;
  renderImportReview(method, file.name);
}

function reviewRow(id, checked, labelHtml) {
  return '<label for="' + id + '" class="flex items-start gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-fill">' +
    '<input id="' + id + '" type="checkbox" class="mt-0.5 w-4 h-4 accent-appleBlue shrink-0"' + (checked ? ' checked' : '') + '>' +
    '<span class="min-w-0">' + labelHtml + '</span></label>';
}

function fmtMonth(ym) {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(+y, +m - 1).toLocaleString('en', { month: 'short' }) + ' ' + y;
}

function renderImportReview(method, fileName) {
  const r = importResult;
  const current = collectProfile();
  const blocks = [];

  const importedName = (r.first + ' ' + r.last).trim();
  const currentName = (current.first + ' ' + current.last).trim();
  const nameRow = importedName
    ? reviewRow('imp-basic-name', importedName.toLowerCase() !== currentName.toLowerCase(),
        '<span class="font-medium text-label">Name:</span> <span class="text-label-2">' + esc(importedName) + '</span>' +
        (currentName && importedName.toLowerCase() !== currentName.toLowerCase() ? ' <span class="pf-hint">(replaces ' + esc(currentName) + ')</span>' : ''))
    : '';
  const basics = [['headline', 'Headline'], ['location', 'Location'], ['about', 'About'], ['linkedin', 'LinkedIn'], ['code', 'GitHub / Portfolio'], ['website', 'Website']]
    .filter(([k]) => r[k]);
  if (basics.length || nameRow) {
    blocks.push('<div><p class="pf-label">Basics</p>' + nameRow + basics.map(([k, label]) =>
      reviewRow('imp-basic-' + k, !current[k],
        '<span class="font-medium text-label">' + label + ':</span> <span class="text-label-2 break-words">' + esc(r[k].length > 140 ? r[k].slice(0, 140) + '…' : r[k]) + '</span>' +
        (current[k] ? ' <span class="pf-hint">(replaces what you have)</span>' : ''))
    ).join('') + '</div>');
  }

  if (r.experience.length) {
    const have = current.experience.map(e => (e.title + '|' + e.company).toLowerCase());
    blocks.push('<div><p class="pf-label">Work experience</p>' + r.experience.map((e, i) => {
      const dup = have.includes((e.title + '|' + e.company).toLowerCase());
      const dates = [fmtMonth(e.start), e.current ? 'Present' : fmtMonth(e.end)].filter(Boolean).join(' – ');
      return reviewRow('imp-exp-' + i, !dup,
        '<span class="font-medium text-label">' + esc(e.title || 'Untitled role') + '</span>' + (e.company ? ' · ' + esc(e.company) : '') +
        (dates ? '<span class="block pf-hint">' + esc(dates) + '</span>' : '') + (dup ? '<span class="block pf-hint">Already on your profile</span>' : ''));
    }).join('') + '</div>');
  }

  if (r.skills.length) {
    const have = current.skills.map(s => s.toLowerCase());
    blocks.push('<div><p class="pf-label">Skills <span class="pf-hint font-normal">(your profile holds up to ' + MAX_SKILLS + ')</span></p><div class="flex flex-wrap gap-1.5">' +
      r.skills.map((s, i) => {
        const dup = have.includes(s.toLowerCase());
        return '<label class="cursor-pointer"><input type="checkbox" id="imp-skill-' + i + '" class="peer sr-only"' + (dup ? ' disabled' : ' checked') + '><span class="chip' + (dup ? ' opacity-50' : '') + '">' + esc(s) + (dup ? ' ✓' : '') + '</span></label>';
      }).join('') + '</div></div>');
  }

  if (r.projects.length) {
    blocks.push('<div><p class="pf-label">Projects</p>' + r.projects.map((p, i) =>
      reviewRow('imp-proj-' + i, true, '<span class="font-medium text-label">' + esc(p.title) + '</span>' + (p.desc ? '<span class="block pf-hint">' + esc(p.desc) + '</span>' : ''))
    ).join('') + '</div>');
  }

  const counts = [
    r.experience.length && r.experience.length + ' experience' + (r.experience.length > 1 ? 's' : ''),
    r.skills.length && r.skills.length + ' skill' + (r.skills.length > 1 ? 's' : ''),
    r.projects.length && r.projects.length + ' project' + (r.projects.length > 1 ? 's' : ''),
  ].filter(Boolean);

  if (!blocks.length) {
    return importError('We couldn\'t find experience, skills, or other details in ' + fileName + '. Try your LinkedIn PDF or a CV with clear section headings.');
  }

  $('import-summary').textContent = 'Found ' + (counts.length ? counts.join(', ') : 'some details') + ' in ' + fileName;
  $('import-method').textContent = method === 'claude'
    ? 'Read by Claude. Untick anything you don\'t want, then add it to your profile.'
    : 'Read with the basic importer, which can miss or mix up details. Untick anything that looks wrong.';
  $('import-review-body').innerHTML = blocks.join('');
  showImportState('review');
}

function applyImport() {
  const r = importResult;
  if (!r) return;
  const isChecked = id => { const el = $(id); return !!el && el.checked && !el.disabled; };

  if ((r.first || r.last) && isChecked('imp-basic-name')) {
    if (r.first) $('pf-first').value = r.first;
    $('pf-last').value = r.last;
    ['pf-first', 'pf-last'].forEach(id => { $(id).classList.remove('invalid'); clearError(id); });
    updatePhotoUI();
  }
  ['headline', 'location', 'about', 'linkedin', 'code', 'website'].forEach(k => {
    if (r[k] && isChecked('imp-basic-' + k)) $('pf-' + k).value = r[k];
  });

  const exps = r.experience.filter((_, i) => isChecked('imp-exp-' + i));
  if (exps.length) {
    // Drop the blank starter entry before adding imported ones
    document.querySelectorAll('#exp-list [data-exp]').forEach(entry => {
      if (![...entry.querySelectorAll('[data-field]')].some(f => f.type === 'checkbox' ? f.checked : f.value.trim())) entry.remove();
    });
    $('exp-list').insertAdjacentHTML('beforeend', exps.map(expHtml).join(''));
  }

  const newSkills = r.skills.filter((_, i) => isChecked('imp-skill-' + i));
  const room = MAX_SKILLS - skills.length;
  newSkills.slice(0, room).forEach(s => { if (!skills.some(x => x.toLowerCase() === s.toLowerCase())) skills.push(s); });
  const skipped = Math.max(0, newSkills.length - room);

  const projs = r.projects.filter((_, i) => isChecked('imp-proj-' + i));
  if (projs.length) {
    document.querySelectorAll('#proj-list [data-proj]').forEach(entry => {
      if (![...entry.querySelectorAll('[data-field]')].some(f => f.value.trim())) entry.remove();
    });
    $('proj-list').insertAdjacentHTML('beforeend', projs.map(projHtml).join(''));
  }

  renderSkills();
  updateCounters();
  updatePreview();
  resetImport();
  $('pf-section-basics').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(skipped
    ? 'Added to your form. ' + skipped + ' skill' + (skipped > 1 ? 's' : '') + ' didn\'t fit the 10-skill limit. Review, then save.'
    : 'Added to your form. Review the details, then save your profile.');
}
