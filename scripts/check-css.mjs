// Checks the committed Tailwind CSS isn't out of date (D027). Run after `npm run build:css` and
// `npm run build:legacy-css` in CI: compares the class names defined in the committed file
// (git HEAD) with the fresh build. Byte-for-byte differences don't matter (different machines can
// add slightly different browser prefixes); a missing or extra class means someone forgot to rebuild.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['css/tailwind.css', 'legacy/prototype-v1/css/tailwind.css'];

// Class names in a stylesheet, with CSS escapes decoded (\: \[ and hex escapes such as \2c )
export function classNames(css) {
  const out = new Set();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const block of clean.matchAll(/([^{}]+)\{/g)) {
    if (block[1].trim().startsWith('@')) continue;
    for (const m of block[1].matchAll(/\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[\w-])+)/g)) {
      out.add(m[1].replace(/\\([0-9a-fA-F]{1,6}) ?|\\(.)/g, (_, hex, ch) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : ch)));
    }
  }
  return out;
}

let stale = false;
for (const file of FILES) {
  const committed = classNames(execFileSync('git', ['show', 'HEAD:' + file], { cwd: ROOT, encoding: 'utf8' }));
  const fresh = classNames(readFileSync(join(ROOT, file), 'utf8'));
  const missing = [...fresh].filter(c => !committed.has(c));
  const extra = [...committed].filter(c => !fresh.has(c));
  if (missing.length || extra.length) {
    stale = true;
    console.log(`::error file=${file}::${file} is out of date. Run 'npm run build:css' (and 'npm run build:legacy-css') and commit the result.` +
      (missing.length ? ` Missing: ${missing.slice(0, 15).join(' ')}.` : '') + (extra.length ? ` No longer used: ${extra.slice(0, 15).join(' ')}.` : ''));
  } else {
    console.log(`${file}: up to date (${fresh.size} classes).`);
  }
}
process.exit(stale ? 1 : 0);
