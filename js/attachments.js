// Bootcamp Connect prototype: post attachments (photos, videos, documents, links) (specs/05-feed.md).
// Plain script (shared globals); load order is set in prototype.html.
// Uploaded files live in this browser's IndexedDB; posts keep only metadata.

const MAX_ATTACHMENTS = 6;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_DOC_BYTES = 20 * 1024 * 1024;
const DOC_TYPES = {
  pdf: { label: 'PDF', color: '#FF3B30' }, doc: { label: 'Word', color: '#0A84FF' }, docx: { label: 'Word', color: '#0A84FF' },
  ppt: { label: 'Slides', color: '#FF9500' }, pptx: { label: 'Slides', color: '#FF9500' }, key: { label: 'Keynote', color: '#FF9500' },
  xls: { label: 'Spreadsheet', color: '#34C759' }, xlsx: { label: 'Spreadsheet', color: '#34C759' }, csv: { label: 'Spreadsheet', color: '#34C759' },
  numbers: { label: 'Numbers', color: '#34C759' }, pages: { label: 'Pages', color: '#FF9500' }, txt: { label: 'Text', color: '#8E8E93' }, md: { label: 'Text', color: '#8E8E93' },
};

// ----- Storage -----
let idbPromise = null;
const memFiles = new Map();   // fallback when IndexedDB is unavailable (private windows): kept for this session only
const urlCache = new Map();

