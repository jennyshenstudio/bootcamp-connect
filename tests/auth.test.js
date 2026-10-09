// Spec 01: sign-up, log in, log out, one-screen sign-up page.
const { openApp, signUp, visible, sleep, noHorizontalScroll, pageFits } = require('./helpers');

module.exports = async (browser, t) => {
  const shown = (p, sel) => p.$eval(sel, e => e.getClientRects().length > 0);
  let page = await openApp(browser, t);

  // Demo sign-up leads with design A: track, terms and Google; email is behind a link
  t.ok('demo sign-up shows track, terms and Continue with Google, with the email form tucked away',
    await shown(page, 'input[name="track"] + div') && await shown(page, '#terms') && await shown(page, '#google-btn')
    && await shown(page, '#email-toggle') && !(await shown(page, '#email')) && !(await shown(page, '#auth-submit')));
  t.ok('track tiles are large, with the icon above the name',
    await page.$eval('input[name="track"] + div', e => getComputedStyle(e).flexDirection === 'column'));
  await page.click('#email-toggle');
  t.ok('Sign up with email instead shows the email form', await shown(page, '#email') && await shown(page, '#first-name') && !(await shown(page, '#email-toggle')));

  await page.click('#auth-submit');
  t.ok('sign-up without track or terms shows both errors', await visible(page, 'track-error') && await visible(page, 'terms-error'));
  t.ok('dashboard stays hidden after a failed sign-up', !(await visible(page, 'app-dashboard')));
  await page.click('button[data-on-click="handleGoogle()"]');
  t.ok('Google sign-up is blocked until track and terms are chosen', !(await visible(page, 'app-dashboard')));

  await page.click('#mode-login');
  await page.type('#email', 'nobody@example.com'); await page.type('#password', 'password123');
  await page.click('#auth-submit');
  t.ok('log in with an unknown email shows an error', await visible(page, 'auth-error'));

  await page.click('#mode-signup');
  await page.$eval('#auth-form', f => f.reset());
  await signUp(page, { first: 'Alex', last: 'Chen', email: 'alex@bootcamp.edu', track: 'biz' });
  t.ok('new sign-up lands on the profile tab with the banner', await visible(page, 'tab-profile') && await visible(page, 'profile-banner'));
  t.ok('track badge shows Business Dev', (await page.$eval('#user-pill', e => e.textContent)).includes('Business Dev'));
  t.ok('no "Signed in as" line', !(await page.evaluate(() => document.body.innerText.includes('Signed in as'))));

  await page.reload({ waitUntil: 'networkidle0' });
  t.ok('session survives a reload', await visible(page, 'app-dashboard'));

  await page.click('button[data-on-click="logout()"]'); await sleep(800);
  t.ok('log out returns to Log in with the email filled in',
    await visible(page, 'auth-screen') && (await page.$eval('#auth-title', e => e.textContent)) === 'Welcome back' && (await page.$eval('#email', e => e.value)) === 'alex@bootcamp.edu');
  await page.type('#password', 'anything1'); await page.click('#auth-submit'); await sleep(1000);
  t.ok('returning member logs in to the Feed', await visible(page, 'tab-feed') && !(await visible(page, 'profile-banner')));
  await page.close();

  // Terms checkbox (spec 09): agree to the terms, read the privacy notice; both links open
  page = await openApp(browser, t);
  const termsLinks = await page.$$eval('#terms + span a', as => as.map(a => a.textContent.trim()));
  t.ok('terms checkbox links the Terms of Service and the Privacy notice',
    termsLinks.some(x => x.startsWith('Terms of Service')) && termsLinks.some(x => x.startsWith('Privacy notice')), termsLinks.join(' | '));
  await page.close();

  // Live site (spec 09, D033): Google sign-in only, track and terms first
  const live = () => { window.BC_BACKEND = { url: 'https://example.supabase.co', key: 'made-up-test-key' }; };
  page = await openApp(browser, t, { beforeLoad: live });
  t.ok('live sign-up has no name, email or password fields',
    !(await shown(page, '#first-name')) && !(await shown(page, '#email')) && !(await shown(page, '#password')) && !(await shown(page, '#auth-submit')));
  t.ok('live sign-up shows track, terms and one Continue with Google button',
    await shown(page, 'input[name="track"] + div') && await shown(page, '#terms')
    && await shown(page, '#google-btn') && !(await shown(page, '#email-toggle')));
  t.ok('live sign-up says email sign-in is coming later', await shown(page, '#live-note') && !(await shown(page, '#demo-note')));
  await page.click('#google-btn');
  t.ok('live Google sign-up is blocked until track and terms are chosen',
    await visible(page, 'track-error') && await visible(page, 'terms-error') && !(await visible(page, 'app-dashboard')));
  await page.click('#mode-login');
  t.ok('live log in shows only Continue with Google',
    await shown(page, '#google-btn') && !(await shown(page, '#terms')) && !(await shown(page, 'input[name="track"] + div')) && !(await shown(page, '#email')));
  await page.close();
  for (const [width, height, scheme] of [[1280, 650, 'light'], [320, 640, 'dark']]) {
    page = await openApp(browser, t, { width, height, scheme, beforeLoad: live });
    t.ok(`live sign-up fits one screen at ${width}×${height}`, await pageFits(page) && await noHorizontalScroll(page));
    await page.close();
  }

  // Short windows (a browser inside claude.ai is about 700px tall) keep the same design, not a squashed one
  page = await openApp(browser, t, { width: 1470, height: 695 });
  t.ok('on a short window the track tiles stay large and the subtitle shows',
    await page.$eval('input[name="track"] + div', e => getComputedStyle(e).flexDirection === 'column') && await shown(page, '#auth-subtitle'));
  await page.close();

  // The sign-up page fits one screen at common sizes
  for (const [width, height] of [[1440, 900], [1366, 768], [1280, 720], [1280, 650], [390, 844]]) {
    page = await openApp(browser, t, { width, height });
    t.ok(`sign-up fits one screen at ${width}×${height}`, await pageFits(page) && await noHorizontalScroll(page));
    await page.close();
  }
};
