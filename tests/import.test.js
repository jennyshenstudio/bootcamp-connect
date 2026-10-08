// Spec 03: import a profile from a CV or LinkedIn PDF.
const path = require('path');
const { ROOT, openApp, signUp, visible, sleep, fixture } = require('./helpers');

async function upload(page, file) {
  await (await page.$('#pf-import-file')).uploadFile(file);
  await page.waitForFunction(() => document.getElementById('import-busy').classList.contains('hidden'), { timeout: 30000 });
  await sleep(200);
}
const reviewText = page => page.$eval('#import-review-body', e => e.innerText);
const form = page => page.evaluate(() => { const d = collectProfile(); return { first: d.first, last: d.last, headline: d.headline, location: d.location, website: d.website, exps: d.experience.map(e => e.title + '@' + e.company), skills: d.skills, projects: d.projects.map(p => p.title + '|' + p.link) }; });

module.exports = async (browser, t) => {
  // Built-in reader (no Claude) with a LinkedIn-style PDF
  let page = await openApp(browser, t);
  await signUp(page);
  await upload(page, fixture('linkedin-profile.pdf'));
  t.ok('LinkedIn PDF: summary finds 2 experiences and 3 skills', (await page.$eval('#import-summary', e => e.textContent)).startsWith('Found 2 experiences, 3 skills'));
  t.ok('LinkedIn PDF: uses the basic reader locally', (await page.$eval('#import-method', e => e.textContent)).includes('basic importer'));
  await page.click('button[onclick="applyImport()"]'); await sleep(300);
  let f = await form(page);
  t.ok('LinkedIn PDF: headline, location, and wrapped link are read',
    f.headline === 'Full-Stack Developer | Bootcamp Grad | Ex-Barista' && f.location === 'Seattle, Washington, United States' && (await page.$eval('#pf-linkedin', e => e.value)) === 'www.linkedin.com/in/jordan-lee-dev', JSON.stringify(f));
  t.ok('LinkedIn PDF: companies come from the line above the title', f.exps.join() === 'Software Engineering Intern@Zillow,Shift Supervisor@Starbucks', f.exps.join());
  t.ok('current role disables the end date', await page.$eval('#exp-list [data-field=end]', e => e.disabled));

  await upload(page, fixture('cv-word.docx'));
  t.ok('Word CV: 2 experiences, 6 skills, 1 project', (await page.$eval('#import-summary', e => e.textContent)).startsWith('Found 2 experiences, 6 skills, 1 project'));
  t.ok('fields with a value are marked "replaces what you have"', (await reviewText(page)).includes('replaces what you have'));
  await page.click('button[onclick="resetImport()"]');
  await upload(page, fixture('photo.png'));
  t.ok('an image file is rejected with a clear error', (await page.$eval('#import-error', e => e.textContent)).includes('PDF, Word (.docx), or text'));
  await page.close();

  // The repo's sample CV, signed up with Google so the name is a placeholder
  page = await openApp(browser, t);
  await page.click('#track-dev + div'); await page.click('#terms');
  await page.click('button[onclick="handleGoogle()"]'); await sleep(900);
  t.ok('Google sign-up without a name uses "Google User"', (await page.$eval('#pf-first', e => e.value)) === 'Google');
  await upload(page, path.join(ROOT, 'test-data', 'sample-cv.pdf'));
  t.ok('CV name is offered and ticked', (await page.$eval('label[for="imp-basic-name"]', e => e.innerText)).includes('Maya Okafor (replaces Google User)') && await page.$eval('#imp-basic-name', e => e.checked));
  await page.click('button[onclick="applyImport()"]'); await sleep(300);
  f = await form(page);
  t.ok('sample CV fills every section', f.first === 'Maya' && f.last === 'Okafor' && f.location === 'Chicago, IL' && f.website === 'mayaokafor.dev' &&
    f.exps.length === 3 && f.skills.length === 10 && f.skills.includes('User research') && f.projects[0] === 'ShiftSwap|github.com/mayaokafor/shiftswap' && f.projects.length === 2, JSON.stringify(f));
  await page.click('#pf-goals-1 + .chip'); await page.click('#pf-hours-2 + .chip');
  await page.click('#profile-form button[type=submit]'); await sleep(400);
  t.ok('saved name replaces the sign-up name everywhere', (await page.$eval('#user-avatar', e => e.textContent)) === 'MO' && (await page.$eval('#pv-name', e => e.textContent)) === 'Maya Okafor');
  await page.close();

  // Claude path (published page) with a stand-in that returns fixed data
  page = await openApp(browser, t, {
    beforeLoad: () => {
      const fn = async () => ({ text: '' });
      fn.json = async input => { window.__prompt = input; return { first_name: 'Jordan', last_name: 'Lee', headline: 'Full-Stack Developer', experience: [{ title: 'Intern', company: 'Zillow', start: '2024-06', current: true }], skills: ['React'], projects: [] }; };
      window.claude = { use: async name => name === 'sample' ? fn : null };
    },
  });
  await signUp(page);
  await upload(page, fixture('linkedin-profile.pdf'));
  t.ok('Claude path is used on the published page', (await page.$eval('#import-method', e => e.textContent)).startsWith('Read by Claude'));
  t.ok('the prompt includes the CV text', await page.evaluate(() => window.__prompt.includes('Zillow')));
  await page.close();
};
