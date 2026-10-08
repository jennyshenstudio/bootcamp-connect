// Runs the browser test suites: `npm test` (all) or `npm test -- feed` (suites whose name contains "feed").
// Screenshots go to tests/output/ (not committed). Exits non-zero if anything fails.
const fs = require('fs');
const path = require('path');
const { launch } = require('./helpers');

const filter = process.argv[2] || '';
const suites = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js') && f.includes(filter)).sort();

(async () => {
  const browser = await launch();
  let passed = 0, failed = 0;
  for (const file of suites) {
    console.log('\n' + file.replace('.test.js', ''));
    const t = {
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
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
