// Runs the browser test suites:
//   npm test                 all suites against index.html opened from disk
//   npm test -- feed         suites whose name contains "feed"
//   npm run test:dist        build, then all suites against dist/ served over http (CSP and service worker on)
// Screenshots go to tests/output/ (not committed). Exits non-zero if anything fails.
const fs = require('fs');
const path = require('path');
const { launch, setAppUrl, ROOT } = require('./helpers');

const args = process.argv.slice(2);
const dist = args.includes('--dist');
const filter = args.find(a => !a.startsWith('--')) || '';
const suites = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js') && f.includes(filter)).sort();

(async () => {
  let server = null;
  if (dist) {
    if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
      console.error('dist/ not found. Run `npm run build` first (or use `npm run test:dist`).');
      process.exit(1);
    }
    const { serve } = await import('../scripts/serve.mjs');
    server = await serve(path.join(ROOT, 'dist'));
    setAppUrl('http://127.0.0.1:' + server.address().port + '/');
    console.log('Testing the built site in dist/ at http://127.0.0.1:' + server.address().port + '/');
  }

  const browser = await launch();
  let passed = 0, failed = 0;
  for (const file of suites) {
    console.log('\n' + file.replace('.test.js', ''));
    const t = {
      dist,
      ok(label, cond, detail) {
        if (cond) { passed++; console.log('  ✓ ' + label); }
        else { failed++; console.log('  ✗ ' + label + (detail ? '  [' + detail + ']' : '')); }
      },
      fail(label) { failed++; console.log('  ✗ ' + label); },
    };
    try { await require(path.join(__dirname, file))(browser, t); }
    catch (e) { t.fail('suite crashed: ' + e.message); }
  }
  await browser.close();
  if (server) server.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
