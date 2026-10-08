// Spec 02: one-page profile setup.
const { openApp, signUp, waitForScrollToStop, visible, sleep, fixture, noHorizontalScroll } = require('./helpers');

module.exports = async (browser, t) => {
  const page = await openApp(browser, t);
  await signUp(page, { first: 'Alex', last: 'Chen', email: 'alex@bootcamp.edu' });
  t.ok('name is pre-filled from sign-up', (await page.$eval('#pf-first', e => e.value)) === 'Alex');
  t.ok('strength starts at 0%', (await page.$eval('#strength-pct', e => e.textContent)) === '0%');

  await page.click('#profile-form button[type=submit]'); await sleep(200);
  t.ok('saving without a headline shows an error', await visible(page, 'pf-headline-error'));
  await waitForScrollToStop(page);

  await page.type('#pf-headline', 'Full-stack developer · ex-teacher · building edtech');
  await page.type('#pf-location', 'Leeds');
  await page.click('#pf-setting-0 + .chip');
  await page.type('#pf-about', 'I taught science for 5 years, then switched to code. I build fast and test with real users.');
  await page.type('#pf-linkedin', 'linkedin.com/in/alexchen');
  await page.type('#exp-list [data-field=title]', 'Frontend Developer Intern');
  await page.type('#exp-list [data-field=company]', 'Monzo');
  await page.click('#exp-list [data-field=current]');
  await page.type('#pf-skill-input', 'React'); await page.keyboard.press('Enter');
  await page.type('#pf-skill-input', 'Node.js,');
  await page.click('#skill-suggestions [data-skill="TypeScript"]');
  t.ok('skills added by Enter, comma, and suggestion', (await page.$eval('#skill-count', e => e.textContent)) === '3/10');
  await page.type('#pf-learn-input', 'Stripe'); await page.keyboard.press('Enter');
  t.ok('skills to learn can be added', (await page.$eval('#learn-count', e => e.textContent)) === '1/5');
  await page.type('#proj-list [data-field=title]', 'AI budgeting app');
  await page.click('#pf-goals-0 + .chip'); await page.click('#pf-hours-2 + .chip');
  await page.click('#pf-open-0 + .chip');
  t.ok('Open to lists the three pay types', (await page.$$eval('#pf-open .chip', x => x.map(e => e.textContent).join('|'))) === 'Paid (fixed fee)|Unpaid / volunteer|Equity / co-founder');

  await (await page.$('#pf-photo')).uploadFile(fixture('photo.png')); await sleep(800);
  t.ok('photo appears in the preview', (await page.$eval('#pv-photo', e => e.style.backgroundImage)).startsWith('url("data:image/jpeg'));
  t.ok('strength reaches 100%', (await page.$eval('#strength-pct', e => e.textContent)) === '100%');

  await page.type('#pf-website', 'not a url');
  await page.click('#profile-form button[type=submit]'); await sleep(200);
  t.ok('an invalid link blocks saving', await visible(page, 'pf-website-error'));
  await waitForScrollToStop(page);
  await page.$eval('#pf-website', e => { e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('#profile-form button[type=submit]'); await sleep(300);
  t.ok('profile saves and the banner hides', (await page.$eval('#toast', e => e.textContent)) === 'Profile saved' && !(await visible(page, 'profile-banner')));
  t.ok('links are normalised to https', (await page.$eval('#pf-linkedin', e => e.value)) === 'https://linkedin.com/in/alexchen');
  t.ok('header avatar shows the photo', !!(await page.$eval('#user-avatar', e => e.style.backgroundImage)));

  await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
  await page.click('#user-avatar'); await sleep(200);
  t.ok('header avatar opens the profile', await visible(page, 'tab-profile'));
  t.ok('profile persists after reload',
    (await page.$eval('#pf-headline', e => e.value)).startsWith('Full-stack') && (await page.$$eval('#exp-list .entry', x => x.length)) === 1 &&
    await page.$eval('#exp-list [data-field=end]', e => e.disabled));

  await page.evaluate(() => { const a = currentAccount(); a.profile.goals = ['Paid gig']; saveAccount(a); });
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
  t.ok('old "Paid gig" goal loads as "Paid work"', (await page.$$eval('#pf-goals input:checked', x => x.map(e => e.value).join())) === 'Paid work');

  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => switchTab('profile')); await sleep(200);
  t.ok('profile has no sideways scroll on a phone', await noHorizontalScroll(page));
  await page.close();
};
