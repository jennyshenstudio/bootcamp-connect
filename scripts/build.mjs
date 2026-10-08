// Build the deployable site into dist/ (D028). Run with `npm run build` (which first rebuilds
// css/tailwind.css). No dependencies: Node 18+ only.
//
// dist/ is a plain static site that can be hosted anywhere (GitHub Pages, Netlify, Vercel, S3):
// - index.html gets a Content Security Policy and a data-build stamp (which turns on the service worker)
// - sw.js gets this build's VERSION and the list of files to keep for offline use
// Source files are never changed.

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');

// What the site is made of. Anything else in the repo (docs, tests, specs) is not published.
const ENTRIES = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'assets', 'vendor'];

// Kept in the offline cache at install. pdf.js (about 1.4 MB) is cached the first time it is used.
const PRECACHE_SKIP = [/^vendor\//];

// Content Security Policy for the published site. No inline script is allowed: event handlers
// use data-on-* attributes (js/actions.js). cdnjs serves Mammoth for Word imports (js/import.js).
// Inline style attributes are allowed because avatars and progress bars set colours and sizes.
export const CSP = [
  "default-src 'self'",
  "script-src 'self' https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const toPosix = p => p.split(sep).join('/');

function listFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

export function build() {
  for (const entry of ENTRIES) {
    if (!existsSync(join(ROOT, entry))) throw new Error('Missing ' + entry + '. Run the build from the repository root.');
  }
  if (!existsSync(join(ROOT, 'css', 'tailwind.css'))) throw new Error('Missing css/tailwind.css. Run `npm run build:css` first.');

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  for (const entry of ENTRIES) cpSync(join(ROOT, entry), join(OUT, entry), { recursive: true });
  writeFileSync(join(OUT, '.nojekyll'), ''); // GitHub Pages: publish files as they are

  const files = listFiles(OUT).map(f => toPosix(relative(OUT, f))).filter(f => f !== '.nojekyll').sort();

  // Version = hash of everything published, so any change gives the service worker a new cache
  const hash = createHash('sha256');
  for (const f of files) hash.update(f).update(readFileSync(join(OUT, f)));
  const version = hash.digest('hex').slice(0, 12);

  // index.html: CSP + build stamp
  const indexPath = join(OUT, 'index.html');
  let html = readFileSync(indexPath, 'utf8');
  if (!html.includes('<html lang="en-GB" class="h-full">')) throw new Error('index.html: unexpected <html> tag');
  html = html
    .replace('<html lang="en-GB" class="h-full">', `<html lang="en-GB" class="h-full" data-build="${version}">`)
    .replace(/(<meta name="viewport"[^>]*>)/, `$1\n  <meta http-equiv="Content-Security-Policy" content="${CSP}">`);
  writeFileSync(indexPath, html);

  // sw.js: version and offline file list
  const precache = ['./', ...files.filter(f => f !== 'sw.js' && !PRECACHE_SKIP.some(re => re.test(f)))];
  const swPath = join(OUT, 'sw.js');
  let sw = readFileSync(swPath, 'utf8');
  if (!sw.includes("const VERSION = 'dev';") || !sw.includes('const PRECACHE = [];')) throw new Error('sw.js: build markers not found');
  sw = sw
    .replace("const VERSION = 'dev';", `const VERSION = '${version}';`)
    .replace('const PRECACHE = [];', 'const PRECACHE = ' + JSON.stringify(precache, null, 2) + ';');
  writeFileSync(swPath, sw);

  const bytes = files.reduce((n, f) => n + statSync(join(OUT, f)).size, 0);
  console.log(`Built dist/ (version ${version}): ${files.length} files, ${(bytes / 1024).toFixed(0)} KB, ${precache.length} kept offline.`);
  return { version, files, precache };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) build();
