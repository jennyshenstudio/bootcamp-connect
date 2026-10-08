// D030: the project is set up to follow Foundation, and its safety checks are in place.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

module.exports = async (browser, t) => {
  t.ok('CLAUDE.md imports Foundation\'s software rules first', read('CLAUDE.md').startsWith('@../Foundation/software.md'));
  t.ok('CLAUDE.md states the tier', /\*\*Tier:\*\* prototype/.test(read('CLAUDE.md')));

  const ignored = read('.gitignore').split('\n');
  t.ok('.env files are kept out of git', ignored.includes('.env') && ignored.includes('.env.*'));

  const deny = JSON.parse(read('.claude/settings.json')).permissions.deny;
  t.ok('Claude is stopped from reading .env', deny.includes('Read(./.env)'));
  t.ok('Claude is stopped from skipping the pre-commit check', deny.includes('Bash(git commit --no-verify:*)'));

  const hook = path.join(root, '.githooks/pre-commit');
  t.ok('the pre-commit check exists and can run', fs.existsSync(hook) && (fs.statSync(hook).mode & 0o111) !== 0);
  t.ok('the pre-commit check scans for secrets and runs the tests', /gitleaks/.test(read('.githooks/pre-commit')) && /npm test/.test(read('.githooks/pre-commit')));
};
