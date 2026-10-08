// Compile Tailwind CSS (D027): src/styles/tailwind.css + tailwind.config.js -> css/tailwind.css.
// Run with `npm run build:css`, or `npm run build:css -- --watch` while editing markup.
// `npm run build:legacy-css` does the same for the archived prototype in legacy/prototype-v1/.
//
// Uses Tailwind 3.4.17 (the version the old cdn.tailwindcss.com script ran) through npx. To use a
// standalone Tailwind binary instead (no npm access), set TAILWIND_BIN to its path.

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TAILWIND_VERSION = '3.4.17';

const legacy = process.argv.includes('--legacy');
const extra = process.argv.slice(2).filter(a => a !== '--legacy');
const L = 'legacy/prototype-v1/';
const args = legacy
  ? ['-c', L + 'tailwind.config.js', '-i', L + 'src/tailwind.css', '-o', L + 'css/tailwind.css', '--minify', ...extra]
  : ['-c', 'tailwind.config.js', '-i', 'src/styles/tailwind.css', '-o', 'css/tailwind.css', '--minify', ...extra];
const [cmd, cmdArgs] = process.env.TAILWIND_BIN
  ? [process.env.TAILWIND_BIN, args]
  : ['npx', ['--yes', `tailwindcss@${TAILWIND_VERSION}`, ...args]];

const result = spawnSync(cmd, cmdArgs, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
if (result.error) {
  console.error('Could not run Tailwind: ' + result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
