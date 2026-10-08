// D030: the project is set up to follow Foundation, and its safety checks are in place.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

module.exports = async (browser, t) => {
  t.ok('CLAUDE.md imports Foundation\'s software rules first', read('CLAUDE.md').startsWith('@../foundation/software.md'));
  t.ok('CLAUDE.md states the stage', /\*\*Stage:\*\* (alpha|beta|live)/.test(read('CLAUDE.md')));

  const ignored = read('.gitignore').split('\n');
  t.ok('.env files are kept out of git', ignored.includes('.env') && ignored.includes('.env.*'));

  const { deny, ask } = JSON.parse(read('.claude/settings.json')).permissions;
  t.ok('Claude is stopped from reading or editing .env', deny.includes('Read(.env)') && deny.includes('Edit(.env)'));
  t.ok('skipping the pre-commit check needs the owner\'s approval', ask.includes('Bash(git commit *--no-verify*)') && ask.includes('Bash(git *core.hooksPath*)'));

  const hook = path.join(root, '.githooks/pre-commit');
  t.ok('the pre-commit check exists and can run', fs.existsSync(hook) && (fs.statSync(hook).mode & 0o111) !== 0);
  t.ok('the pre-commit check scans for secrets and runs the tests', /gitleaks/.test(read('.githooks/pre-commit')) && /npm test/.test(read('.githooks/pre-commit')));

  // Foundation sits next to this repo on the owner's computer, but not in CI.
  const foundationHook = path.join(root, '..', 'foundation', 'hooks', 'pre-commit');
  if (fs.existsSync(foundationHook)) {
    t.ok('the pre-commit check matches Foundation\'s copy', fs.readFileSync(foundationHook, 'utf8') === read('.githooks/pre-commit'));
  }
};