function idb() {
  if (!idbPromise) {
    idbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open('bc-attachments', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('files');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) { reject(e); }
    }).catch(() => null);
  }
  return idbPromise;
}
async function idbPut(id, blob) {
  const db = await idb();
  if (!db) throw new Error('no-idb');
  await new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put(blob, id);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
}
async function idbGet(id) {
  const db = await idb();
  if (!db) return null;
  return new Promise(resolve => {
    try {
      const req = db.transaction('files').objectStore('files').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}
async function idbDelete(id) {
  memFiles.delete(id);
  const db = await idb();
  if (!db) return;
  try { db.transaction('files', 'readwrite').objectStore('files').delete(id); } catch {}
}

async function attachmentBlob(att) {
  if (att.src) return null;
  return memFiles.get(att.id) || await idbGet(att.id);
}
async function attachmentURL(att) {
  if (att.src) return att.src;
  if (urlCache.has(att.id)) return urlCache.get(att.id);
  const blob = await attachmentBlob(att);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(att.id, url);
  return url;
}
async function attachmentBytes(att) {
  if (att.src && att.src.startsWith('data:')) {
    const bin = atob(att.src.split(',')[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  const blob = await attachmentBlob(att);
  return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
const extOf = name => (name.split('.').pop() || '').toLowerCase();
const docInfo = att => DOC_TYPES[extOf(att.name)] || { label: 'File', color: '#8E8E93' };
const domainOf = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };

// Photos: keep the aspect ratio, longest side 1600px, JPEG (GIFs stay as they are to keep animation)
function downscaleImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => blob ? resolve({ blob, w, h }) : reject(new Error('encode')), 'image/jpeg', 0.86);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url;
  });
}

// Validates and stores one file; resolves with attachment metadata or rejects with a viewer-facing message.
async function processAttachment(file) {
  const id = 'f-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  const ext = extOf(file.name);
  let att, blob = file;
  if (file.type.startsWith('image/')) {
    if (file.size > MAX_IMAGE_BYTES) throw new Error(file.name + ' is over 15 MB. Choose a smaller photo.');
    if (file.type === 'image/gif' && file.size <= 5 * 1024 * 1024) {
      att = { id, kind: 'image', name: file.name, mime: file.type, size: file.size };
    } else {
      let out;
      try { out = await downscaleImage(file); } catch { throw new Error(file.name + " couldn't be opened as an image. Try a JPG or PNG."); }
      blob = out.blob;
      att = { id, kind: 'image', name: file.name.replace(/\.[^.]+$/, '') + '.jpg', mime: 'image/jpeg', size: blob.size, w: out.w, h: out.h };
    }
  } else if (file.type.startsWith('video/')) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error(file.name + ' is ' + fmtSize(file.size) + '. Videos can be up to 50 MB.');
    att = { id, kind: 'video', name: file.name, mime: file.type, size: file.size };
  } else if (DOC_TYPES[ext]) {
    if (file.size > MAX_DOC_BYTES) throw new Error(file.name + ' is ' + fmtSize(file.size) + '. Documents can be up to 20 MB.');
    att = { id, kind: 'doc', name: file.name, mime: file.type || 'application/octet-stream', size: file.size };
  } else {
    throw new Error(file.name + " isn't supported. Attach photos, videos, or documents (PDF, Word, slides, spreadsheets, text).");
  }
  try { await idbPut(id, blob); }
  catch { memFiles.set(id, blob); att.sessionOnly = true; }
  return att;
}

// ----- Rendering -----
function attTile(post, att, cls, extra = '') {
  const media = att.kind === 'video'
    ? '<video class="w-full h-full object-cover" muted playsinline preload="metadata" ' + (att.src ? 'src="' + esc(att.src) + '"' : 'data-att-id="' + att.id + '"') + ' data-post-id="' + post.id + '"></video>' +
      '<span class="absolute inset-0 flex items-center justify-center"><span class="w-12 h-12 rounded-full bg-black/45 backdrop-blur flex items-center justify-center text-white"><svg class="w-5 h-5 ml-0.5" viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg></span></span>'
    : '<img class="w-full h-full object-cover" alt="' + esc(att.name) + '" loading="lazy" ' + (att.src ? 'src="' + esc(att.src) + '"' : 'data-att-id="' + att.id + '"') + ' data-post-id="' + post.id + '">';
  return '<button type="button" class="relative overflow-hidden bg-fill ' + cls + '" onclick="openViewer(\'' + post.id + '\', \'' + att.id + '\')" aria-label="Open ' + esc(att.name) + '">' + media + extra + '</button>';
}

function renderAttachments(post) {
  const atts = post.attachments || [];
  if (!atts.length) return '';
  const media = atts.filter(a => a.kind === 'image' || a.kind === 'video');
  const docs = atts.filter(a => a.kind === 'doc');
  const links = atts.filter(a => a.kind === 'link');
  let html = '';
  if (media.length === 1) {
    const a = media[0];
    html += a.kind === 'video'
      ? '<video class="w-full max-h-[420px] rounded-2xl bg-black" controls playsinline preload="metadata" ' + (a.src ? 'src="' + esc(a.src) + '"' : 'data-att-id="' + a.id + '"') + ' data-post-id="' + post.id + '"></video>'
      : attTile(post, a, 'w-full rounded-2xl aspect-[16/10] block');
  } else if (media.length > 1) {
    const shown = media.slice(0, 4);
    html += '<div class="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">' + shown.map((a, i) => {
      const more = i === 3 && media.length > 4 ? '<span class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-title2 font-semibold">+' + (media.length - 4) + '</span>' : '';
      const span = media.length === 3 && i === 0 ? ' row-span-2 aspect-auto h-full' : ' aspect-square';
      return attTile(post, a, 'block' + span, more);
    }).join('') + '</div>';
  }
  if (docs.length) {
    html += '<div class="space-y-2">' + docs.map(a => {
      const info = docInfo(a);
      return '<button type="button" onclick="openViewer(\'' + post.id + '\', \'' + a.id + '\')" class="entry !p-3 w-full flex items-center gap-3 text-left hover:bg-[var(--glass-control-hover)] transition">' +
        '<span class="w-10 h-12 rounded-lg flex items-center justify-center text-white text-caption2 font-bold shrink-0" style="background:' + info.color + '">' + esc(info.label === 'Spreadsheet' ? 'XLS' : info.label.slice(0, 4).toUpperCase()) + '</span>' +
        '<span class="min-w-0 flex-1"><span class="block font-semibold text-subhead truncate">' + esc(a.name) + '</span><span class="block text-footnote text-label-2">' + esc(info.label) + ' · ' + fmtSize(a.size || 0) + '</span></span>' +
        '<span class="text-footnote font-semibold text-blueText shrink-0">Open</span></button>';
    }).join('') + '</div>';
  }
  if (links.length) {
    html += '<div class="space-y-2">' + links.map(a =>
      '<a href="' + esc(a.url) + '" target="_blank" rel="noopener noreferrer" class="entry !p-3 flex items-center gap-3 hover:bg-[var(--glass-control-hover)] transition">' +
        '<span class="w-10 h-10 rounded-xl bg-appleBlue/10 text-blueText flex items-center justify-center shrink-0"><svg class="icon w-5 h-5"><use href="#i-link"/></svg></span>' +
        '<span class="min-w-0 flex-1"><span class="block font-semibold text-subhead truncate">' + esc(a.title || domainOf(a.url)) + '</span><span class="block text-footnote text-label-2 truncate">' + esc(domainOf(a.url)) + '</span></span>' +
        '<svg class="icon w-4 h-4 text-label-3 shrink-0"><use href="#i-chevron"/></svg></a>').join('') + '</div>';
  }
  return '<div class="space-y-2">' + html + '</div>';
}

// Swap placeholders for object URLs of files stored in IndexedDB
function hydrateAttachments(root) {
  root.querySelectorAll('[data-att-id]').forEach(async el => {
    const post = postById(el.dataset.postId);
    const att = post && (post.attachments || []).find(a => a.id === el.dataset.attId);
    const url = att && await attachmentURL(att);
    if (url) { el.src = url; el.removeAttribute('data-att-id'); }
    else el.closest('button, video')?.replaceWith(Object.assign(document.createElement('p'), {
      className: 'text-footnote text-label-2 entry !p-3', textContent: 'This file is no longer stored in this browser.',
    }));
  });
}

// ----- Viewer -----
let viewer = { postId: null, index: 0 };

// Same order as the post shows them: photos and videos, then documents
function viewerItems(post) {
  const atts = post.attachments || [];
  return atts.filter(a => a.kind === 'image' || a.kind === 'video').concat(atts.filter(a => a.kind === 'doc'));
}

function openViewer(postId, attId) {
  const post = postById(postId);
  const items = viewerItems(post);
  viewer = { postId, index: Math.max(0, items.findIndex(a => a.id === attId)) };
  renderViewer(true);
}

function stepViewer(dir) {
  const items = viewerItems(postById(viewer.postId));
  if (items.length < 2) return;
  viewer.index = (viewer.index + dir + items.length) % items.length;
  renderViewer(false);
}

async function renderViewer(first) {
  const post = postById(viewer.postId);
  const items = viewerItems(post);
  const att = items[viewer.index];
  const many = items.length > 1;
  const nav = many
    ? '<button type="button" class="btn btn-gray !min-h-0 !w-10 !h-10 !p-0 absolute left-3 top-1/2 -translate-y-1/2 z-10" onclick="stepViewer(-1)" aria-label="Previous"><svg class="icon w-5 h-5"><use href="#i-back"/></svg></button>' +
      '<button type="button" class="btn btn-gray !min-h-0 !w-10 !h-10 !p-0 absolute right-3 top-1/2 -translate-y-1/2 z-10" onclick="stepViewer(1)" aria-label="Next"><svg class="icon w-5 h-5"><use href="#i-chevron"/></svg></button>'
    : '';
  let stage;
  if (att.kind === 'image') stage = '<img id="viewer-media" class="max-w-full max-h-[70dvh] object-contain mx-auto rounded-xl" alt="' + esc(att.name) + '">';
  else if (att.kind === 'video') stage = '<video id="viewer-media" class="max-w-full max-h-[70dvh] mx-auto rounded-xl bg-black" controls playsinline autoplay></video>';
  else if (extOf(att.name) === 'pdf') stage = '<div id="viewer-pdf" class="space-y-3 max-h-[70dvh] overflow-y-auto px-1"><p class="text-center text-subhead text-label-2 py-10">Loading PDF…</p></div>';
  else stage = '<div class="text-center py-12 space-y-2"><span class="inline-flex w-16 h-20 rounded-xl items-center justify-center text-white font-bold" style="background:' + docInfo(att).color + '">' + esc(docInfo(att).label.slice(0, 4).toUpperCase()) + '</span>' +
    '<p class="font-semibold text-body">' + esc(att.name) + '</p><p class="text-footnote text-label-2">' + esc(docInfo(att).label) + ' · ' + fmtSize(att.size || 0) + '</p>' +
    '<p class="text-footnote text-label-2 max-w-sm mx-auto">Previews for ' + esc(docInfo(att).label) + ' files aren\'t available in the prototype. PDFs, photos, and videos open here.</p></div>';
  openSheet(
    '<div class="relative p-4 sm:p-6 space-y-3">' + sheetClose() +
      '<div class="pr-12"><p id="sheet-title" class="font-semibold text-body truncate">' + esc(att.name) + '</p>' +
      '<p class="text-footnote text-label-2">' + esc(post.title || POST_TYPES[post.type].label) + (many ? ' · ' + (viewer.index + 1) + ' of ' + items.length : '') + '</p></div>' +
      '<div id="viewer-stage" class="relative">' + nav + stage + '</div>' +
    '</div>', '', { wide: true });
  if (first) $('sheet-close').focus();
  const stageEl = $('viewer-stage');
  let touchX = null;
  stageEl.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  stageEl.addEventListener('touchend', e => { if (touchX !== null && Math.abs(e.changedTouches[0].clientX - touchX) > 50) stepViewer(e.changedTouches[0].clientX < touchX ? 1 : -1); touchX = null; });
  if (att.kind === 'image' || att.kind === 'video') {
    const url = await attachmentURL(att);
    if ($('viewer-media')) $('viewer-media').src = url || '';
  } else if (extOf(att.name) === 'pdf') {
    renderPdfPages(att);
  }
}

async function renderPdfPages(att) {
  const box = $('viewer-pdf');
  try {
    const bytes = await attachmentBytes(att);
    if (!bytes) throw new Error('missing');
    await loadScript(CDN + 'pdf.js/3.11.174/pdf.min.js');
    await loadScript(CDN + 'pdf.js/3.11.174/pdf.worker.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = CDN + 'pdf.js/3.11.174/pdf.worker.min.js';
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    if (!$('viewer-pdf')) return;
    box.innerHTML = '';
    const width = Math.min(box.clientWidth || 640, 820);
    for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
      const page = await pdf.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const scale = width / base.width;
      const vp = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
      const canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      canvas.style.width = width + 'px';
      canvas.className = 'mx-auto rounded-lg shadow bg-white max-w-full h-auto';
      canvas.setAttribute('aria-label', 'Page ' + i);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      if (!$('viewer-pdf')) return;
      box.appendChild(canvas);
    }
    if (pdf.numPages > 20) box.insertAdjacentHTML('beforeend', '<p class="text-center text-footnote text-label-2">Showing the first 20 of ' + pdf.numPages + ' pages.</p>');
  } catch {
    if ($('viewer-pdf')) box.innerHTML = '<p class="text-center text-subhead text-label-2 py-10">This PDF couldn\'t be displayed. Check your connection and try again.</p>';
  }
}

document.addEventListener('keydown', e => {
  if ($('sheet').classList.contains('hidden') || !$('viewer-stage')) return;
  if (e.key === 'ArrowRight') stepViewer(1);
  if (e.key === 'ArrowLeft') stepViewer(-1);
});
